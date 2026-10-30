<script
	lang="ts"
	generics="T extends { id: string; nameText: string; thumbnail: string; preview: string | null; ratio: number }"
>
	import { onMount } from 'svelte';
	import { planGalleryLayout, TILE_GAP, TILT_DEGREES } from '$lib/gallery';
	import { startGalleryImageLoading, tileDataAttributes } from '$lib/galleryImageLoader';
	import { imageQueue } from '$lib/imageCache.svelte';
	import { cancelHoverIntent, trackHoverIntent } from '$lib/hoverIntent';
	import ProgressiveImage from './ProgressiveImage.svelte';

	interface Props {
		items: T[];
		/** `tileKey` identifies the exact tile clicked (each photo appears in two passes). */
		onSelect: (item: T, tileElement: HTMLElement, tileKey: string) => void;
		/** A tile to leave as an empty slot, e.g. while its photo is shown enlarged elsewhere. */
		hiddenTileKey?: string | null;
	}

	let { items, onSelect, hiddenTileKey = null }: Props = $props();

	// Server render assumes a typical laptop; the layout re-plans for the real window on hydration.
	let viewportWidth = $state(1280);
	let viewportHeight = $state(820);

	let layout = $derived(planGalleryLayout(items, viewportWidth, viewportHeight));
	// Each row's track holds the tiles twice; sliding it by exactly half makes the loop seamless.
	const PASSES = [0, 1] as const;

	let galleryElement: HTMLElement | undefined = $state();

	onMount(() => {
		const stopLoading = startGalleryImageLoading({
			root: galleryElement!,
			photos: items,
			getRowHeight: () => layout.rowHeight
		});
		return () => {
			stopLoading();
			cancelHoverIntent();
		};
	});
</script>

<svelte:window bind:innerWidth={viewportWidth} bind:innerHeight={viewportHeight} />

<section bind:this={galleryElement} class="gallery" aria-label="Project photos">
	<div
		class="gallery-field"
		style:width="{layout.fieldWidth}px"
		style:height="{layout.fieldHeight}px"
		style:gap="{TILE_GAP}px"
		style:--tilt="-{TILT_DEGREES}deg"
	>
		{#each layout.rows as row, rowIndex (rowIndex)}
			<div class="gallery-row" style:height="{layout.rowHeight}px">
				<div
					class="gallery-track"
					style:animation-duration="{row.durationSeconds}s"
					style:animation-delay="{row.delaySeconds}s"
				>
					{#each PASSES as pass (pass)}
						{#each row.tiles as tile (tile.id)}
							{@const tileKey = `${pass}-${tile.id}`}
							<!-- The second pass is a visual copy only: hidden from screen readers and the tab order. -->
							<button
								type="button"
								class="gallery-tile"
								style:width="{tile.ratio * layout.rowHeight}px"
								style:margin-right="{TILE_GAP}px"
								aria-label={`Preview ${tile.nameText}`}
								aria-hidden={pass === 1 ? 'true' : undefined}
								tabindex={pass === 1 ? -1 : 0}
								style:visibility={tileKey === hiddenTileKey ? 'hidden' : undefined}
								{...tileDataAttributes(tile.id, row.loopWidth, row.loopWidth / row.durationSeconds)}
								onpointermove={(event) =>
										trackHoverIntent(event, tile.id, () => imageQueue.boost(tile.thumbnail, 'hovered'))}
								onpointerleave={cancelHoverIntent}
								onfocus={() => imageQueue.boost(tile.thumbnail, 'hovered')}
								onclick={(event) => onSelect(tile, event.currentTarget, tileKey)}
							>
								<ProgressiveImage src={tile.thumbnail} preview={tile.preview} />
							</button>
						{/each}
					{/each}
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.gallery {
		position: absolute;
		inset: 0;
		overflow: hidden;
		background: var(--color-gallery-ground);
	}

	.gallery-field {
		position: absolute;
		top: 50%;
		left: 50%;
		display: flex;
		flex-direction: column;
		transform: translate(-50%, -50%) rotate(var(--tilt));
	}

	.gallery-row {
		flex-shrink: 0;
	}

	.gallery-track {
		display: flex;
		width: max-content;
		height: 100%;
		animation-name: drift-right;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
		will-change: transform;
	}

	@keyframes drift-right {
		from {
			transform: translateX(-50%);
		}
		to {
			transform: translateX(0);
		}
	}

	.gallery-tile {
		flex-shrink: 0;
		height: 100%;
		padding: 0;
		border: 0;
		border-radius: var(--radius-gallery-tile);
		overflow: hidden;
		cursor: pointer;
		background: var(--color-gallery-tile);
		transition:
			transform var(--duration-settle) var(--ease-spring),
			box-shadow var(--duration-settle),
			filter var(--duration-settle);
	}

	.gallery-tile:hover {
		transform: scale(1.03);
		box-shadow: var(--shadow-gallery-hover);
		filter: brightness(1.06);
	}

	.gallery-tile:focus-visible {
		outline: 3px solid var(--color-on-inverse);
		outline-offset: 3px;
	}

	@media (prefers-reduced-motion: reduce) {
		.gallery-track {
			animation: none;
		}

		.gallery-tile {
			transition: none;
		}
	}
</style>
