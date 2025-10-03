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
		padding: 160px 0 100px 0; /* Top padding for navigation */
		background: 
			radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
			radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 50%);
	}

	.container {
		max-width: 1300px;
		margin: 0 auto;
		padding: 0 24px;
	}

	.page-header {
		text-align: center;
		margin-bottom: 80px;
		position: relative;
	}

	.page-header h1 {
		font-size: 3.5rem;
		font-weight: 700;
		margin: 0 0 20px 0;
		background: linear-gradient(135deg, #f1f5f9 0%, #a855f7 50%, #06b6d4 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		position: relative;
	}

	.page-header h1::after {
		content: '';
		position: absolute;
		bottom: -15px;
		left: 50%;
		transform: translateX(-50%);
		width: 80px;
		height: 4px;
		background: linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981);
		border-radius: 2px;
	}

	.page-header p {
		font-size: 1.3rem;
		color: #e2e8f0;
		margin: 0;
		max-width: 600px;
		margin: 0 auto;
	}

	.filter-section {
		margin-bottom: 80px;
		display: flex;
		justify-content: center;
	}

	.filter-slider {
		display: flex;
		gap: 12px;
		background: rgba(30, 27, 61, 0.6);
		padding: 12px;
		border-radius: 20px;
		border: 1px solid rgba(139, 92, 246, 0.2);
		overflow-x: auto;
		backdrop-filter: blur(10px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}

	.filter-btn {
		padding: 14px 28px;
		background: transparent;
		color: #cbd5e1;
		border: none;
		border-radius: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.4s ease;
		white-space: nowrap;
		position: relative;
		overflow: hidden;
	}

	.filter-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
		transition: left 0.6s ease;
	}

	.filter-btn:hover::before {
		left: 100%;
	}

	.filter-btn:hover {
		color: #f1f5f9;
		background: rgba(139, 92, 246, 0.15);
		transform: translateY(-2px);
	}

	.filter-btn.active {
		background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
		color: white;
		box-shadow: 
			0 6px 24px rgba(139, 92, 246, 0.4),
			0 0 0 1px rgba(255, 255, 255, 0.1);
		transform: translateY(-2px);
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
		gap: 32px;
		margin-bottom: 80px;
	}

	.project-card {
		background: rgba(30, 27, 61, 0.4);
		border-radius: 20px;
		overflow: hidden;
		border: 1px solid rgba(139, 92, 246, 0.2);
		transition: all 0.4s ease;
		animation: fadeInUp 0.8s ease forwards;
		opacity: 0;
		transform: translateY(40px);
		animation-delay: calc(var(--card-index) * 0.1s);
		position: relative;
		cursor: pointer;
		backdrop-filter: blur(10px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	}

	.project-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.05));
		opacity: 0;
		transition: opacity 0.4s ease;
		border-radius: 20px;
	}

	.project-card:hover::before {
		opacity: 1;
	}

	.project-card:hover {
		transform: translateY(-12px) scale(1.02);
		box-shadow: 
			0 20px 60px rgba(0, 0, 0, 0.3),
			0 0 0 1px rgba(139, 92, 246, 0.3);
		border-color: rgba(139, 92, 246, 0.4);
	}

	.project-card:focus-visible {
		outline: 2px solid #8b5cf6;
		outline-offset: 4px;
	}

	.project-thumbnail {
		height: 220px;
		overflow: hidden;
		background: rgba(55, 65, 81, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.project-thumbnail::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1));
		opacity: 0;
		transition: opacity 0.4s ease;
	}

	.project-card:hover .project-thumbnail::before {
		opacity: 1;
	}

	.project-thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s ease;
	}

	.project-card:hover .project-thumbnail img {
		transform: scale(1.08);
	}

	.project-content {
		padding: 28px;
		position: relative;
		z-index: 2;
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
		background: rgba(139, 92, 246, 0.15);
		color: #c4b5fd;
		padding: 6px 14px;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 500;
		text-transform: none;
		white-space: nowrap;
		border: 1px solid rgba(139, 92, 246, 0.3);
	}

	.project-name {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 14px 0;
		color: #f1f5f9;
		line-height: 1.3;
	}

	.project-tagline {
		margin: 0 0 16px 0;
		color: #e2e8f0;
		font-size: 1rem;
		font-weight: 500;
		line-height: 1.6;
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
		gap: 16px;
		margin-top: 16px;
	}

	.project-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: #a855f7;
		text-decoration: none;
		font-weight: 500;
		transition: all 0.3s ease;
	}

	.project-link:hover {
		color: #06b6d4;
		gap: 8px;
	}

	.project-modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(10, 15, 28, 0.9);
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 40px 24px;
		backdrop-filter: blur(20px);
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
		background: rgba(30, 27, 61, 0.9);
		border: 1px solid rgba(139, 92, 246, 0.3);
		border-radius: 24px;
		padding: 48px;
		box-shadow: 
			0 40px 100px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		animation: modalSlideIn 0.4s ease;
	}

	@keyframes modalSlideIn {
		from { 
			opacity: 0;
			transform: translateY(30px) scale(0.95);
		}
		to { 
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.modal-close {
		position: absolute;
		top: 20px;
		right: 20px;
		background: rgba(30, 27, 61, 0.8);
		border: 1px solid rgba(139, 92, 246, 0.3);
		color: #cbd5e1;
		width: 40px;
		height: 40px;
		border-radius: 12px;
		cursor: pointer;
		font-size: 1.2rem;
		line-height: 1;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(10px);
	}

	.modal-close:hover,
	.modal-close:focus-visible {
		color: #f1f5f9;
		border-color: #8b5cf6;
		background: rgba(139, 92, 246, 0.2);
		box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
		outline: none;
		transform: scale(1.05);
	}

	.project-modal-thumbnail {
		width: 100%;
		height: 280px;
		overflow: hidden;
		border-radius: 16px;
		background: rgba(55, 65, 81, 0.5);
		margin-bottom: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(139, 92, 246, 0.2);
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
		color: #f1f5f9;
		line-height: 1.2;
		background: linear-gradient(135deg, #f1f5f9 0%, #a855f7 50%, #06b6d4 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.project-modal-description {
		color: #e2e8f0;
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
		transition: transform 0.4s ease;
		font-size: 0.9rem;
	}

	.project-link:hover .external-icon {
		transform: translate(3px, -3px) rotate(45deg);
	}

	.empty-state {
		text-align: center;
		padding: 80px 24px;
		color: #e2e8f0;
	}

	.empty-state h3 {
		font-size: 1.8rem;
		margin-bottom: 16px;
		color: #f1f5f9;
	}

	@keyframes fadeInUp {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.page-header h1 {
			font-size: 2.8rem;
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
			margin: 0 4px; /* Prevent grid overflow on mobile */
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