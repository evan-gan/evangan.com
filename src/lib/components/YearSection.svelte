<script lang="ts">
	import type { ProjectData } from '$lib/projects';
	import { displayCategories } from '$lib/projectGroups';
	import { categoryColorStyle } from '$lib/categoryColors';
	import ProjectWallCard from './ProjectWallCard.svelte';

	interface Props {
		label: string;
		projects: ProjectData[];
		onOpen: (project: ProjectData) => void;
	}

	let { label, projects, onOpen }: Props = $props();

	let countLabel = $derived(`${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`);
	// One dot per category present this year: a quick read of what kind of year it was.
	let categorySlugs = $derived([
		...new Set(projects.flatMap((project) => displayCategories(project).map((category) => category.slug)))
	]);
	let headingId = $derived(`year-${label.toLowerCase()}`);
</script>

<section class="year-section" aria-labelledby={headingId}>
	<div class="year-heading">
		<h2 id={headingId}>{label}</h2>
		<p>{countLabel}</p>
		<div class="year-dots" aria-hidden="true">
			{#each categorySlugs as slug (slug)}
				<span class="year-dot" style={categoryColorStyle(slug)}></span>
			{/each}
		</div>
	</div>
	<div class="year-wall">
		{#each projects as project (project.id)}
			<ProjectWallCard {project} {onOpen} />
		{/each}
	</div>
</section>

<style>
	.year-section {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 24px 40px;
		margin-top: 56px;
	}

	.year-heading {
		flex: 1 1 160px;
		max-width: 200px;
		position: sticky;
		top: var(--nav-clearance);
	}

	h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 56px;
		line-height: 1;
		font-weight: 700;
		letter-spacing: -0.04em;
	}

	p {
		margin: 8px 0 0;
		font-size: 15px;
		color: var(--color-label-tertiary);
	}

	.year-dots {
		display: flex;
		gap: 6px;
		margin-top: 14px;
	}

	.year-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--category-dot);
	}

	/* CSS columns give a masonry layout that keeps each photo's true aspect ratio. */
	.year-wall {
		flex: 999 1 560px;
		min-width: 0;
		column-width: 250px;
		column-gap: 18px;
	}

	/* Once the heading wraps above the wall, a sticky heading would cover the cards. */
	@media (max-width: 860px) {
		.year-heading {
			position: static;
			max-width: none;
		}

		h2 {
			font-size: 44px;
		}
	}
</style>
