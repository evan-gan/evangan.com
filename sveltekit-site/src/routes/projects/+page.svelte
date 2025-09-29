<script lang="ts">
	import type { ProjectCategory, ProjectData } from '$lib/projects';
	import { onDestroy } from 'svelte';

	export let data: { categories: ProjectCategory[]; projects: ProjectData[] };

	let selectedCategory = 'all';
	let filteredProjects: ProjectData[] = [];
	let activeProject: ProjectData | null = null;

	$:{
		filteredProjects = selectedCategory === 'all'
			? data.projects
			: data.projects.filter((project) => project.categorySlugs.includes(selectedCategory));
	}

	$: {
		if (typeof document !== 'undefined') {
			document.body.style.overflow = activeProject ? 'hidden' : '';
		}
	}

	function openProject(project: ProjectData) {
		activeProject = project;
	}

	function closeProject() {
		activeProject = null;
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && activeProject) {
			event.preventDefault();
			closeProject();
		}
	}

	function handleBackdropKeydown(event: KeyboardEvent) {
		if (event.target !== event.currentTarget) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			closeProject();
		}
	}

	function handleCardKeydown(event: KeyboardEvent, project: ProjectData) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			openProject(project);
		}
	}

	onDestroy(() => {
		if (typeof document !== 'undefined') {
			document.body.style.overflow = '';
		}
	});
</script>

<svelte:window on:keydown={handleWindowKeydown} />

<svelte:head>
	<title>Projects - Evan Gan</title>
</svelte:head>

	<main>
		<div class="container">
			<header class="page-header">
				<h1>My Projects</h1>
				<p>A collection of things I've built and worked on</p>
			</header>

			<!-- Category Filter Slider -->
			<div class="filter-section">
				<div class="filter-slider">
					<button
						class="filter-btn"
						class:active={selectedCategory === 'all'}
						on:click={() => selectedCategory = 'all'}
					>
						All Projects
					</button>
					{#each data.categories as category}
						<button
							class="filter-btn"
							class:active={selectedCategory === category.name}
							on:click={() => selectedCategory = category.name}
						>
							{category.displayName}
						</button>
					{/each}
				</div>
			</div>

			<!-- Projects Grid -->
			<div class="projects-grid">
				{#each filteredProjects as project, index}
					<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
					<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
					<article
						class="project-card"
						style="--card-index: {index}"
						on:click={() => openProject(project)}
						on:keydown={(event) => handleCardKeydown(event, project)}
						tabindex="0"
						aria-label={`View details for ${project.name}`}
					>
						{#if project.thumbnail}
							<div class="project-thumbnail">
								<img src={project.thumbnail} alt={project.name} />
							</div>
						{/if}
						<div class="project-content">
							<div class="project-meta">
								{#if project.dateDisplay}
									<span class="project-date">{project.dateDisplay}</span>
								{/if}
								<div class="project-categories">
									{#each project.categories as categoryName}
										<span class="project-category">{categoryName}</span>
									{/each}
								</div>
							</div>
							<h3 class="project-name">{@html project.nameHtml}</h3>
							{#if project.taglineHtml}
								<p class="project-tagline">{@html project.taglineHtml}</p>
							{/if}
							{#if project.links.length}
								<div class="project-links">
									{#each project.links as link}
										<a
											href={link.url}
											target="_blank"
											rel="noopener"
											class="project-link"
											on:click|stopPropagation
											on:keydown|stopPropagation
										>
											{link.label}
											<span class="external-icon">↗</span>
										</a>
									{/each}
								</div>
							{/if}
						</div>
					</article>
				{/each}
			</div>

			{#if filteredProjects.length === 0}
				<div class="empty-state">
					<h3>No projects found</h3>
					<p>Try selecting a different category or check back soon!</p>
				</div>
			{/if}
		</div>

		{#if activeProject}
			<div
				class="project-modal-backdrop"
				role="button"
				tabindex="0"
				aria-label="Close project dialog"
				on:click|self={closeProject}
				on:keydown={handleBackdropKeydown}
			>
				<div class="project-modal" role="dialog" aria-modal="true" id="project-modal">
					<button type="button" class="modal-close" on:click={closeProject} aria-label="Close project details">
						✕
					</button>
					{#if activeProject.thumbnail}
						<div class="project-modal-thumbnail">
							<img src={activeProject.thumbnail} alt={activeProject.name} />
						</div>
					{/if}
					<div class="project-modal-meta">
						{#if activeProject.dateDisplay}
							<span class="project-date">{activeProject.dateDisplay}</span>
						{/if}
						<div class="project-categories">
							{#each activeProject.categories as categoryName}
								<span class="project-category">{categoryName}</span>
							{/each}
						</div>
					</div>
					<h2 class="project-modal-name">{@html activeProject.nameHtml}</h2>
					<div class="project-modal-description">{@html activeProject.descriptionHtml}</div>
					{#if activeProject.links.length}
						<div class="project-links modal">
							{#each activeProject.links as link}
								<a
									href={link.url}
									target="_blank"
									rel="noopener"
									class="project-link"
								>
									{link.label}
									<span class="external-icon">↗</span>
								</a>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</main>

<style>
	main {
		min-height: 100vh;
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
		padding: 150px 0 80px 0; /* Top padding for navigation */
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 20px;
	}

	.page-header {
		text-align: center;
		margin-bottom: 60px;
	}

	.page-header h1 {
		font-size: 3rem;
		font-weight: 700;
		margin: 0 0 16px 0;
		color: #f8fafc;
	}

	.page-header p {
		font-size: 1.2rem;
		color: #cbd5e1;
		margin: 0;
	}

	.filter-section {
		margin-bottom: 60px;
		display: flex;
		justify-content: center;
	}

	.filter-slider {
		display: flex;
		gap: 8px;
		background: #1e293b;
		padding: 8px;
		border-radius: 16px;
		border: 1px solid #334155;
		overflow-x: auto;
	}

	.filter-btn {
		padding: 12px 24px;
		background: transparent;
		color: #cbd5e1;
		border: none;
		border-radius: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		white-space: nowrap;
	}

	.filter-btn:hover {
		color: #f8fafc;
		background: #334155;
	}

	.filter-btn.active {
		background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
		color: white;
		box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 30px;
		margin-bottom: 60px;
	}

	.project-card {
		background: #1e293b;
		border-radius: 16px;
		overflow: hidden;
		border: 1px solid #334155;
		transition: all 0.3s ease;
		animation: fadeInUp 0.6s ease forwards;
		opacity: 0;
		transform: translateY(30px);
		animation-delay: calc(var(--card-index) * 0.1s);
		position: relative;
		cursor: pointer;
	}

	.project-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
		border-color: #475569;
	}

	.project-card:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 4px;
	}

	.project-thumbnail {
		height: 200px;
		overflow: hidden;
		background: #374151;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.project-thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.project-card:hover .project-thumbnail img {
		transform: scale(1.05);
	}

	.project-content {
		padding: 24px;
	}

	.project-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 12px;
		margin-bottom: 16px;
	}

	.project-date {
		color: #94a3b8;
		font-size: 0.9rem;
		font-weight: 500;
		margin-right: auto;
	}

	.project-categories {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.project-category {
		background: #374151;
		color: #cbd5e1;
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 500;
		text-transform: none;
		white-space: nowrap;
	}

	.project-name {
		font-size: 1.4rem;
		font-weight: 600;
		margin: 0 0 12px 0;
		color: #f8fafc;
		line-height: 1.3;
	}

	.project-tagline {
		margin: 0 0 12px 0;
		color: #cbd5e1;
		font-size: 1rem;
		font-weight: 500;
		line-height: 1.5;
	}

	.project-tagline :global(strong),
	.project-tagline :global(em) {
		color: inherit;
	}

	/* Markdown links inside project description and name */
	.project-name :global(a) {
		color: #60a5fa; /* link blue */
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: color 0.2s ease, text-decoration-color 0.2s ease;
	}

	.project-name :global(a:hover) {
		color: #3b82f6; /* brighter on hover */
		text-decoration-thickness: 2px;
	}

	.project-name :global(a:focus-visible) {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
		border-radius: 2px;
	}

	.project-links {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 12px;
	}

	.project-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: #60a5fa;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.3s ease, gap 0.3s ease;
	}

	.project-link:hover {
		color: #3b82f6;
		gap: 8px;
	}

	.project-modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(2, 6, 23, 0.85);
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 40px 20px;
		backdrop-filter: blur(6px);
		z-index: 1000;
	}

	.project-modal {
		position: relative;
		max-width: 760px;
		width: 100%;
		max-height: 100%;
		overflow-y: auto;
		background: #0f172a;
		border: 1px solid #1f2937;
		border-radius: 20px;
		padding: 40px;
		box-shadow: 0 30px 80px rgba(15, 23, 42, 0.6);
	}

	.modal-close {
		position: absolute;
		top: 18px;
		right: 18px;
		background: rgba(15, 23, 42, 0.9);
		border: 1px solid #334155;
		color: #94a3b8;
		width: 36px;
		height: 36px;
		border-radius: 999px;
		cursor: pointer;
		font-size: 1.1rem;
		line-height: 1;
		transition: all 0.2s ease;
	}

	.modal-close:hover,
	.modal-close:focus-visible {
		color: #f8fafc;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35);
		outline: none;
	}

	.project-modal-thumbnail {
		width: 100%;
		height: 250px;
		overflow: hidden;
		border-radius: 12px;
		background: #374151;
		margin-bottom: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.project-modal-thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.project-modal-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-bottom: 20px;
	}

	.project-modal-name {
		font-size: 2.2rem;
		margin: 0 0 16px 0;
		color: #f8fafc;
		line-height: 1.2;
	}

	.project-modal-tagline {
		margin: 0 0 20px 0;
		color: #cbd5e1;
		font-size: 1.1rem;
		font-weight: 500;
	}

	.project-modal-description {
		color: #cbd5e1;
		line-height: 1.7;
		margin-bottom: 24px;
	}

	.project-modal-description :global(p) {
		margin: 0 0 16px 0;
	}

	.project-modal-description :global(ul),
	.project-modal-description :global(ol) {
		margin: 0 0 16px 1.25rem;
		padding: 0;
	}

	.project-modal-description :global(li) {
		margin-bottom: 6px;
	}

	.project-links.modal {
		margin-top: 20px;
	}

	.external-icon {
		transition: transform 0.3s ease;
	}

	.project-link:hover .external-icon {
		transform: translate(2px, -2px);
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
		color: #cbd5e1;
	}

	.empty-state h3 {
		font-size: 1.5rem;
		margin-bottom: 12px;
		color: #f8fafc;
	}

	@keyframes fadeInUp {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.page-header h1 {
			font-size: 2.5rem;
		}
		
		.projects-grid {
			grid-template-columns: 1fr;
		}
		
		.filter-slider {
			width: 100%;
			overflow-x: auto;
		}
	}
</style>