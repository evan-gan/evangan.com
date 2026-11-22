<script lang="ts">
	import type { ProjectCategory } from '$lib/projects';
	import { HIGHLIGHTS_SLUG } from '$lib/projectGroups';
	import { categoryColorTokens } from '$lib/categoryColors';
	import StatTile from '../StatTile.svelte';

	interface Props {
		categories: ProjectCategory[];
		selectedFilter: string;
		/** Link for a category tile (callers make the selected one link back to everything). */
		hrefFor: (slug: string) => string;
	}

	let { categories, selectedFilter, hrefFor }: Props = $props();

	// Highlights is a view, not a category, so it never gets a count tile.
	let filterCategories = $derived(categories.filter((category) => category.name !== HIGHLIGHTS_SLUG));
</script>

<!-- No wrapper: the tiles sit directly in the parent BentoGrid. -->
{#each filterCategories as category (category.name)}
	{@const colors = categoryColorTokens(category.name)}
	{@const isSelected = selectedFilter === category.name}
	<StatTile
		label={category.displayName}
		value={String(category.projects.length)}
		caption={isSelected ? 'showing only these · tap to clear' : 'tap to filter'}
		background={colors.tint}
		ink={colors.ink}
		pressed={isSelected}
		href={hrefFor(category.name)}
	/>
{/each}
