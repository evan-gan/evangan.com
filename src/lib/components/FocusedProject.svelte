<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { GalleryProject } from '$lib/galleryProject';
	import { displayCategories } from '$lib/projectGroups';
	import {
		computeFocusTarget,
		easeInOutCubic,
		isRectOnScreen,
		lerpBoxState,
		sweepUpDistance,
		transformFromRest,
		type BoxState
	} from '$lib/flight';
	import { prefersReducedMotion, runTween } from '$lib/motion';
	import { imageQueue } from '$lib/imageCache.svelte';
	import ProgressiveImage from './ProgressiveImage.svelte';

	interface Props {
		project: GalleryProject;
		/** The gallery tile the photo flies out of (and back into). It keeps drifting meanwhile. */
		sourceTile: HTMLElement;
		tiltDeg: number;
		/** Where "Check out more" goes (already resolve()d). */
		moreHref: string;
		/** Called once the closing animation has finished. */
		onClosed: () => void;
	}

	let { project, sourceTile, tiltDeg, moreHref, onClosed }: Props = $props();

	const FLY_IN_MS = 620;
	const FLY_BACK_MS = 540;
	const SWEEP_MS = 420;

	let viewportWidth = $state(typeof window === 'undefined' ? 1280 : window.innerWidth);
	let viewportHeight = $state(typeof window === 'undefined' ? 820 : window.innerHeight);
	let rest = $derived(computeFocusTarget(viewportWidth, viewportHeight, project.ratio));

	let cardElement: HTMLElement | undefined = $state();
	let flightElement: HTMLElement | undefined = $state();
	let infoElement: HTMLElement | undefined = $state();
	let closeButton: HTMLButtonElement | undefined = $state();

	let backdropVisible = $state(false);
	let isClosing = false;
	let flightController: AbortController | null = null;
	// Last pose and reveal drawn, so a close that interrupts the fly-in starts from where the card actually is.
	let currentPose: BoxState | null = null;
	let currentReveal = 0;

	let metaLine = $derived(
		[project.dateDisplay, ...displayCategories(project).map((category) => category.name)]
			.filter(Boolean)
			.join(' · ')
	);

	// The tile sits inside the tilted field: its bounding box centre is its true centre, and its
	// layout size (offsetWidth/Height) is its un-rotated size.
	function readTilePose(): BoxState {
		const rect = sourceTile.getBoundingClientRect();
		return {
			centerX: rect.left + rect.width / 2,
			centerY: rect.top + rect.height / 2,
			width: sourceTile.offsetWidth,
			height: sourceTile.offsetHeight,
			rotationDeg: -tiltDeg
		};
	}

	// The text panel rides inside the same transform as the photo, so it scales and tilts with it.
	function drawPose(pose: BoxState) {
		currentPose = pose;
		if (flightElement) flightElement.style.transform = transformFromRest(rest, pose);
	}

	/** Show `fraction` (0 = hidden, 1 = fully shown) of the text panel, unrolling downward. */
	function drawReveal(fraction: number) {
		currentReveal = fraction;
		infoElement?.style.setProperty('clip-path', `inset(0 0 ${(1 - fraction) * 100}% 0)`);
	}

	/**
	 * Tween the card between two poses while the text panel unrolls or rolls up alongside.
	 *
	 * Args:
	 *   readFrom / readTo: re-read every frame so the photo stays attached to the moving tile
	 *   revealFrom / revealTo: text panel visibility at the start and end (0–1)
	 *
	 * Returns:
	 *   true if the tween finished, false if a newer flight aborted it.
	 */
	async function flyBetween(
		readFrom: () => BoxState,
		readTo: () => BoxState,
		revealFrom: number,
		revealTo: number,
		durationMs: number
	) {
		flightController?.abort();
		flightController = new AbortController();
		return runTween({
			durationMs,
			easing: easeInOutCubic,
			signal: flightController.signal,
			onFrame: (progress) => {
				drawPose(lerpBoxState(readFrom(), readTo(), progress));
				drawReveal(revealFrom + (revealTo - revealFrom) * progress);
			}
		});
	}

	async function open() {
		await tick();
		backdropVisible = true;
		if (prefersReducedMotion()) {
			drawReveal(1);
			closeButton?.focus();
			return;
		}
		// Draw at the tile straight away so the first frame never flashes the photo at its resting spot.
		drawPose(readTilePose());
		drawReveal(0);
		// From the tile (tracked live) to the resting pose; rotate, zoom and text reveal happen together.
		const landed = await flyBetween(readTilePose, () => rest, 0, 1, FLY_IN_MS);
		if (!landed || isClosing) return;
		currentPose = rest;
		closeButton?.focus({ preventScroll: true });
	}

	async function sweepUp() {
		if (!cardElement) return;
		const cardBox = cardElement.getBoundingClientRect();
		const distance = sweepUpDistance(cardBox.top, cardBox.height);
		const sweep = cardElement.animate(
			[{ transform: 'translateY(0)' }, { transform: `translateY(${-distance}px)` }],
			{ duration: SWEEP_MS, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' }
		);
		await sweep.finished.catch(() => undefined);
	}

	async function close() {
		if (isClosing) return;
		isClosing = true;
		backdropVisible = false;
		const tileStillVisible = isRectOnScreen(sourceTile.getBoundingClientRect(), viewportWidth, viewportHeight);

		if (prefersReducedMotion()) {
			finishClose(tileStillVisible);
			return;
		}
		if (tileStillVisible) {
			const startPose = currentPose ?? rest;
			// Lands on the tile's live position, so it slots back in even though the row kept moving.
			// The text rolls up from wherever it got to (the fly-in may have been interrupted).
			await flyBetween(() => startPose, readTilePose, currentReveal, 0, FLY_BACK_MS);
		} else {
			flightController?.abort();
			await sweepUp();
		}
		finishClose(tileStillVisible);
	}

	// Focus first: once onClosed runs the parent drops this component and its props stop resolving.
	function finishClose(tileStillVisible: boolean) {
		if (tileStillVisible) sourceTile.focus({ preventScroll: true });
		onClosed();
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
		}
	}

	onMount(() => {
		// Usually already fetched on hover; if not, the preview shows while it catches up.
		imageQueue.boost(project.thumbnail, 'clicked');
		open();
		return () => flightController?.abort();
	});
</script>

<svelte:window
	bind:innerWidth={viewportWidth}
	bind:innerHeight={viewportHeight}
	onkeydown={handleWindowKeydown}
/>

<div class="focus-layer">
	<button
		type="button"
		class="focus-backdrop"
		class:visible={backdropVisible}
		aria-label="Close project"
		tabindex="-1"
		onclick={close}
	></button>

	<div
		bind:this={cardElement}
		class="focus-card"
		role="dialog"
		aria-modal="true"
		aria-labelledby="focus-title"
		style:left="{rest.centerX - rest.width / 2}px"
		style:top="{rest.centerY - rest.height / 2}px"
		style:width="{rest.width}px"
	>
		<div bind:this={flightElement} class="focus-flight" style:transform-origin="50% {rest.height / 2}px">
			<div class="focus-media" style:height="{rest.height}px">
				<ProgressiveImage src={project.thumbnail} preview={project.preview} alt={project.nameText} />
			</div>
			<div bind:this={infoElement} class="focus-info">
				<p class="focus-meta">{metaLine}</p>
				<h2 id="focus-title">{project.nameText}</h2>
				<p class="focus-tagline">{project.taglineText}</p>
				<div class="focus-actions">
					<!-- eslint-disable svelte/no-navigation-without-resolve -- moreHref is resolve()d by the caller; the rest are external -->
					<a href={moreHref} class="focus-more">
						Check out more
						<svg aria-hidden="true" width="12" height="12" viewBox="0 0 14 14"><path d="M5.5 3l4 4-4 4"></path></svg>
					</a>
					{#each project.links as link (link.url)}
						<a href={link.url} target="_blank" rel="noopener noreferrer" class="focus-link">
							{link.label}
							<svg aria-hidden="true" width="11" height="11" viewBox="0 0 12 12"><path d="M3.5 8.5l5-5M4.5 3.5h4v4"></path></svg>
						</a>
					{/each}
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</div>
				<button bind:this={closeButton} type="button" class="focus-close" onclick={close} aria-label="Close project">
					<svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12"><path d="M2 2l8 8M10 2l-8 8"></path></svg>
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.focus-layer {
		position: fixed;
		inset: 0;
		z-index: 1100;
	}

	.focus-backdrop {
		position: absolute;
		inset: 0;
		padding: 0;
		border: 0;
		cursor: default;
		background: var(--focus-backdrop);
		opacity: 0;
		transition: opacity var(--duration-settle) ease;
	}

	.focus-backdrop.visible {
		opacity: 1;
	}

	.focus-card {
		position: absolute;
	}

	/* Holds the flight transform (origin = photo centre, set inline) so the text travels with the
	   photo, while .focus-card stays free for the sweep-up animation. */
	.focus-flight {
		display: flex;
		flex-direction: column;
		will-change: transform;
	}

	.focus-media {
		position: relative;
		z-index: 1;
		display: block;
		width: 100%;
		overflow: hidden;
		border-radius: var(--radius-gallery-tile);
		background: var(--color-gallery-tile);
		box-shadow: var(--shadow-modal);
	}

	/* Tucked under the photo's bottom edge so the reveal reads as the card extending out of it. */
	.focus-info {
		position: relative;
		margin-top: calc(-1 * var(--radius-gallery-tile));
		padding: calc(var(--radius-gallery-tile) + 16px) 22px 20px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		border-radius: 0 0 var(--radius-sheet) var(--radius-sheet);
		color: var(--color-label);
		background: var(--glass-fill-strong);
		backdrop-filter: var(--glass-blur-heavy);
		-webkit-backdrop-filter: var(--glass-blur-heavy);
		box-shadow: var(--glass-edge), var(--shadow-modal);
		clip-path: inset(0 0 100% 0);
	}

	.focus-meta {
		margin: 0;
		font-size: 13px;
		font-weight: 600;
		color: var(--color-label-secondary);
	}

	h2 {
		margin: 0;
		padding-right: 44px;
		font-family: var(--font-display);
		font-size: 28px;
		line-height: 1.15;
		font-weight: 700;
		letter-spacing: -0.025em;
	}

	.focus-tagline {
		margin: 0;
		font-size: 16px;
		line-height: 1.5;
		color: var(--color-label-secondary);
	}

	.focus-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 8px;
	}

	.focus-more,
	.focus-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		padding: 0 18px;
		box-sizing: border-box;
		border-radius: var(--radius-pill);
		font-size: 15px;
		font-weight: 600;
		text-decoration: none;
	}

	.focus-more {
		background: var(--color-inverse);
		color: var(--color-on-inverse);
	}

	.focus-more:hover {
		background: #000;
	}

	.focus-link {
		background: var(--color-surface);
		color: var(--color-accent);
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
	}

	svg {
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.focus-close {
		position: absolute;
		top: calc(var(--radius-gallery-tile) + 12px);
		right: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: 0;
		border-radius: 50%;
		color: var(--color-label);
		background: rgba(118, 118, 128, 0.16);
		cursor: pointer;
	}

	.focus-more:focus-visible,
	.focus-link:focus-visible,
	.focus-close:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	@media (max-width: 480px) {
		h2 {
			font-size: 22px;
		}

		.focus-tagline {
			font-size: 15px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.focus-backdrop {
			transition: none;
		}
	}
</style>
