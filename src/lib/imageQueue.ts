// A priority queue for image downloads. On a slow connection, firing every request at once makes
// them all crawl in together; this keeps only a few in flight and always starts the one that
// matters most right now. Framework-free (loading is injected) so it can be unit tested.

/** preview: a photo's first, small image. full: its full-quality file. */
export type ImageKind = 'preview' | 'full';

/** Why the visitor wants a full-quality file sooner than its turn. */
export type ImageBoost = 'clicked' | 'hovered' | 'zoomed';

/** Download order, most important first. */
export const PRIORITY = {
	visiblePreview: 0,
	clicked: 1,
	hovered: 2,
	zoomed: 3,
	offscreenPreview: 4,
	// Full files nobody asked for yet, soonest-on-screen first.
	remainingFull: 5
} as const;

export type PriorityClass = (typeof PRIORITY)[keyof typeof PRIORITY];

/**
 * Which priority class a download is in right now.
 *
 * Args:
 *   kind: preview or full
 *   boost: why the visitor asked for it, if they did
 *   secondsUntilVisible: 0 when on screen now (from the ranker)
 */
export function priorityClassOf(
	kind: ImageKind,
	boost: ImageBoost | null,
	secondsUntilVisible: number
): PriorityClass {
	const ownClass =
		kind === 'preview'
			? secondsUntilVisible === 0
				? PRIORITY.visiblePreview
				: PRIORITY.offscreenPreview
			: PRIORITY.remainingFull;
	return boost ? (Math.min(ownClass, PRIORITY[boost]) as PriorityClass) : ownClass;
}

type JobStatus = 'queued' | 'loading' | 'waiting-to-retry' | 'loaded' | 'failed';

interface Job {
	url: string;
	kind: ImageKind;
	boost: ImageBoost | null;
	status: JobStatus;
	failedAttempts: number;
	/** Set while loading, so the download can be cancelled. */
	controller?: AbortController;
}

export interface ImageQueueOptions {
	/**
	 * Download one image; resolves when it's ready, rejects on a network or decode error. When
	 * `signal` aborts it should drop the request (freeing the connection) and reject.
	 */
	loadImage: (url: string, signal: AbortSignal) => Promise<void>;
	/** Most downloads in flight at once (clicked / hovered ones may go over it). */
	concurrency: number;
	/**
	 * Most full-quality downloads in flight at once (defaults to `concurrency`). Big files split a
	 * slow link between them, so fewer at a time means each finishes, in order, sooner.
	 */
	fullConcurrency?: number;
	/**
	 * Hard cap on downloads in flight, clicked / hovered ones included (default unlimited). Over
	 * HTTP/1.1 a browser opens only 6 connections per site, so staying under that keeps one free
	 * for the page's own requests, like the data for the next page.
	 */
	maxInFlight?: number;
	/** Wait before each retry of a failed download; its length is the retry limit. */
	retryDelaysMs: number[];
	onLoaded?: (url: string) => void;
	/**
	 * While this returns false nothing starts and failures don't use up retries; call retryFailed()
	 * when the connection returns. Defaults to always online.
	 */
	isOnline?: () => boolean;
	/**
	 * Until this returns true only on-screen previews start; call wake() once it does. Browsers keep
	 * the page "loading" (spinner, load event) for every image started before load, so holding the
	 * rest back lets the page finish loading as soon as what's on screen has. Defaults to true.
	 */
	isPageLoaded?: () => boolean;
	/** Injected so tests can control time. */
	setTimer?: (callback: () => void, delayMs: number) => void;
}

interface Candidate {
	job: Job;
	priority: PriorityClass;
	rank: number;
}

export class ImageQueue {
	private jobs = new Map<string, Job>();
	private activeCount = 0;
	private activeFullCount = 0;
	// Seconds until on screen (0 = visible now). Re-read on every pump, so it follows moving content.
	private rankOf: (url: string) => number = () => 0;
	private holdCount = 0;

	constructor(private options: ImageQueueOptions) {}

	/** How soon each image will be on screen (0 = now); re-read every time downloads are scheduled. */
	setRanker(rankOf: (url: string) => number) {
		this.rankOf = rankOf;
	}

	/** Forget a ranker, unless another page has already replaced it with its own. */
	releaseRanker(rankOf: (url: string) => number) {
		if (this.rankOf === rankOf) this.rankOf = () => Infinity;
	}

	/**
	 * Start nothing new until the returned function is called (e.g. during a page navigation).
	 * Holds stack, so overlapping callers each release their own.
	 */
	hold(): () => void {
		this.holdCount++;
		let released = false;
		return () => {
			if (released) return;
			released = true;
			this.holdCount--;
			this.pump();
		};
	}

	/**
	 * Abort downloads in flight to free the connection, except a photo the visitor clicked. They go
	 * back in the queue without using up a retry (any progress on them is lost).
	 */
	cancelActive() {
		for (const job of this.jobs.values()) {
			if (job.status === 'loading' && job.boost !== 'clicked') job.controller?.abort();
		}
	}

	/**
	 * Queue downloads. A URL already known keeps its kind ("preview" wins: it's that photo's first
	 * image), and one that had given up gets a fresh set of retries, since a page wants it again.
	 */
	requestAll(urls: string[], kind: ImageKind) {
		for (const url of urls) {
			const job = this.jobs.get(url);
			if (!job) {
				this.jobs.set(url, { url, kind, boost: null, status: 'queued', failedAttempts: 0 });
				continue;
			}
			if (kind === 'preview') job.kind = 'preview';
			if (job.status === 'failed') this.requeue(job);
		}
		this.pump();
	}

	request(url: string, kind: ImageKind) {
		this.requestAll([url], kind);
	}

	/** Move a full-quality file up because the visitor clicked, hovered, or zoomed. Never lowers a boost. */
	boost(url: string, reason: ImageBoost) {
		let job = this.jobs.get(url);
		if (!job) {
			job = { url, kind: 'full', boost: null, status: 'queued', failedAttempts: 0 };
			this.jobs.set(url, job);
		}
		if (!job.boost || PRIORITY[reason] < PRIORITY[job.boost]) job.boost = reason;
		if (job.status === 'failed' || job.status === 'waiting-to-retry') this.requeue(job);
		this.pump();
	}

	isLoaded(url: string): boolean {
		return this.jobs.get(url)?.status === 'loaded';
	}

	/** Re-check what can start, e.g. once the page has finished loading. */
	wake() {
		this.pump();
	}

	/** Retry everything that failed or is backing off, e.g. when the browser comes back online. */
	retryFailed() {
		for (const job of this.jobs.values()) {
			if (job.status === 'failed' || job.status === 'waiting-to-retry') this.requeue(job);
		}
		this.pump();
	}

	private requeue(job: Job) {
		job.status = 'queued';
		job.failedAttempts = 0;
	}

	private pump() {
		if (this.holdCount > 0 || this.options.isOnline?.() === false) return;
		const pageLoaded = this.options.isPageLoaded?.() ?? true;
		// Ranks read the DOM, so they're taken once per pump rather than once per comparison.
		const unfinished: Candidate[] = [];
		for (const job of this.jobs.values()) {
			if (job.status === 'loaded' || job.status === 'failed') continue;
			const rank = this.rankOf(job.url);
			unfinished.push({ job, rank, priority: priorityClassOf(job.kind, job.boost, rank) });
		}
		const queued = unfinished
			.filter((candidate) => candidate.job.status === 'queued')
			.sort((first, second) => first.priority - second.priority || first.rank - second.rank);

		for (const candidate of queued) {
			// Started jobs change the counts the gates read, so each is re-checked against the latest state.
			if (this.canStart(candidate, unfinished, pageLoaded)) this.start(candidate.job);
		}
	}

	/**
	 * The gates that keep downloads from sharing a slow link with something more important:
	 * full files wait for on-screen previews to finish, and un-asked-for full files for every preview.
	 */
	private canStart({ priority }: Candidate, unfinished: Candidate[], pageLoaded: boolean): boolean {
		if (!pageLoaded && priority !== PRIORITY.visiblePreview) return false;
		const underHardCap = this.activeCount < (this.options.maxInFlight ?? Infinity);
		const slotFree = underHardCap && this.activeCount < this.options.concurrency;
		const fullSlotFree =
			this.activeFullCount < (this.options.fullConcurrency ?? this.options.concurrency);
		const visiblePreviewsPending = unfinished.some(
			(candidate) =>
				candidate.priority === PRIORITY.visiblePreview && candidate.job.status !== 'loaded'
		);
		const anyPreviewsPending = unfinished.some(
			(candidate) => candidate.job.kind === 'preview' && candidate.job.status !== 'loaded'
		);
		switch (priority) {
			case PRIORITY.visiblePreview:
			case PRIORITY.offscreenPreview:
				return slotFree;
			// One photo the visitor picked: worth going over the caps, once what's on screen has loaded.
			case PRIORITY.clicked:
			case PRIORITY.hovered:
				return !visiblePreviewsPending && underHardCap;
			case PRIORITY.zoomed:
				return !visiblePreviewsPending && slotFree && fullSlotFree;
			case PRIORITY.remainingFull:
				return !anyPreviewsPending && slotFree && fullSlotFree;
		}
	}

	private start(job: Job) {
		job.status = 'loading';
		const controller = new AbortController();
		job.controller = controller;
		const isFullFile = job.kind === 'full';
		this.activeCount++;
		if (isFullFile) this.activeFullCount++;
		let download: Promise<void>;
		try {
			download = this.options.loadImage(job.url, controller.signal);
		} catch (error) {
			// A loader that throws instead of rejecting still counts as an ordinary failed download.
			download = Promise.reject(error);
		}
		download
			.then(() => {
				job.status = 'loaded';
				this.options.onLoaded?.(job.url);
			})
			.catch(() => {
				// Cancelled on purpose: says nothing about the image, so it simply waits its turn again.
				if (controller.signal.aborted) job.status = 'queued';
				else this.handleFailure(job);
			})
			.finally(() => {
				job.controller = undefined;
				this.activeCount--;
				if (isFullFile) this.activeFullCount--;
				this.pump();
			});
	}

	private handleFailure(job: Job) {
		// Offline failures say nothing about the image; park it until the connection is back.
		if (this.options.isOnline?.() === false) {
			job.status = 'queued';
			return;
		}
		this.scheduleRetry(job);
	}

	private scheduleRetry(job: Job) {
		const delayMs = this.options.retryDelaysMs[job.failedAttempts];
		job.failedAttempts++;
		if (delayMs === undefined) {
			job.status = 'failed';
			console.warn(
				`Gave up loading ${job.url} after ${job.failedAttempts} tries; it retries when the browser is back online.`
			);
			return;
		}
		job.status = 'waiting-to-retry';
		const setTimer = this.options.setTimer ?? ((callback, ms) => setTimeout(callback, ms));
		setTimer(() => {
			// Skip if something else (boost / retryFailed) already re-queued it.
			if (job.status !== 'waiting-to-retry') return;
			job.status = 'queued';
			this.pump();
		}, delayMs);
	}
}
