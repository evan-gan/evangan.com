<script lang="ts">
	import type { ProjectData } from '$lib/projects';
	import { displayCategories, isHighlight } from '$lib/projectGroups';
	import { categoryColorStyle } from '$lib/categoryColors';
	import { imageQueue } from '$lib/imageCache.svelte';
	import { cancelHoverIntent, trackHoverIntent } from '$lib/hoverIntent';
	import { photoElementAttributes } from '$lib/pageImageLoader';
	import ProgressiveImage from './ProgressiveImage.svelte';

	interface Props {
		project: ProjectData;
		onOpen: (project: ProjectData) => void;
	}

	let { project, onOpen }: Props = $props();

	let categories = $derived(displayCategories(project));
	let categoryLine = $derived(categories.map((category) => category.name).join(' · '));
	// Photo-less cards get a fixed 4:3 so their typographic tile has room to breathe.
	// The reserved aspect ratio (measured at build time) stops the masonry reflowing as photos load.
	let mediaRatio = $derived(project.hasThumbnail && project.thumbnailRatio ? project.thumbnailRatio : 4 / 3);

	// Hovering or focusing a card is a good sign its sheet is next, so its full photo moves up.
	function boostFullPhoto() {
		if (project.hasThumbnail) imageQueue.boost(project.thumbnail, 'hovered');
	}
</script>

<button
	type="button"
	class="wall-card"
	style={categoryColorStyle(categories[0]?.slug)}
	onclick={() => onOpen(project)}
	onpointermove={(event) => trackHoverIntent(event, project.id, boostFullPhoto)}
	onpointerleave={cancelHoverIntent}
	onfocus={boostFullPhoto}
>
	<span
		class="wall-media"
		class:note={!project.hasThumbnail}
		style:aspect-ratio={mediaRatio}
		{...project.hasThumbnail ? photoElementAttributes(project.thumbnail) : {}}
	>
		{#if project.hasThumbnail}
			<!-- The page's image loader downloads it (nearest the screen first); this only shows it. -->
			<ProgressiveImage src={project.thumbnail} preview={project.thumbnailPreview} />
		{:else}
			<span class="note-content">
				<span class="note-title">{project.nameText}</span>
				<span class="note-tagline">{project.taglineText}</span>
			</span>
		{/if}
		{#if isHighlight(project)}
			<span class="highlight-badge">
				<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24">
					<path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6z"></path>
				</svg>
				Highlight
			</span>
		{/if}
	</span>
	<span class="caption">
		<span class="caption-name">{project.nameText}</span>
		<span class="caption-meta">
			<span class="category-dot" aria-hidden="true"></span>
			{categoryLine}{#if categoryLine && project.dateDisplay}&nbsp;·&nbsp;{/if}{project.dateDisplay}
		</span>
	</span>
</button>

<style>
	.wall-card {
		display: inline-block;
		width: 100%;
		margin: 0 0 22px;
		padding: 0;
		border: 0;
		background: none;
		text-align: left;
		font: inherit;
		color: inherit;
		cursor: pointer;
		/* Keeps a card from splitting across masonry columns. */
		break-inside: avoid;
		transition: transform var(--duration-settle) var(--ease-spring);
	}

	.wall-card:hover {
		transform: translateY(-3px);
	}

	.wall-card:focus-visible {
		outline: 3px solid var(--color-accent);
		outline-offset: 4px;
		border-radius: var(--radius-card);
	}

	.wall-media {
		position: relative;
		display: block;
		overflow: hidden;
		border-radius: var(--radius-card);
		background: var(--color-surface-sunken);
		transition: box-shadow var(--duration-settle);
	}

	.wall-card:hover .wall-media {
		box-shadow: var(--shadow-lift);
	}

	.wall-media.note {
		background: var(--category-tint);
		color: var(--category-ink);
	}

	.note-content {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		gap: 6px;
		padding: 20px;
	}

	.note-title {
		font-family: var(--font-display);
		font-size: 24px;
		line-height: 1.1;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.note-tagline {
		font-size: 14px;
		line-height: 1.4;
	}

	.highlight-badge {
		position: absolute;
		top: 10px;
		left: 10px;
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 5px 10px 5px 8px;
		border-radius: var(--radius-pill);
		font-size: 12px;
		font-weight: 600;
		color: var(--color-label);
		background: var(--glass-fill-chip);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
	}

	.highlight-badge svg {
		fill: var(--color-highlight-star);
	}

	.caption {
		display: block;
		padding: 12px 4px 0;
	}

	.caption-name {
		display: block;
		font-size: 16px;
		line-height: 1.3;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.caption-meta {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 3px;
		font-size: 13px;
		color: var(--color-label-tertiary);
	}

	.category-dot {
		flex-shrink: 0;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--category-dot);
	}

	@media (prefers-reduced-motion: reduce) {
		.wall-card {
			transition: none;
		}
	}
</style>
