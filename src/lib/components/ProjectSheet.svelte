<script lang="ts">
	import type { ProjectData } from '$lib/projects';
	import { displayCategories } from '$lib/projectGroups';
	import { imageQueue } from '$lib/imageCache.svelte';
	import ProgressiveImage from './ProgressiveImage.svelte';

	interface Props {
		project: ProjectData | null;
		onClose: () => void;
	}

	let { project, onClose }: Props = $props();

	let dialogElement: HTMLDialogElement | undefined = $state();

	let categoryLine = $derived(
		project ? displayCategories(project).map((category) => category.name).join(' · ') : ''
	);

	// Native <dialog>.showModal() gives us focus trapping, Escape-to-close, an inert page behind,
	// and focus restoration for free, so the component only has to mirror the `project` prop.
	$effect(() => {
		if (!dialogElement) return;
		if (project && !dialogElement.open) dialogElement.showModal();
		if (!project && dialogElement.open) dialogElement.close();
	});

	// The sheet is what the full photo is for; its preview shows while it arrives.
	$effect(() => {
		if (project?.hasThumbnail) imageQueue.boost(project.thumbnail, 'clicked');
	});

	// A click whose target is the <dialog> itself landed on the backdrop, outside the sheet.
	function handleDialogClick(event: MouseEvent) {
		if (event.target === dialogElement) dialogElement?.close();
	}
</script>

<dialog
	bind:this={dialogElement}
	class="project-sheet"
	aria-labelledby="project-sheet-title"
	onclose={onClose}
	onclick={handleDialogClick}
>
	{#if project}
		<div class="sheet-body">
			{#if project.hasThumbnail}
				<div class="sheet-media" style:aspect-ratio={project.thumbnailRatio ?? 4 / 3}>
					<ProgressiveImage
						src={project.thumbnail}
						preview={project.thumbnailPreview}
						alt={project.nameText}
						fit="contain"
					/>
				</div>
			{/if}
			<div class="sheet-text">
				<p class="sheet-meta">
					{project.dateDisplay}{#if project.dateDisplay && categoryLine}&nbsp;·&nbsp;{/if}{categoryLine}
				</p>
				<!-- Markdown from our own projects.yaml, rendered at build time; never user-submitted. -->
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<h2 id="project-sheet-title">{@html project.nameHtml}</h2>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<div class="sheet-description">{@html project.descriptionHtml}</div>
				{#if project.links.length}
					<div class="sheet-links">
						{#each project.links as link (link.url)}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external project links -->
							<a href={link.url} target="_blank" rel="noopener noreferrer" class="sheet-link">
								{link.label}
								<svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12">
									<path d="M3.5 8.5l5-5M4.5 3.5h4v4"></path>
								</svg>
							</a>
						{/each}
					</div>
				{/if}
			</div>
			<button type="button" class="sheet-close" onclick={() => dialogElement?.close()} aria-label="Close project details">
				<svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12">
					<path d="M2 2l8 8M10 2l-8 8"></path>
				</svg>
			</button>
		</div>
	{/if}
</dialog>

<style>
	/* Stop the page scrolling behind an open sheet. */
	:global(html:has(dialog.project-sheet[open])) {
		overflow: hidden;
	}

	.project-sheet {
		width: min(720px, calc(100% - 32px));
		max-width: none;
		max-height: calc(100dvh - 64px);
		margin: auto;
		padding: 0;
		border: 0;
		border-radius: var(--radius-sheet);
		overflow-y: auto;
		color: var(--color-label);
		background: var(--glass-fill-strong);
		backdrop-filter: var(--glass-blur-heavy);
		-webkit-backdrop-filter: var(--glass-blur-heavy);
		box-shadow: var(--glass-edge), var(--shadow-modal);
		font-family: var(--font-text);
	}

	.project-sheet[open] {
		animation: sheet-in var(--duration-settle) var(--ease-spring);
	}

	.project-sheet::backdrop {
		background: var(--backdrop-dim);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	@keyframes sheet-in {
		from {
			opacity: 0;
			transform: translateY(24px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	.sheet-body {
		position: relative;
		padding: 14px;
	}

	/* Sized from the photo's measured ratio so the sheet doesn't jump as it loads; tall photos are
	   capped and letterboxed (fit="contain") rather than cropped. */
	.sheet-media {
		width: 100%;
		max-height: 60dvh;
		overflow: hidden;
		border-radius: var(--radius-sheet-media);
		background: var(--color-bg);
	}

	.sheet-text {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 22px 18px 12px;
	}

	.sheet-meta {
		margin: 0;
		font-size: 13px;
		font-weight: 600;
		color: var(--color-label-secondary);
	}

	h2 {
		margin: 0;
		/* Leaves room for the close button when there's no photo above the title. */
		padding-right: 40px;
		font-family: var(--font-display);
		font-size: 32px;
		line-height: 1.1;
		font-weight: 700;
		letter-spacing: -0.03em;
	}

	.sheet-description {
		font-size: 17px;
		line-height: 1.55;
		color: var(--color-label-secondary);
	}

	.sheet-description :global(p),
	.sheet-description :global(ul),
	.sheet-description :global(ol) {
		margin: 0 0 12px;
	}

	.sheet-description :global(ul),
	.sheet-description :global(ol) {
		padding-left: 1.25rem;
	}

	.sheet-description :global(ul) {
		list-style: disc;
	}

	.sheet-description :global(ol) {
		list-style: decimal;
	}

	h2 :global(a),
	.sheet-description :global(a) {
		color: var(--color-accent);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.sheet-links {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-top: 6px;
	}

	.sheet-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		padding: 0 18px;
		box-sizing: border-box;
		border-radius: var(--radius-pill);
		background: var(--color-inverse);
		color: var(--color-on-inverse);
		font-size: 15px;
		font-weight: 600;
		text-decoration: none;
	}

	.sheet-link:hover {
		background: #000;
	}

	.sheet-link svg,
	.sheet-close svg {
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.sheet-close {
		position: absolute;
		top: 24px;
		right: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: 0;
		border-radius: 50%;
		color: var(--color-label);
		background: var(--glass-fill-chip);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		box-shadow: var(--shadow-chip);
		cursor: pointer;
	}

	.sheet-link:focus-visible,
	.sheet-close:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	@media (max-width: 560px) {
		h2 {
			font-size: 26px;
		}

		.sheet-description {
			font-size: 16px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.project-sheet[open] {
			animation: none;
		}
	}
</style>
