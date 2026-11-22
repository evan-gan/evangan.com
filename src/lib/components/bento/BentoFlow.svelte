<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { planBentoRows, type FlowItem, type FlowUnit } from '$lib/bentoFlow';

	interface Props {
		entries: T[];
		/** Sizing rules for one entry; gets the container width so rules can change on phones. */
		toFlowItem: (entry: T, containerWidth: number) => FlowItem;
		targetHeight: (containerWidth: number) => number;
		gap: number;
		tile: Snippet<[T]>;
		/** Width assumed before the container is measured (server render); desktop page width. */
		initialWidth?: number;
	}

	let { entries, toFlowItem, targetHeight, gap, tile, initialWidth = 1200 }: Props = $props();

	let measuredWidth = $state(0);
	let containerWidth = $derived(measuredWidth || initialWidth);
	let rows = $derived(
		planBentoRows(
			entries.map((entry) => toFlowItem(entry, containerWidth)),
			{ containerWidth, gap, targetHeight: targetHeight(containerWidth) }
		)
	);

	// Widths are planned in pixels for this container, then written as percentages so the server
	// render (planned for initialWidth) still fits whatever screen first shows it.
	function percentOfRow(width: number): string {
		return `${(width / containerWidth) * 100}%`;
	}

	function unitKey(unit: FlowUnit): number {
		return unit.kind === 'single' ? unit.index : unit.indices[0];
	}
</script>

<!-- Rows of exact-ratio tiles (and two-tile stacks) planned by planBentoRows; heights come from aspect-ratio. -->
<div class="bento-flow" bind:clientWidth={measuredWidth} style:--flow-gap="{gap}px">
	{#each rows as row, rowIndex (rowIndex)}
		<div class="flow-row">
			{#each row.units as unit (unitKey(unit))}
				{#if unit.kind === 'single'}
					<div class="flow-cell" style:width={percentOfRow(unit.width)} style:aspect-ratio={unit.width / unit.height}>
						{@render tile(entries[unit.index])}
					</div>
				{:else}
					<div class="flow-stack" style:width={percentOfRow(unit.width)}>
						{#each unit.indices as index, position (index)}
							<div class="flow-cell" style:aspect-ratio={unit.width / unit.heights[position]}>
								{@render tile(entries[index])}
							</div>
						{/each}
					</div>
				{/if}
			{/each}
		</div>
	{/each}
</div>

<style>
	.bento-flow {
		display: flex;
		flex-direction: column;
		gap: var(--flow-gap);
	}

	.flow-row {
		display: flex;
		align-items: flex-start;
		gap: var(--flow-gap);
	}

	/* flex-shrink absorbs sub-pixel rounding so a full row never wraps or overflows. */
	.flow-cell,
	.flow-stack {
		flex: 0 1 auto;
		min-width: 0;
	}

	.flow-stack {
		display: flex;
		flex-direction: column;
		gap: var(--flow-gap);
	}

	.flow-stack .flow-cell {
		width: 100%;
	}

	/* Tiles fill their planned cell; StatTile's usual 190px minimum would break the planned height. */
	.flow-cell {
		--stat-tile-min-height: 0px;
	}
</style>
