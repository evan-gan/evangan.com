<script lang="ts">
	import type { ProjectCategory, ProjectData } from '$lib/projects';

	export let data: { categories: ProjectCategory[]; projects: ProjectData[] };

	let selectedCategory = 'all';
	let filteredProjects: ProjectData[] = [];

	$:{
		filteredProjects = selectedCategory === 'all'
			? data.projects
			: data.projects.filter((project) => project.categorySlugs.includes(selectedCategory));
	}
</script>

<svelte:head>
	<title>Projects - Evan Gans</title>
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
				<div class="project-card" style="--card-index: {index}">
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
						<div class="project-description">{@html project.descriptionHtml}</div>
						{#if project.links.length}
							<div class="project-links">
								{#each project.links as link}
									<a
										href={link.url}
										target="_blank"
										rel="noopener"
										class="project-link"
										data-type={link.type}
									>
										{link.label}
										<span class="external-icon">↗</span>
									</a>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		{#if filteredProjects.length === 0}
			<div class="empty-state">
				<h3>No projects found</h3>
				<p>Try selecting a different category or check back soon!</p>
			</div>
		{/if}
	</div>
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
	}

	.project-card:hover {
		transform: translateY(-8px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
		border-color: #475569;
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
		color: #94a3b8;
		font-size: 1rem;
		font-weight: 500;
		margin: 0 0 16px 0;
	}

	.project-tagline :global(strong),
	.project-tagline :global(em) {
		color: inherit;
	}

	.project-description {
		color: #cbd5e1;
		margin-bottom: 20px;
		line-height: 1.6;
	}

	.project-description :global(p) {
		margin: 0 0 12px 0;
	}

	.project-description :global(ul),
	.project-description :global(ol) {
		margin: 0 0 16px 1.25rem;
		padding: 0;
	}

	.project-description :global(li) {
		margin-bottom: 6px;
	}

	/* Markdown links inside project description and name */
	.project-description :global(a),
	.project-name :global(a) {
		color: #60a5fa; /* link blue */
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: color 0.2s ease, text-decoration-color 0.2s ease;
	}

	.project-description :global(a:hover),
	.project-name :global(a:hover) {
		color: #3b82f6; /* brighter on hover */
		text-decoration-thickness: 2px;
	}

	.project-description :global(a:focus-visible),
	.project-name :global(a:focus-visible) {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
		border-radius: 2px;
	}

	.project-description :global(strong) {
		color: #f8fafc;
		font-weight: 600;
	}

	.project-description :global(em) {
		color: #60a5fa;
		font-style: normal;
		font-weight: 500;
	}

	.project-links {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.project-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 18px;
		border-radius: 999px;
		color: #60a5fa;
		font-weight: 600;
		text-decoration: none;
		background: rgba(37, 99, 235, 0.12);
		border: 1px solid rgba(37, 99, 235, 0.35);
		transition: all 0.3s ease;
	}

	.project-link[data-type="github"] {
		background: rgba(59, 130, 246, 0.12);
		border-color: rgba(59, 130, 246, 0.4);
	}

	.project-link:hover {
		color: #3b82f6;
		border-color: rgba(59, 130, 246, 0.8);
		box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
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