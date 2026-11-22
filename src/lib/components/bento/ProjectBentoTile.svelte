<script lang="ts">
	import type { ProjectData } from '$lib/projects';
	import { displayCategories, isHighlight } from '$lib/projectGroups';
	import { categoryColorStyle } from '$lib/categoryColors';
	import { imageQueue } from '$lib/imageCache.svelte';
	import { cancelHoverIntent, trackHoverIntent } from '$lib/hoverIntent';
	import { photoElementAttributes } from '$lib/pageImageLoader';
	import ProgressiveImage from '../ProgressiveImage.svelte';

	interface Props {
		project: ProjectData;
		onOpen: (project: ProjectData) => void;
	}

	let { project, onOpen }: Props = $props();

	let categories = $derived(displayCategories(project));
	let roleLine = $derived(categories.map((category) => category.name).join(' · '));

	// Hovering or focusing a tile is a good sign its sheet is next, so its full photo moves up.
	function boostFullPhoto() {
		if (project.hasThumbnail) imageQueue.boost(project.thumbnail, 'hovered');
	}
</script>

<!-- Fills a BentoFlow cell (already sized at the photo's own ratio). Same anatomy as the About affiliation
     tiles: photo, bottom scrim, uppercase category line, big name, plus the tagline when the tile has room. -->
<button
	type="button"
	class="bento-tile"
	class:text-only={!project.hasThumbnail}
	style={categoryColorStyle(categories[0]?.slug)}
	onclick={() => onOpen(project)}
	onpointermove={(event) => trackHoverIntent(event, project.id, boostFullPhoto)}
	onpointerleave={cancelHoverIntent}
	onfocus={boostFullPhoto}
>
	{#if project.hasThumbnail}
		<!-- The page's image loader downloads it (nearest the screen first); this only shows it. -->
		<span class="media" {...photoElementAttributes(project.thumbnail)}>
			<ProgressiveImage src={project.thumbnail} preview={project.thumbnailPreview} />
		</span>
		<span class="scrim"></span>
	{/if}
	{#if isHighlight(project)}
		<span class="highlight-badge">
			<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24">
				<path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6z"></path>
			</svg>
			Highlight
		</span>
	{/if}
	<span class="caption">
		<span class="role">{roleLine}</span>
		<span class="name">{project.nameText}</span>
		<span class="tagline">{project.taglineText}</span>
		<span class="detail">{project.dateDisplay}</span>
	</span>
</button>

<style>
	/* A size container, so the text can adapt to how big the planner made each tile. */
	.bento-tile {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: var(--radius-widget);
		overflow: hidden;
		background: var(--color-inverse);
		color: var(--color-on-inverse);
		font: inherit;
		text-align: left;
		cursor: pointer;
		container-type: size;
		transition:
			transform var(--duration-settle) var(--ease-spring),
			box-shadow var(--duration-settle);
	}

	.bento-tile:hover {
		transform: translateY(-3px);
		box-shadow: var(--shadow-lift);
	}

	.bento-tile:focus-visible {
		outline: 3px solid var(--color-accent);
		outline-offset: 3px;
	}

	.text-only {
		background: var(--category-tint);
		color: var(--category-ink);
	}

	.media {
		position: absolute;
		inset: 0;
		transition: transform 0.6s var(--ease-spring);
	}

	.bento-tile:hover .media {
		transform: scale(1.05);
	}

	/* Strong scrim: many photos are white UI screenshots. */
	.scrim {
		position: absolute;
		inset: 0;
		background: var(--tile-scrim-strong);
	}

	.highlight-badge {
		position: absolute;
		top: 16px;
		left: 16px;
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
		position: absolute;
		left: 20px;
		right: 20px;
		bottom: 18px;
	}

	.caption > span {
		display: block;
	}

	/* The light tint reads on the dark scrim; text-only tiles use the darker ink instead. */
	.role {
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--category-tint);
	}

	.text-only .role {
		color: var(--category-ink);
		opacity: 0.75;
	}

	.name {
		margin-top: 3px;
		font-family: var(--font-display);
		font-size: 22px;
		line-height: 1.08;
		font-weight: 700;
		letter-spacing: -0.025em;
	}

	.detail {
		margin-top: 4px;
		font-size: 13px;
		opacity: 0.85;
	}

	/* .caption prefix: beats `.caption > span { display: block }` above. */
	.caption .tagline {
		display: none;
		margin-top: 5px;
		font-size: 14px;
		line-height: 1.35;
		opacity: 0.92;
	}

	@container (min-width: 230px) and (min-height: 190px) {
		.caption .tagline {
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			overflow: hidden;
		}
	}

	@container (min-width: 460px) and (min-height: 340px) {
		.name {
			font-size: 34px;
			letter-spacing: -0.03em;
		}

		.caption .tagline {
			max-width: 560px;
			font-size: 16px;
			-webkit-line-clamp: 3;
			line-clamp: 3;
		}
	}

	/* Very narrow tiles keep just the name and date. */
	@container (max-width: 170px) {
		.caption .role {
			display: none;
		}

		.name {
			font-size: 18px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bento-tile,
		.media {
			transition: none;
		}
	}
</style>
