<script lang="ts">
	import { dev } from '$app/environment';
	import { resolve } from '$app/paths';
	import type { GalleryProject } from '$lib/galleryProject';
	import { TILT_DEGREES } from '$lib/gallery';
	import DriftingGallery from '$lib/components/DriftingGallery.svelte';
	import FocusedProject from '$lib/components/FocusedProject.svelte';
	import StripeWord from '$lib/components/StripeWord.svelte';

	interface Props {
		data: { galleryProjects: GalleryProject[] };
	}

	let { data }: Props = $props();

	const SECTION_LINKS = [
		{ href: resolve('/about'), label: 'about' },
		{ href: resolve('/projects'), label: 'projects' },
		...(dev ? [{ href: resolve('/editor'), label: 'editor' }] : [])
	];

	interface Selection {
		project: GalleryProject;
		tileElement: HTMLElement;
		tileKey: string;
	}

	let selection: Selection | null = $state(null);

	// "All projects" so the project is guaranteed to be on the page; the hash tells it which sheet to open.
	function projectPageHref(project: GalleryProject): string {
		return `${resolve('/projects/[[tag]]', { tag: 'all' })}#${project.id}`;
	}
</script>

<svelte:head>
	<title>Evan Gan</title>
</svelte:head>

<main>
	<DriftingGallery
		items={data.galleryProjects}
		hiddenTileKey={selection?.tileKey}
		onSelect={(project, tileElement, tileKey) => (selection = { project, tileElement, tileKey })}
	/>

	<div class="panel-layer">
		<nav aria-label="Sections" class="word-panel">
			{#each SECTION_LINKS as link (link.href)}
				<StripeWord href={link.href} label={link.label} />
			{/each}
		</nav>
	</div>

	{#if selection}
		<!-- Keyed so picking a new photo always starts a fresh fly-in. -->
		{#key selection.tileKey}
			<FocusedProject
				project={selection.project}
				sourceTile={selection.tileElement}
				tiltDeg={TILT_DEGREES}
				moreHref={projectPageHref(selection.project)}
				onClosed={() => (selection = null)}
			/>
		{/key}
	{/if}
</main>

<style>
	main {
		position: relative;
		height: 100vh;
		height: 100dvh;
		overflow: hidden;
		font-family: var(--font-text);
		-webkit-font-smoothing: antialiased;
	}

	/* Spans the screen only to centre the panel; clicks on the empty area fall through to the photos. */
	.panel-layer {
		position: absolute;
		inset: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--nav-clearance) 16px 72px;
		pointer-events: none;
	}

	.word-panel {
		pointer-events: auto;
		width: 476px;
		max-width: 100%;
		box-sizing: border-box;
		padding: 56px 48px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		border-radius: var(--radius-panel);
		background: rgba(255, 255, 255, 0.66);
		backdrop-filter: var(--glass-blur-heavy);
		-webkit-backdrop-filter: var(--glass-blur-heavy);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.9),
			inset 0 0 0 1px rgba(255, 255, 255, 0.45),
			var(--shadow-panel);
		font-family: var(--font-display);
		font-weight: 700;
		font-size: clamp(56px, 16vw, 104px);
		line-height: 0.82;
		letter-spacing: -0.05em;
	}

	@media (max-width: 480px) {
		.word-panel {
			padding: 40px 24px;
			border-radius: 32px;
		}
	}
</style>
