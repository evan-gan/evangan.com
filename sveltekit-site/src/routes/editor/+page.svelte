<script lang="ts">
	import { onMount } from 'svelte';
	
	interface Project {
		date: string;
		name: string;
		tagline: string;
		description: string;
		thumbnail?: string;
		websiteURL?: string;
		githubURL?: string;
		categories: string[];
	}
	
	let projects: Project[] = [];
	let allCategories: string[] = [];
	let filterCategory = 'all';
	let editingProject: Project | null = null;
	let showAddForm = false;
	let yamlOutput = '';
	
	// Sample initial data matching your structure
	const sampleProjects: Project[] = [];
	
	onMount(() => {
		// Initialize with your current projects
		loadProjectsFromYaml();
	});
	
	function loadProjectsFromYaml() {
		// Initialize with your actual projects
		projects = [
			{
				date: "Aug 8–11, 2025",
				name: "Shipwrecked",
				tagline: "Organized and ran a four-day hackathon at the Cathleen Stone Outward Bound School on Thompson Island in the Boston Harbor.",
				description: "Spent the entire summer working at [Hack Club](https://hackclub.com) full time to organize and run a four-day hackathon at the Cathleen Stone Outward Bound School on Thompson Island in the Boston Harbor.",
				thumbnail: "/thumbnails/ShipwreckedGroupPhoto.JPG",
				websiteURL: "https://shipwrecked.hackclub.com",
				categories: ["Hackathons I Ran"]
			},
			{
				date: "Nov 23, 2024",
				name: "Counterspell Hackathon",
				tagline: "Organized and ran a 12-hour hackathon at the Microsoft NERD Center.",
				description: "Organized and ran a 12-hour hackathon at the Microsoft NERD Center.",
				thumbnail: "/thumbnails/placeholder.svg",
				websiteURL: "https://counterspell.hackclub.com/boston",
				categories: ["Hackathons I Ran"]
			},
			{
				date: "Sep 27, 2025",
				name: "Daydream Hackathon",
				tagline: "Organized and ran a 12-hour hackathon at the Microsoft NERD Center.",
				description: "Organized and ran a 12-hour hackathon at the Microsoft NERD Center.",
				thumbnail: "/thumbnails/placeholder.svg",
				websiteURL: "https://daydream.hackclub.com/boston",
				categories: ["Hackathons I Ran"]
			},
			{
				date: "Mar 15, 2025",
				name: "Scrapyard Hackathon",
				tagline: "Organized and ran a 12-hour hackathon at the Microsoft NERD Center.",
				description: "Organized and ran a 12-hour hackathon at the Microsoft NERD Center.",
				thumbnail: "/thumbnails/placeholder.svg",
				websiteURL: "https://scrapyard.hackclub.com/boston",
				categories: ["Hackathons I Ran"]
			},
			{
				date: "Mar 8, 2025",
				name: "Hack The Castle",
				tagline: "Web app built with Next.js to help a foundation track students and search by date/time windows.",
				description: "Web app built with Next.js to help a foundation track students and search by date/time windows, addressing their challenge of keeping track of students.",
				thumbnail: "/thumbnails/placeholder.svg",
				githubURL: "https://github.com/ph4iry/polaris",
				categories: ["Programming Projects"]
			},
			{
				date: "Mar 1–2, 2024",
				name: "Scrapyard Flagship Hackathon",
				tagline: "Built an anti-productivity Mac app for the \"useless project\" prompt at a 12-hour hackathon.",
				description: "We were prompted to make a useless project. What better than an anti-productivity app to fulfill this objective.",
				thumbnail: "/thumbnails/scrapyardFlagship.jpg",
				githubURL: "https://github.com/evan-gan/distractatime",
				categories: ["Programming Projects"]
			},
			{
				date: "May 2024",
				name: "Maze Generator",
				tagline: "Recursive TypeScript maze generator for a pen plotter in the Hack Club Blot ecosystem.",
				description: "Recursive maze generator written in TypeScript for a pen plotter. Built as part of the Hack Club Blot ecosystem, with custom toolpath (that I designed & wrote) optimization for plotting.",
				thumbnail: "https://raw.githubusercontent.com/hackclub/blot/main/art/mazeGenerator-Evan/snapshots/mazeThumbnail.svg",
				githubURL: "https://github.com/evan-gan/blot",
				categories: ["Programming Projects"]
			},
			{
				date: "May 2024",
				name: "Wordle Solver",
				tagline: "Swift-based solver that automates the Wordle process as a playful challenge.",
				description: "A Swift-based solver for Wordle. Created as a playful way to improve results by automating the problem instead of practicing the game by hand.",
				thumbnail: "/thumbnails/placeholder.svg",
				githubURL: "https://github.com/evan-gan/wordleSolver",
				categories: ["Programming Projects"]
			},
			{
				date: "Jul 12–19, 2024",
				name: "The Trail",
				tagline: "Circuit board and firmware project to build trail equipment with friends.",
				description: "Circuit board and firmware project to build trail equipment with friends. Learned how to design a circuit board for the first time, designed it, and got it manufactured.",
				thumbnail: "/thumbnails/placeholder.svg",
				githubURL: "https://github.com/evan-gan/trail-PCB-communication-network",
				categories: ["Hardware Projects"]
			},
			{
				date: "May 17–19, 2024",
				name: "Apocalypse Hackathon Device",
				tagline: "Peer-to-peer communication device built for an apocalypse-themed hackathon.",
				description: "Peer-to-peer communication device built for an apocalypse-themed hackathon.",
				thumbnail: "/thumbnails/placeholder.svg",
				githubURL: "https://github.com/EerierGosling/Informedead",
				categories: ["Hardware Projects"]
			}
		];
		
		updateCategories();
	}
	
	function updateCategories() {
		const categorySet = new Set<string>();
		projects.forEach(project => {
			project.categories.forEach(cat => categorySet.add(cat));
		});
		allCategories = Array.from(categorySet).sort();
		console.log('Updated categories:', allCategories);
	}
	
	function sortProjects(projectsList: Project[]): Project[] {
		return [...projectsList].sort((a, b) => {
			// Extract year from date string for sorting since dates have ranges
			const getYear = (dateStr: string) => {
				const yearMatch = dateStr.match(/\b(20\d{2})\b/);
				return yearMatch ? parseInt(yearMatch[1]) : 0;
			};
			const getMonth = (dateStr: string) => {
				const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
								'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
				for (let i = 0; i < months.length; i++) {
					if (dateStr.includes(months[i])) return i;
				}
				return 0;
			};
			
			const aYear = getYear(a.date);
			const bYear = getYear(b.date);
			if (aYear !== bYear) return bYear - aYear; // Recent first
			
			const aMonth = getMonth(a.date);
			const bMonth = getMonth(b.date);
			return bMonth - aMonth; // Recent first
		});
	}
	
	function filterProjects(projectsList: Project[]): Project[] {
		if (filterCategory === 'all') return projectsList;
		return projectsList.filter(project => 
			project.categories.includes(filterCategory)
		);
	}
	
	// Reactive statement to update filtered and sorted projects
	$: filteredAndSortedProjects = (() => {
		const currentFilterCategory = filterCategory;
		const currentProjects = projects;
		
		console.log('Filtering:', { filterCategory: currentFilterCategory, projectCount: currentProjects.length });
		
		const filtered = filterProjects(currentProjects);
		console.log('After filtering:', filtered.length, 'projects');
		
		const sorted = sortProjects(filtered);
		console.log('After sorting by date:', sorted.length, 'projects');
		
		return sorted;
	})();
	
	function addNewProject() {
		const newProject: Project = {
			date: new Date().toISOString().split('T')[0],
			name: "New Project",
			tagline: "",
			description: "",
			thumbnail: "",
			categories: []
		};
		projects = [...projects, newProject];
		editingProject = newProject;
		showAddForm = false;
		updateCategories();
	}
	
	function deleteProject(project: Project) {
		if (confirm(`Delete "${project.name}"?`)) {
			projects = projects.filter(p => p !== project);
			if (editingProject === project) {
				editingProject = null;
			}
			updateCategories();
		}
	}
	
	function saveProject() {
		if (editingProject) {
			const index = projects.findIndex(p => p === editingProject);
			if (index >= 0) {
				projects[index] = { ...editingProject };
				projects = [...projects]; // Trigger reactivity
			}
			updateCategories();
		}
		editingProject = null;
	}
	
	function addCategory(project: Project) {
		const category = prompt("Enter new category:");
		if (category && category.trim()) {
			project.categories = [...project.categories, category.trim()];
			updateCategories();
		}
	}
	
	function removeCategory(project: Project, category: string) {
		project.categories = project.categories.filter(c => c !== category);
		updateCategories();
	}
	
	function hasMissingThumbnail(project: Project): boolean {
		return !project.thumbnail || project.thumbnail === "/thumbnails/placeholder.svg";
	}
	
	function exportToYaml() {
		const yamlLines: string[] = [];
		
		projects.forEach(project => {
			yamlLines.push(`- date: "${project.date}"`);
			yamlLines.push(`  name: "${project.name}"`);
			yamlLines.push(`  tagline: "${project.tagline}"`);
			yamlLines.push(`  description: |`);
			project.description.split('\n').forEach(line => {
				yamlLines.push(`    ${line}`);
			});
			if (project.thumbnail) {
				yamlLines.push(`  thumbnail: "${project.thumbnail}"`);
			}
			if (project.websiteURL) {
				yamlLines.push(`  websiteURL: "${project.websiteURL}"`);
			}
			if (project.githubURL) {
				yamlLines.push(`  githubURL: "${project.githubURL}"`);
			}
			yamlLines.push(`  categories:`);
			project.categories.forEach(cat => {
				yamlLines.push(`    - ${cat}`);
			});
			yamlLines.push('');
		});
		
		yamlOutput = yamlLines.join('\n');
	}
</script>

<svelte:head>
	<title>Project Editor - Evan Gan</title>
</svelte:head>

<main>
	<div class="container">
		<header class="page-header">
			<h1>Project Editor</h1>
			<p>Manage your projects.yaml file</p>
		</header>
		
		<!-- Controls -->
		<div class="controls">
			<div class="filters">
				<select bind:value={filterCategory}>
					<option value="all">All Categories</option>
					{#each allCategories as category}
						<option value={category}>{category}</option>
					{/each}
				</select>
			</div>
			
			<div class="actions">
				<button class="btn-primary" on:click={addNewProject}>
					+ Add Project
				</button>
				<button class="btn-secondary" on:click={exportToYaml}>
					Export YAML
				</button>
			</div>
		</div>
		
		<!-- Projects List -->
		<div class="projects-list">
			{#each filteredAndSortedProjects as project}
				<div class="project-item" class:editing={editingProject === project}>
					<div class="project-summary">
						<div class="project-info">
							<h3>
								{project.name}
								{#if hasMissingThumbnail(project)}
									<span class="warning" title="Missing thumbnail">⚠️</span>
								{/if}
							</h3>
							<p class="tagline">{project.tagline}</p>
							<div class="metadata">
								<span class="date">{project.date}</span>
								<div class="categories">
									{#each project.categories as category}
										<span class="category-tag">{category}</span>
									{/each}
								</div>
							</div>
						</div>
						<div class="project-actions">
							<button class="btn-small" on:click={() => editingProject = project}>
								Edit
							</button>
							<button class="btn-small btn-danger" on:click={() => deleteProject(project)}>
								Delete
							</button>
						</div>
					</div>
					
					{#if editingProject === project}
						<div class="project-form">
							<div class="form-row">
								<label>
									Name:
									<input type="text" bind:value={editingProject.name} />
								</label>
								<label>
									Date:
									<input type="text" bind:value={editingProject.date} />
								</label>
							</div>
							
							<label>
								Tagline:
								<input type="text" bind:value={editingProject.tagline} />
							</label>
							
							<label>
								Description:
								<textarea bind:value={editingProject.description} rows="4"></textarea>
							</label>
							
							<div class="form-row">
								<label>
									Thumbnail:
									<input type="text" bind:value={editingProject.thumbnail} placeholder="/thumbnails/..." />
								</label>
								<label>
									Website URL:
									<input type="url" bind:value={editingProject.websiteURL} />
								</label>
								<label>
									GitHub URL:
									<input type="url" bind:value={editingProject.githubURL} />
								</label>
							</div>
							
							<div class="categories-editor">
								<label>Categories:</label>
								<div class="categories-list">
									{#each editingProject.categories as category}
										<div class="category-item">
											<span>{category}</span>
											<button class="btn-tiny" on:click={() => removeCategory(editingProject, category)}>×</button>
										</div>
									{/each}
									<button class="btn-small" on:click={() => addCategory(editingProject)}>+ Add Category</button>
								</div>
							</div>
							
							<div class="form-actions">
								<button class="btn-primary" on:click={saveProject}>Save</button>
								<button class="btn-secondary" on:click={() => editingProject = null}>Cancel</button>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
		
		{#if yamlOutput}
			<div class="yaml-output">
				<h3>Exported YAML</h3>
				<textarea readonly rows="20" bind:value={yamlOutput}></textarea>
				<button class="btn-primary" on:click={() => navigator.clipboard.writeText(yamlOutput)}>
					Copy to Clipboard
				</button>
			</div>
		{/if}
	</div>
</main>

<style>
	main {
		min-height: 100vh;
		padding: 60px 0 100px 0;
		background: #f8f9fa;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px;
	}

	.page-header {
		text-align: center;
		margin-bottom: 60px;
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

	.controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40px;
		gap: 20px;
		flex-wrap: wrap;
	}

	.filters {
		display: flex;
		gap: 16px;
	}

	.actions {
		display: flex;
		gap: 12px;
	}

	select {
		padding: 10px 16px;
		border-radius: 8px;
		border: 2px solid #000000;
		background: #ffffff;
		color: #000000;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		box-shadow: 2px 2px 0px #000000;
		transition: all 0.2s ease;
	}

	select:hover {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px #000000;
	}

	select:focus {
		outline: 2px solid rgba(23, 241, 209, 1);
		outline-offset: 2px;
	}

	.btn-primary, .btn-secondary, .btn-small, .btn-tiny, .btn-danger {
		padding: 10px 20px;
		border-radius: 8px;
		border: 2px solid #000000;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 14px;
		box-shadow: 2px 2px 0px #000000;
	}

	.btn-primary {
		background: rgba(23, 241, 209, 1);
		color: #000000;
	}

	.btn-primary:hover {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px #000000;
	}

	.btn-secondary {
		background: #ffffff;
		color: #000000;
	}

	.btn-secondary:hover {
		background: rgba(255, 208, 116, 1);
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px #000000;
	}

	.btn-small {
		padding: 8px 16px;
		font-size: 13px;
	}

	.btn-tiny {
		padding: 4px 10px;
		font-size: 12px;
		background: #ffffff;
		color: #000000;
	}

	.btn-tiny:hover {
		background: #ef4444;
		color: #ffffff;
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px #000000;
	}

	.btn-danger {
		background: #ef4444;
		color: #ffffff;
		border-color: #000000;
	}

	.btn-danger:hover {
		background: #dc2626;
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px #000000;
	}

	.projects-list {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.project-item {
		background: #ffffff;
		border-radius: 12px;
		border: 2px solid #000000;
		overflow: hidden;
		box-shadow: 4px 4px 0px #000000;
		transition: all 0.2s ease;
	}

	.project-item:hover {
		transform: translate(-1px, -1px);
		box-shadow: 5px 5px 0px #000000;
	}

	.project-item.editing {
		border-color: rgba(23, 241, 209, 1);
		box-shadow: 4px 4px 0px rgba(23, 241, 209, 1);
	}

	.project-summary {
		padding: 20px;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 20px;
	}

	.project-info h3 {
		margin: 0 0 8px 0;
		color: #000000;
		font-size: 1.3rem;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.warning {
		font-size: 1rem;
	}

	.tagline {
		color: #6b7280;
		margin: 0 0 12px 0;
		line-height: 1.4;
	}

	.metadata {
		display: flex;
		gap: 16px;
		align-items: center;
		flex-wrap: wrap;
	}

	.date {
		color: #6b7280;
		font-size: 0.9rem;
		font-weight: 500;
	}

	.categories {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.category-tag {
		background: #ffffff;
		color: rgba(176, 135, 255, 1);
		padding: 4px 12px;
		border-radius: 12px;
		font-size: 0.8rem;
		font-weight: 500;
		border: 1px solid rgba(176, 135, 255, 1);
	}

	.project-actions {
		display: flex;
		gap: 8px;
		flex-shrink: 0;
	}

	.project-form {
		padding: 20px;
		border-top: 2px solid #000000;
		background: #f8f9fa;
	}

	.form-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
		margin-bottom: 16px;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		color: #000000;
		font-size: 0.9rem;
		font-weight: 600;
	}

	input, textarea {
		padding: 10px 12px;
		border-radius: 6px;
		border: 2px solid #000000;
		background: #ffffff;
		color: #000000;
		font-size: 14px;
		box-shadow: 2px 2px 0px #000000;
		transition: all 0.2s ease;
	}

	input:focus, textarea:focus {
		outline: none;
		border-color: rgba(23, 241, 209, 1);
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px #000000;
	}

	.categories-editor {
		margin-bottom: 20px;
	}

	.categories-list {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		align-items: center;
		margin-top: 8px;
	}

	.category-item {
		display: flex;
		align-items: center;
		gap: 6px;
		background: #ffffff;
		color: rgba(176, 135, 255, 1);
		padding: 6px 12px;
		border-radius: 12px;
		font-size: 0.8rem;
		border: 1px solid rgba(176, 135, 255, 1);
		font-weight: 500;
	}

	.form-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
	}

	.yaml-output {
		margin-top: 40px;
		padding: 20px;
		background: #ffffff;
		border-radius: 12px;
		border: 2px solid #000000;
		box-shadow: 4px 4px 0px #000000;
	}

	.yaml-output h3 {
		margin: 0 0 16px 0;
		color: #000000;
	}

	.yaml-output textarea {
		width: 100%;
		font-family: 'JetBrains Mono', monospace;
		font-size: 12px;
		resize: vertical;
		background: #ffffff;
		border: 2px solid #000000;
		border-radius: 8px;
		padding: 12px;
		color: #000000;
	}

	.yaml-output textarea:focus {
		outline: none;
		border-color: rgba(23, 241, 209, 1);
		box-shadow: 4px 4px 0px #000000;
	}

	@media (max-width: 768px) {
		.controls {
			flex-direction: column;
			align-items: stretch;
		}

		.filters, .actions {
			justify-content: center;
		}

		.project-summary {
			flex-direction: column;
			gap: 16px;
		}

		.project-actions {
			align-self: flex-start;
		}

		.form-row {
			grid-template-columns: 1fr;
		}
	}
</style>