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
		padding: 60px 0 100px 0;
		background: #f8f9fa;
	}

	.container {
		max-width: 1300px;
		margin: 0 auto;
		padding: 0 24px;
	}

	.page-header {
		text-align: center;
		margin-bottom: 60px;
		position: relative;
	}

	.page-header h1 {
		font-size: 3rem;
		font-weight: 700;
		margin: 0 0 16px 0;
		color: #000000;
	}

	.page-header p {
		font-size: 1.1rem;
		color: #6b7280;
		margin: 0;
	}

	.filter-section {
		margin-bottom: 60px;
		display: flex;
		justify-content: center;
	}

	.filter-slider {
		display: flex;
		gap: 12px;
		background: #ffffff;
		padding: 8px;
		border-radius: 16px;
		border: 2px solid #000000;
		overflow-x: auto;
		box-shadow: 4px 4px 0px #000000;
	}

	.filter-btn {
		padding: 12px 24px;
		background: #ffffff;
		color: #000000;
		border: 2px solid transparent;
		border-radius: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		position: relative;
	}

	.filter-btn:hover {
		background: #f3f4f6;
		border-color: #000000;
	}

	.filter-btn.active {
		background: rgba(23, 241, 209, 1);
		color: #000000;
		font-weight: 600;
		border-color: #000000;
		box-shadow: 3px 3px 0px #000000;
		transform: translate(-1px, -1px);
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
		gap: 32px;
		margin-bottom: 80px;
	}

	.project-card {
		background: #ffffff;
		border-radius: 16px;
		overflow: hidden;
		border: 2px solid #000000;
		transition: all 0.2s ease;
		animation: fadeInUp 0.6s ease forwards;
		opacity: 0;
		transform: translateY(30px);
		animation-delay: calc(var(--card-index) * 0.08s);
		position: relative;
		cursor: pointer;
		box-shadow: 4px 4px 0px #000000;
	}

	.project-card:hover {
		transform: translate(-2px, -2px);
		box-shadow: 6px 6px 0px #000000;
	}

	.project-card:focus-visible {
		outline: 3px solid rgba(23, 241, 209, 1);
		outline-offset: 2px;
	}

	.project-thumbnail {
		height: 220px;
		overflow: hidden;
		background: #f3f4f6;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.project-thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s ease;
	}

	.project-card:hover .project-thumbnail img {
		transform: scale(1.05);
	}

	.project-content {
		padding: 28px;
		position: relative;
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
		color: #9ca3af;
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
		background: #ffffff;
		color: rgba(176, 135, 255, 1);
		padding: 6px 14px;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 500;
		text-transform: none;
		white-space: nowrap;
		border: 1px solid rgba(176, 135, 255, 1);
	}

	.project-name {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 14px 0;
		color: #000000;
		line-height: 1.3;
	}

	.project-tagline {
		margin: 0 0 16px 0;
		color: #6b7280;
		font-size: 1rem;
		font-weight: 400;
		line-height: 1.6;
	}

	.project-tagline :global(strong),
	.project-tagline :global(em) {
		color: inherit;
	}

	/* Markdown links inside project description and name */
	.project-name :global(a) {
		color: rgba(23, 241, 209, 1);
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: color 0.2s ease, text-decoration-color 0.2s ease;
	}

	.project-name :global(a:hover) {
		color: rgba(176, 135, 255, 1);
		text-decoration-thickness: 2px;
	}

	.project-name :global(a:focus-visible) {
		outline: 2px solid rgba(23, 241, 209, 1);
		outline-offset: 2px;
		border-radius: 2px;
	}

	.project-links {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		margin-top: 16px;
	}

	.project-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: #000000;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.2s ease;
		padding: 6px 12px;
		border: 2px solid #000000;
		border-radius: 8px;
		background: #ffffff;
	}

	.project-link:hover {
		background: rgba(176, 135, 255, 1);
		gap: 8px;
		transform: translate(-1px, -1px);
		box-shadow: 2px 2px 0px #000000;
	}

	.project-modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 40px 24px;
		backdrop-filter: blur(10px);
		z-index: 1000;
		animation: backdropFadeIn 0.3s ease;
	}

	@keyframes backdropFadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.project-modal {
		position: relative;
		max-width: 800px;
		width: 100%;
		max-height: 100%;
		overflow-y: auto;
		background: #ffffff;
		border: 3px solid #000000;
		border-radius: 20px;
		padding: 48px;
		box-shadow: 8px 8px 0px #000000;
		animation: modalSlideIn 0.3s ease;
	}

	@keyframes modalSlideIn {
		from { 
			opacity: 0;
			transform: translate(-4px, -4px);
		}
		to { 
			opacity: 1;
			transform: translate(0, 0);
		}
	}

	.modal-close {
		position: absolute;
		top: 20px;
		right: 20px;
		background: rgba(255, 208, 116, 1);
		border: 2px solid #000000;
		color: #000000;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 1.2rem;
		line-height: 1;
		font-weight: 700;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 2px 2px 0px #000000;
	}

	.modal-close:hover,
	.modal-close:focus-visible {
		background: rgba(23, 241, 209, 1);
		outline: none;
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px #000000;
	}

	.project-modal-thumbnail {
		width: 100%;
		height: clamp(320px, 60vh, 520px);
		max-height: 65vh;
		overflow: hidden;
		border-radius: 12px;
		background: #f3f4f6;
		margin-bottom: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid #000000;
	}

	.project-modal-thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.project-modal-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		margin-bottom: 24px;
	}

	.project-modal-name {
		font-size: 2.5rem;
		font-weight: 700;
		margin: 0 0 24px 0;
		color: #000000;
		line-height: 1.2;
	}

	.project-modal-description {
		color: #4b5563;
		line-height: 1.8;
		margin-bottom: 32px;
		font-size: 1.1rem;
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
		margin-top: 32px;
	}

	.external-icon {
		transition: transform 0.2s ease;
		font-size: 0.9rem;
	}

	.project-link:hover .external-icon {
		transform: translate(2px, -2px);
	}

	.empty-state {
		text-align: center;
		padding: 80px 24px;
		color: #6b7280;
	}

	.empty-state h3 {
		font-size: 1.8rem;
		margin-bottom: 16px;
		color: #000000;
	}

	@keyframes fadeInUp {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		main {
			padding: 40px 0 80px 0;
		}
		
		.page-header {
			margin-bottom: 40px;
		}
		
		.page-header h1 {
			font-size: 2.5rem;
		}
		
		.page-header p {
			font-size: 1.1rem;
		}
		
		.projects-grid {
			grid-template-columns: 1fr;
			gap: 24px;
		}
		
		.filter-slider {
			width: 100%;
			overflow-x: auto;
			padding: 10px;
		}
		
		.project-card {
			margin: 0 4px;
		}
		
		.project-modal-thumbnail {
			height: clamp(240px, 50vh, 380px);
			max-height: 55vh;
		}
		
		.project-modal {
			padding: 32px 24px;
			margin: 20px;
		}
		
		.project-modal-name {
			font-size: 2rem;
		}
		
		.container {
			padding: 0 20px;
		}
	}
</style>