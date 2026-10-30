<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { replaceState } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { ProjectCategory, ProjectData } from '$lib/projects';
	import { buildFilterItems, groupProjectsByYear, matchesFilter } from '$lib/projectGroups';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import YearSection from '$lib/components/YearSection.svelte';
	import ProjectSheet from '$lib/components/ProjectSheet.svelte';
	import { startPageImageLoading } from '$lib/pageImageLoader';

	interface Props {
		data: { categories: ProjectCategory[]; projects: ProjectData[]; tagOrder: string[] };
	}

	let { data }: Props = $props();

	// /projects with no tag shows highlights, matching the first entry of tagOrder.
	const DEFAULT_FILTER = 'highlights';

	let selectedFilter = $derived(page.params.tag || DEFAULT_FILTER);
	let filterOptions = $derived(
		buildFilterItems(data.categories, data.tagOrder).map((item) => ({
			href: resolve('/projects/[[tag]]', { tag: item.slug }),
			label: item.label
		}))
	);
	let yearGroups = $derived(
		groupProjectsByYear(data.projects.filter((project) => matchesFilter(project, selectedFilter)))
	);

	let openProject: ProjectData | null = $state(null);
	let mainElement: HTMLElement | undefined = $state();

	// Links like /projects/all#shipwrecked (from the home gallery) open that project's sheet.
	onMount(() => {
		const projectId = decodeURIComponent(window.location.hash.slice(1));
		if (projectId) openProject = data.projects.find((project) => project.id === projectId) ?? null;
	});

	// Every project's photo is queued, not just this filter's, so switching filters finds them ready.
	onMount(() =>
		startPageImageLoading(
			mainElement!,
			data.projects
				.filter((project) => project.hasThumbnail)
				.map((project) => ({ thumbnail: project.thumbnail, preview: project.thumbnailPreview }))
		)
	);

	// Drop the hash on close so a refresh or Back doesn't pop the sheet open again.
	function closeProject() {
		openProject = null;
		if (window.location.hash) {
			replaceState(resolve('/projects/[[tag]]', { tag: page.params.tag }), page.state);
		}
	}
</script>

<svelte:head>
	<title>Projects - Evan Gan</title>
</svelte:head>

<main bind:this={mainElement}>
	<div class="container">
		<header class="page-header">
			<h1>Projects</h1>
			<p>A collection of things I've built and worked on</p>
		</header>

		<FilterBar options={filterOptions} activeHref={resolve('/projects/[[tag]]', { tag: selectedFilter })} label="Filter projects" />

		{#each yearGroups as group (group.label)}
			<YearSection label={group.label} projects={group.projects} onOpen={(project) => (openProject = project)} />
		{:else}
			<div class="empty-state">
				<h2>No projects here yet</h2>
				<p>Try a different category.</p>
			</div>
		{/each}
	</div>

	<ProjectSheet project={openProject} onClose={closeProject} />
</main>

<style>
	main {
		min-height: 100vh;
		padding: calc(var(--nav-clearance) + 24px) 0 96px;
		background: var(--color-bg);
		color: var(--color-label);
		font-family: var(--font-text);
		-webkit-font-smoothing: antialiased;
	}

	.container {
		max-width: var(--page-max-width);
		margin: 0 auto;
		padding: 0 var(--page-gutter);
	}

	.page-header {
		margin-bottom: 28px;
	}

	h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 64px;
		line-height: 1;
		font-weight: 700;
		letter-spacing: -0.035em;
	}

	.page-header p {
		margin: 10px 0 0;
		font-size: 19px;
		color: var(--color-label-secondary);
	}

	.empty-state {
		margin-top: 40px;
		padding: 64px 24px;
		border-radius: var(--radius-sheet);
		text-align: center;
		background: var(--color-surface);
	}

	.empty-state h2 {
		margin: 0;
		font-size: 21px;
		font-weight: 600;
	}

	.empty-state p {
		margin: 6px 0 0;
		font-size: 15px;
		color: var(--color-label-secondary);
	}

	@media (max-width: 560px) {
		h1 {
			font-size: 44px;
		}

		.page-header p {
			font-size: 17px;
		}
	}
</style>
