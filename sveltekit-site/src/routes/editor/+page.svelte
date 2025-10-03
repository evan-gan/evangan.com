<script lang="ts">
	import { onMount } from 'svelte';
	import { load as parseYaml, dump as stringifyYaml } from 'js-yaml';
	
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
	let selectedProject: Project | null = null;
	let selectedIndex = -1;
	let editedProject: Project | null = null;
	let isDirty = false;
	let showUnsavedWarning = false;
	let pendingIndex = -1;
	let isDragOver = false;
	let isUploading = false;
	let newCategory = '';
	let showCategoryDropdown = false;
	let filteredCategories: string[] = [];
	let showSaveSuccess = false;
	let showDeleteConfirm = false;
	let showChangesWarning = false;
	let showThumbnailGallery = false;
	let availableThumbnails: string[] = [];
	let hoveredThumbnail: string | null = null;
	
	// Get all unique categories from all projects
	$: allCategories = [...new Set(projects.flatMap(p => p.categories))].sort();
	
	onMount(() => {
		loadProjects();
	});
	
	async function loadProjects() {
		try {
			const response = await fetch('/api/projects');
			const { content } = await response.json();
			projects = parseYaml(content) as Project[];
			
			// Sort by date (newest first)
			projects = sortProjects(projects);
		} catch (err) {
			console.error('Failed to load projects:', err);
			showChangesWarning = true; // Use modal instead of alert
		}
	}
	
	function sortProjects(projectsList: Project[]): Project[] {
		return [...projectsList].sort((a, b) => {
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
			
			const yearA = getYear(a.date);
			const yearB = getYear(b.date);
			if (yearA !== yearB) return yearB - yearA;
			
			const monthA = getMonth(a.date);
			const monthB = getMonth(b.date);
			return monthB - monthA;
		});
	}
	
	function selectProject(index: number) {
		if (isDirty) {
			pendingIndex = index;
			showUnsavedWarning = true;
			return;
		}
		
		selectedIndex = index;
		selectedProject = projects[index];
		editedProject = JSON.parse(JSON.stringify(selectedProject));
		isDirty = false;
	}
	
	function handleContinueWithoutSaving() {
		isDirty = false;
		showUnsavedWarning = false;
		if (pendingIndex >= 0) {
			selectProject(pendingIndex);
			pendingIndex = -1;
		}
	}
	
	function handleReturnToEdit() {
		showUnsavedWarning = false;
		pendingIndex = -1;
	}
	
	function markDirty() {
		isDirty = true;
	}
	
	async function saveProject() {
		if (!editedProject || selectedIndex < 0) return;
		
		try {
			// Update the project in the array
			projects[selectedIndex] = JSON.parse(JSON.stringify(editedProject));
			
			// Convert back to YAML
			const yamlContent = stringifyYaml(projects);
			
			// Save to file
			const response = await fetch('/api/projects', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: yamlContent })
			});
			
			if (!response.ok) {
				throw new Error('Failed to save');
			}
			
			isDirty = false;
			selectedProject = JSON.parse(JSON.stringify(editedProject));
			
			// Show success notification
			showSaveSuccess = true;
			setTimeout(() => {
				showSaveSuccess = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to save project:', err);
			alert('Failed to save project');
		}
	}
	
	function createNewProject() {
		if (isDirty) {
			showChangesWarning = true;
			return;
		}
		
		const newProject: Project = {
			date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
			name: 'New Project',
			tagline: '',
			description: '',
			thumbnail: '/thumbnails/placeholder.svg',
			categories: []
		};
		
		projects = [newProject, ...projects];
		selectedIndex = 0;
		selectedProject = newProject;
		editedProject = JSON.parse(JSON.stringify(newProject));
		isDirty = true;
	}
	
	function deleteProject() {
		showDeleteConfirm = true;
	}
	
	function confirmDelete() {
		projects = projects.filter((_, i) => i !== selectedIndex);
		selectedIndex = -1;
		selectedProject = null;
		editedProject = null;
		isDirty = false;
		showDeleteConfirm = false;
		
		// Save immediately after delete
		const yamlContent = stringifyYaml(projects);
		fetch('/api/projects', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ content: yamlContent })
		});
	}
	
	function cancelDelete() {
		showDeleteConfirm = false;
	}
	
	// Drag and drop handlers
	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragOver = true;
	}
	
	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragOver = false;
	}
	
	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragOver = false;
		
		if (!editedProject) return;
		
		const files = e.dataTransfer?.files;
		if (!files || files.length === 0) return;
		
		const file = files[0];
		if (!file.type.startsWith('image/')) {
			alert('Please drop an image file');
			return;
		}
		
		await uploadThumbnail(file);
	}
	
	async function uploadThumbnail(file: File) {
		if (!editedProject) return;
		
		isUploading = true;
		try {
			const formData = new FormData();
			formData.append('file', file);
			
			const response = await fetch('/api/upload-thumbnail', {
				method: 'POST',
				body: formData
			});
			
			if (!response.ok) {
				throw new Error('Upload failed');
			}
			
			const { path } = await response.json();
			editedProject.thumbnail = path;
			markDirty();
		} catch (err) {
			console.error('Failed to upload thumbnail:', err);
			alert('Failed to upload thumbnail');
		} finally {
			isUploading = false;
		}
	}
	
	function addCategory() {
		if (!editedProject || !newCategory.trim()) return;
		
		if (!editedProject.categories.includes(newCategory.trim())) {
			editedProject.categories = [...editedProject.categories, newCategory.trim()];
			markDirty();
		}
		newCategory = '';
		showCategoryDropdown = false;
	}
	
	function selectCategory(category: string) {
		newCategory = category;
		addCategory();
	}
	
	function handleCategoryInput() {
		const value = newCategory.trim().toLowerCase();
		if (value) {
			filteredCategories = allCategories.filter(cat => 
				cat.toLowerCase().includes(value) && 
				(!editedProject || !editedProject.categories.includes(cat))
			);
			showCategoryDropdown = filteredCategories.length > 0;
		} else {
			filteredCategories = allCategories.filter(cat => 
				!editedProject || !editedProject.categories.includes(cat)
			);
			showCategoryDropdown = filteredCategories.length > 0;
		}
	}
	
	function handleCategoryFocus() {
		filteredCategories = allCategories.filter(cat => 
			!editedProject || !editedProject.categories.includes(cat)
		);
		showCategoryDropdown = filteredCategories.length > 0;
	}
	
	function handleCategoryBlur() {
		// Delay to allow click on dropdown items
		setTimeout(() => {
			showCategoryDropdown = false;
		}, 200);
	}
	
	function removeCategory(index: number) {
		if (!editedProject) return;
		editedProject.categories = editedProject.categories.filter((_, i) => i !== index);
		markDirty();
	}
	
	async function openThumbnailGallery() {
		try {
			const response = await fetch('/api/thumbnails');
			const { thumbnails } = await response.json();
			availableThumbnails = thumbnails;
			showThumbnailGallery = true;
			
			// Add escape key listener
			window.addEventListener('keydown', handleGalleryEscape);
		} catch (err) {
			console.error('Failed to load thumbnails:', err);
		}
	}
	
	function closeThumbnailGallery() {
		showThumbnailGallery = false;
		hoveredThumbnail = null;
		
		// Remove escape key listener
		window.removeEventListener('keydown', handleGalleryEscape);
	}
	
	function handleGalleryEscape(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			closeThumbnailGallery();
		}
	}
	
	function handleThumbnailHover(thumbnail: string) {
		hoveredThumbnail = thumbnail;
	}
	
	function handleThumbnailLeave() {
		hoveredThumbnail = null;
	}
	
	function selectThumbnail(thumbnail: string) {
		if (editedProject) {
			editedProject.thumbnail = thumbnail;
			markDirty();
			closeThumbnailGallery();
		}
	}
</script>

<svelte:head>
	<title>Project Editor</title>
</svelte:head>

<div class="editor-container">
	<!-- Left sidebar: Project list -->
	<aside class="project-list">
		<div class="sidebar-header">
			<h2>Projects</h2>
			<button class="btn-new" on:click={createNewProject}>+ New</button>
		</div>
		<div class="project-items">
			{#each projects as project, index}
				<button
					class="project-item"
					class:active={selectedIndex === index}
					on:click={() => selectProject(index)}
				>
					<div class="project-item-name">{project.name}</div>
					<div class="project-item-date">{project.date}</div>
				</button>
			{/each}
		</div>
	</aside>

	<!-- Right side: Editor -->
	<main class="editor-main">
		{#if editedProject}
			<div class="editor-header">
				<h1>Edit Project</h1>
				<div class="editor-actions">
					{#if showSaveSuccess}
						<span class="save-success">✓ Saved</span>
					{:else if isDirty}
						<span class="unsaved-indicator">● Unsaved changes</span>
					{/if}
					<button class="btn-save" on:click={saveProject} disabled={!isDirty}>
						Save
					</button>
					<button class="btn-delete" on:click={deleteProject}>
						Delete
					</button>
				</div>
			</div>

			<div class="editor-form">
				<div class="form-row">
					<div class="form-group">
						<label for="name">Project Name</label>
						<input
							id="name"
							type="text"
							bind:value={editedProject.name}
							on:input={markDirty}
						/>
					</div>

					<div class="form-group">
						<label for="date">Date</label>
						<input
							id="date"
							type="text"
							bind:value={editedProject.date}
							on:input={markDirty}
							placeholder="e.g. Aug 8–11, 2025"
						/>
					</div>
				</div>

				<div class="form-group">
					<label for="tagline">Tagline</label>
					<input
						id="tagline"
						type="text"
						bind:value={editedProject.tagline}
						on:input={markDirty}
					/>
				</div>

				<div class="form-group">
					<label for="description">Description</label>
					<textarea
						id="description"
						rows="5"
						bind:value={editedProject.description}
						on:input={markDirty}
					></textarea>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="websiteURL">Website URL</label>
						<input
							id="websiteURL"
							type="text"
							bind:value={editedProject.websiteURL}
							on:input={markDirty}
						/>
					</div>

					<div class="form-group">
						<label for="githubURL">GitHub URL</label>
						<input
							id="githubURL"
							type="text"
							bind:value={editedProject.githubURL}
							on:input={markDirty}
						/>
					</div>
				</div>

				<div class="form-row">
					<div class="form-group">
						<label for="thumbnail-dropzone">Thumbnail</label>
						<div
							id="thumbnail-dropzone"
							class="thumbnail-dropzone"
							class:drag-over={isDragOver}
							role="button"
							tabindex="0"
							on:dragover={handleDragOver}
							on:dragleave={handleDragLeave}
							on:drop={handleDrop}
							on:click={openThumbnailGallery}
							on:keydown={(e) => e.key === 'Enter' || e.key === ' ' ? openThumbnailGallery() : null}
						>
							{#if isUploading}
								<div class="upload-status">Uploading...</div>
							{:else if editedProject.thumbnail}
								<img src={editedProject.thumbnail} alt="Thumbnail preview" class="thumbnail-preview" />
								<div class="dropzone-hint">Click to browse or drag & drop to replace</div>
							{:else}
								<div class="dropzone-hint">Click to browse or drag & drop image here</div>
							{/if}
						</div>
					</div>

					<div class="form-group">
						<label for="category-input">Categories</label>
						<div class="categories-input-wrapper">
							<div class="categories-input">
								<input
									id="category-input"
									type="text"
									bind:value={newCategory}
									on:input={handleCategoryInput}
									on:focus={handleCategoryFocus}
									on:blur={handleCategoryBlur}
									on:keydown={(e) => e.key === 'Enter' && addCategory()}
									placeholder="Add category..."
								/>
								<button class="btn-add-category" on:click={addCategory}>Add</button>
							</div>
							{#if showCategoryDropdown && filteredCategories.length > 0}
								<div class="category-dropdown">
									{#each filteredCategories as category}
										<button
											class="category-dropdown-item"
											on:click={() => selectCategory(category)}
										>
											{category}
										</button>
									{/each}
								</div>
							{/if}
						</div>
						<div class="categories-list">
							{#each editedProject.categories as category, index}
								<div class="category-tag">
									{category}
									<button class="remove-category" on:click={() => removeCategory(index)}>
										×
									</button>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{:else}
			<div class="empty-state">
				<h2>No project selected</h2>
				<p>Select a project from the list or create a new one</p>
			</div>
		{/if}
	</main>
</div>

<!-- Unsaved changes warning modal -->
{#if showUnsavedWarning}
	<div class="modal-overlay" role="button" tabindex="0" on:click={handleReturnToEdit} on:keydown={(e) => e.key === 'Escape' && handleReturnToEdit()}>
		<div class="modal" role="dialog" tabindex="-1" on:click|stopPropagation on:keydown|stopPropagation>
			<h2>Unsaved Changes</h2>
			<p>You have unsaved changes. Do you want to continue without saving?</p>
			<div class="modal-actions">
				<button class="btn-secondary" on:click={handleReturnToEdit}>
					Return to Editor
				</button>
				<button class="btn-danger" on:click={handleContinueWithoutSaving}>
					Discard Changes
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Delete confirmation modal -->
{#if showDeleteConfirm}
	<div class="modal-overlay" role="button" tabindex="0" on:click={cancelDelete} on:keydown={(e) => e.key === 'Escape' && cancelDelete()}>
		<div class="modal" role="dialog" tabindex="-1" on:click|stopPropagation on:keydown|stopPropagation>
			<h2>Delete Project</h2>
			<p>Are you sure you want to delete this project? This action cannot be undone. <br>(well it can, in git but it's a pain)</p>
			<div class="modal-actions">
				<button class="btn-secondary" on:click={cancelDelete}>
					Cancel
				</button>
				<button class="btn-danger" on:click={confirmDelete}>
					Delete
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Changes warning modal -->
{#if showChangesWarning}
	<div class="modal-overlay" role="button" tabindex="0" on:click={() => showChangesWarning = false} on:keydown={(e) => e.key === 'Escape' && (showChangesWarning = false)}>
		<div class="modal" role="dialog" tabindex="-1" on:click|stopPropagation on:keydown|stopPropagation>
			<h2>Save Changes First</h2>
			<p>Please save or discard your current changes before proceeding.</p>
			<div class="modal-actions">
				<button class="btn-secondary" on:click={() => showChangesWarning = false}>
					OK
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Thumbnail gallery modal -->
{#if showThumbnailGallery}
	<div 
		class="modal-overlay gallery-overlay" 
		role="button" 
		tabindex="0"
		on:click={closeThumbnailGallery}
		on:keydown={(e) => e.key === 'Escape' && closeThumbnailGallery()}
	>
		<div 
			class="gallery-modal" 
			role="dialog"
			tabindex="-1"
			on:click|stopPropagation
			on:keydown|stopPropagation
		>
			<div class="gallery-header">
				<h2>Select Thumbnail</h2>
				<button class="gallery-close" on:click={closeThumbnailGallery}>×</button>
			</div>
			<div class="gallery-content">
				<div class="gallery-grid">
					{#each availableThumbnails as thumbnail}
						<div 
							class="gallery-item"
							class:current={editedProject?.thumbnail === thumbnail}
							class:hovered={hoveredThumbnail === thumbnail}
							role="button"
							tabindex="0"
							on:mouseenter={() => handleThumbnailHover(thumbnail)}
							on:mouseleave={handleThumbnailLeave}
							on:click={() => selectThumbnail(thumbnail)}
							on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectThumbnail(thumbnail)}
						>
							<img src={thumbnail} alt="Thumbnail option" />
							<div class="gallery-item-name">{thumbnail.split('/').pop()}</div>
						</div>
					{/each}
				</div>
				<div class="gallery-preview">
					{#if hoveredThumbnail}
						<img src={hoveredThumbnail} alt="Preview" />
					{:else if editedProject?.thumbnail}
						<img src={editedProject.thumbnail} alt="Current thumbnail" />
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.editor-container {
		display: flex;
		height: 100vh;
		overflow: hidden;
		background: #f8f9fa;
	}

	.project-list {
		width: 25%;
		background: #ffffff;
		border-right: 2px solid #000000;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.sidebar-header {
		padding: 24px;
		border-bottom: 2px solid #000000;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #ffffff;
	}

	.sidebar-header h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: #000000;
	}

	.btn-new {
		padding: 8px 16px;
		background: rgba(23, 241, 209, 1);
		color: #000000;
		border: 2px solid #000000;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 2px 2px 0px #000000;
		transition: all 0.2s ease;
	}

	.btn-new:hover {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px #000000;
	}

	.project-items {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.project-item {
		width: 100%;
		padding: 16px 24px;
		border: none;
		border-bottom: 2px solid #e5e7eb;
		background: #ffffff;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.project-item:hover {
		background: #f8f9fa;
	}

	.project-item.active {
		background: rgba(23, 241, 209, 0.1);
		border-left: 4px solid rgba(23, 241, 209, 1);
	}

	.project-item-name {
		font-weight: 600;
		color: #000000;
		margin-bottom: 4px;
	}

	.project-item-date {
		font-size: 0.85rem;
		color: #6b7280;
	}

	.editor-main {
		flex: 1;
		overflow-y: auto;
		padding: 40px;
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 32px;
	}

	.editor-header h1 {
		margin: 0;
		font-size: 2rem;
		font-weight: 700;
		color: #000000;
	}

	.editor-actions {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.unsaved-indicator {
		color: #ef4444;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.save-success {
		color: #10b981;
		font-weight: 600;
		font-size: 0.9rem;
		animation: fadeIn 0.3s ease-in;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.btn-save {
		padding: 10px 20px;
		background: rgba(23, 241, 209, 1);
		color: #000000;
		border: 2px solid #000000;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 2px 2px 0px #000000;
		transition: all 0.2s ease;
	}

	.btn-save:hover:not(:disabled) {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px #000000;
	}

	.btn-save:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-delete {
		padding: 10px 20px;
		background: #ef4444;
		color: #ffffff;
		border: 2px solid #000000;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 2px 2px 0px #000000;
		transition: all 0.2s ease;
	}

	.btn-delete:hover {
		background: #dc2626;
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px #000000;
	}


	.form-group {
		margin-bottom: 24px;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	label {
		display: block;
		margin-bottom: 8px;
		font-weight: 600;
		color: #000000;
	}

	input[type="text"],
	textarea {
		width: 100%;
		padding: 10px 12px;
		border: 2px solid #000000;
		border-radius: 6px;
		background: #ffffff;
		color: #000000;
		font-size: 14px;
		box-shadow: 2px 2px 0px #000000;
		transition: all 0.2s ease;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: rgba(23, 241, 209, 1);
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px #000000;
	}

	textarea {
		resize: vertical;
		font-family: inherit;
	}

	.thumbnail-dropzone {
		width: 100%;
		min-height: 200px;
		border: 2px dashed #000000;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 20px;
		background: #ffffff;
		transition: all 0.2s ease;
		position: relative;
		cursor: pointer;
	}

	.thumbnail-dropzone:hover {
		border-color: rgba(23, 241, 209, 1);
		background: rgba(23, 241, 209, 0.05);
	}

	.thumbnail-dropzone.drag-over {
		border-color: rgba(23, 241, 209, 1);
		background: rgba(23, 241, 209, 0.1);
	}

	.thumbnail-dropzone img.thumbnail-preview {
		max-width: 100%;
		max-height: 150px;
		object-fit: contain;
		border-radius: 4px;
		pointer-events: none;
	}

	.dropzone-hint {
		color: #6b7280;
		font-size: 0.9rem;
	}

	.upload-status {
		color: #6b7280;
		font-weight: 600;
	}

	.categories-input-wrapper {
		position: relative;
	}

	.categories-input {
		display: flex;
		gap: 8px;
		margin-bottom: 12px;
	}

	.category-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: #ffffff;
		border: 2px solid #000000;
		border-radius: 6px;
		box-shadow: 4px 4px 0px #000000;
		max-height: 200px;
		overflow-y: auto;
		z-index: 10;
		margin-top: -8px;
	}

	.category-dropdown-item {
		width: 100%;
		padding: 10px 12px;
		background: #ffffff;
		border: none;
		border-bottom: 1px solid #e5e7eb;
		text-align: left;
		cursor: pointer;
		transition: background 0.2s ease;
		font-size: 14px;
		color: #000000;
	}

	.category-dropdown-item:last-child {
		border-bottom: none;
	}

	.category-dropdown-item:hover {
		background: rgba(23, 241, 209, 0.2);
	}

	.categories-input {
		display: flex;
		gap: 8px;
		margin-bottom: 12px;
	}

	.categories-input input {
		flex: 1;
	}

	.btn-add-category {
		padding: 10px 16px;
		background: rgba(255, 208, 116, 1);
		color: #000000;
		border: 2px solid #000000;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 2px 2px 0px #000000;
		transition: all 0.2s ease;
	}

	.btn-add-category:hover {
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px #000000;
	}

	.categories-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.category-tag {
		display: flex;
		align-items: center;
		gap: 6px;
		background: #ffffff;
		color: rgba(176, 135, 255, 1);
		padding: 6px 12px;
		border-radius: 12px;
		border: 1px solid rgba(176, 135, 255, 1);
		font-size: 0.85rem;
		font-weight: 500;
	}

	.remove-category {
		background: none;
		border: none;
		color: rgba(176, 135, 255, 1);
		font-size: 1.2rem;
		line-height: 1;
		cursor: pointer;
		padding: 0;
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.remove-category:hover {
		color: #ef4444;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 60vh;
		text-align: center;
		color: #6b7280;
	}

	.empty-state h2 {
		color: #000000;
		margin-bottom: 8px;
	}

	/* Modal styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: #ffffff;
		border: 2px solid #000000;
		border-radius: 12px;
		padding: 32px;
		max-width: 500px;
		box-shadow: 8px 8px 0px #000000;
	}

	.modal h2 {
		margin: 0 0 16px 0;
		color: #000000;
	}

	.modal p {
		margin: 0 0 24px 0;
		color: #6b7280;
		line-height: 1.5;
	}

	.modal-actions {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
	}

	.btn-secondary {
		padding: 10px 20px;
		background: #ffffff;
		color: #000000;
		border: 2px solid #000000;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 2px 2px 0px #000000;
		transition: all 0.2s ease;
	}

	.btn-secondary:hover {
		background: rgba(255, 208, 116, 1);
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px #000000;
	}

	.btn-danger {
		padding: 10px 20px;
		background: #ef4444;
		color: #ffffff;
		border: 2px solid #000000;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 2px 2px 0px #000000;
		transition: all 0.2s ease;
	}

	.btn-danger:hover {
		background: #dc2626;
		transform: translate(-1px, -1px);
		box-shadow: 3px 3px 0px #000000;
	}

	/* Thumbnail Gallery Styles */
	.gallery-overlay {
		z-index: 2000;
	}

	.gallery-modal {
		background: #ffffff;
		border: 2px solid #000000;
		border-radius: 12px;
		width: 90vw;
		height: 90vh;
		box-shadow: 8px 8px 0px #000000;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.gallery-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24px;
		border-bottom: 2px solid #000000;
	}

	.gallery-header h2 {
		margin: 0;
		color: #000000;
	}

	.gallery-close {
		background: none;
		border: none;
		font-size: 2rem;
		line-height: 1;
		cursor: pointer;
		color: #000000;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s ease;
	}

	.gallery-close:hover {
		background: #f3f4f6;
	}

	.gallery-content {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.gallery-grid {
		flex: 1;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 16px;
		padding: 24px;
		overflow-y: auto;
		align-content: start;
	}

	.gallery-item {
		border: 2px solid #000000;
		border-radius: 8px;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 2px 2px 0px #000000;
		background: #ffffff;
	}

	.gallery-item:hover {
		transform: translate(-2px, -2px);
		box-shadow: 4px 4px 0px #000000;
	}

	.gallery-item.current {
		border-color: rgba(176, 135, 255, 1);
		border-width: 3px;
		box-shadow: 3px 3px 0px rgba(176, 135, 255, 1);
	}

	.gallery-item.current:hover {
		box-shadow: 5px 5px 0px rgba(176, 135, 255, 1);
	}

	.gallery-item.hovered {
		border-color: rgba(255, 208, 116, 1);
		border-width: 3px;
		box-shadow: 3px 3px 0px rgba(255, 208, 116, 1);
	}

	.gallery-item.hovered:hover {
		box-shadow: 5px 5px 0px rgba(255, 208, 116, 1);
	}

	.gallery-item img {
		width: 100%;
		height: 120px;
		object-fit: cover;
		display: block;
	}

	.gallery-item-name {
		padding: 8px;
		font-size: 0.75rem;
		color: #6b7280;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		border-top: 2px solid #000000;
	}

	.gallery-preview {
		width: 40%;
		border-left: 2px solid #000000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		background: #f8f9fa;
		flex-shrink: 0;
	}

	.gallery-preview img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		border-radius: 8px;
		box-shadow: 4px 4px 0px #000000;
		border: 2px solid #000000;
	}
</style>
