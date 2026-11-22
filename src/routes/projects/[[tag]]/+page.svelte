<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { replaceState } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { ProjectCategory, ProjectData } from '$lib/projects';
	import { ALL_PROJECTS_SLUG, groupFilteredProjects, projectPhotos, toggleFilter } from '$lib/projectGroups';
	import { BENTO_VIEW_OPTIONS, FLOW_GAP, flowTargetHeight, projectFlowItem, yearFlowItem } from '$lib/bentoLayout';
	import { startPageImageLoading } from '$lib/pageImageLoader';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import ProjectSheet from '$lib/components/ProjectSheet.svelte';
	import BentoGrid from '$lib/components/bento/BentoGrid.svelte';
	import BentoIntroTile from '$lib/components/bento/BentoIntroTile.svelte';
	import BentoFlow from '$lib/components/bento/BentoFlow.svelte';
	import CategoryFilterTiles from '$lib/components/bento/CategoryFilterTiles.svelte';
	import YearTile from '$lib/components/bento/YearTile.svelte';
	import ProjectBentoTile from '$lib/components/bento/ProjectBentoTile.svelte';
	import EmptyFilterNote from '$lib/components/bento/EmptyFilterNote.svelte';

	interface Props {
		// Categories already arrive in projects.yaml's tagOrder.
		data: { categories: ProjectCategory[]; projects: ProjectData[] };
	}

	let { data }: Props = $props();

	type FlowEntry = { kind: 'year'; label: string; count: number } | { kind: 'project'; project: ProjectData };

	// /projects with no tag shows everything, the same as /projects/all.
	let selectedFilter = $derived(page.params.tag || ALL_PROJECTS_SLUG);

	function filterHref(slug: string): string {
		return resolve('/projects/[[tag]]', { tag: slug });
	}

	let viewOptions = $derived(BENTO_VIEW_OPTIONS.map((option) => ({ ...option, href: filterHref(option.key) })));

	// One continuous flow: each year tile leads into that year's projects, so rows never end early at a year break.
	let flowEntries = $derived(
		groupFilteredProjects(data.projects, selectedFilter).flatMap((group): FlowEntry[] => [
			{ kind: 'year', label: group.label, count: group.projects.length },
			...group.projects.map((project): FlowEntry => ({ kind: 'project', project }))
		])
	);

	function toFlowItem(entry: FlowEntry, containerWidth: number) {
		return entry.kind === 'year' ? yearFlowItem(entry.label, containerWidth) : projectFlowItem(entry.project, containerWidth);
	}

	let openProject: ProjectData | null = $state(null);
	let mainElement: HTMLElement | undefined = $state();

	// Links like /projects/all#shipwrecked (from the home gallery and About) open that project's sheet.
	onMount(() => {
		const projectId = decodeURIComponent(window.location.hash.slice(1));
		if (projectId) openProject = data.projects.find((project) => project.id === projectId) ?? null;
	});

	// Every project's photo is queued, not just this filter's, so switching filters finds them ready.
	onMount(() => startPageImageLoading(mainElement!, projectPhotos(data.projects)));

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
	<!-- Each filter page has a prerendered Markdown twin (/projects.md, /projects/<tag>.md). -->
	<link
		rel="alternate"
		type="text/markdown"
		href={page.params.tag ? `/projects/${page.params.tag}.md` : '/projects.md'}
	/>
</svelte:head>

<!-- noscroll: switching filters (all links in here) keeps your place instead of jumping to the top. -->
<main bind:this={mainElement} class="projects-page" data-sveltekit-noscroll>
	<div class="page-width">
		<BentoGrid phoneColumns={2}>
			<BentoIntroTile>
				<FilterBar options={viewOptions} activeKey={selectedFilter} label="Show" />
			</BentoIntroTile>
			<!-- Tapping the selected category again goes back to everything. -->
			<CategoryFilterTiles
				categories={data.categories}
				{selectedFilter}
				hrefFor={(slug) => filterHref(toggleFilter(selectedFilter, slug))}
			/>
		</BentoGrid>

		{#if flowEntries.length}
			<BentoFlow entries={flowEntries} {toFlowItem} targetHeight={flowTargetHeight} gap={FLOW_GAP}>
				{#snippet tile(entry)}
					{#if entry.kind === 'year'}
						<YearTile label={entry.label} count={entry.count} />
					{:else}
						<ProjectBentoTile project={entry.project} onOpen={(clicked) => (openProject = clicked)} />
					{/if}
				{/snippet}
			</BentoFlow>
		{:else}
			<EmptyFilterNote />
		{/if}
	</div>

	<ProjectSheet project={openProject} onClose={closeProject} />
</main>

<style>
	.projects-page {
		min-height: 100vh;
		padding: calc(var(--nav-clearance) + 8px) var(--page-gutter) 96px;
		background: var(--color-bg);
		color: var(--color-label);
		font-family: var(--font-text);
		-webkit-font-smoothing: antialiased;
	}

	.page-width {
		max-width: var(--page-max-width);
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	@media (max-width: 560px) {
		.projects-page {
			padding-left: 16px;
			padding-right: 16px;
		}

		.page-width {
			gap: 14px;
		}
	}
</style>
