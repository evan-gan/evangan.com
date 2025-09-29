<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<!-- Navigation -->
<nav class="main-nav">
	<div class="nav-container">
		<a href="/" class="nav-brand">Evan Gan</a>
		<div class="nav-links">
			<a href="/" class="nav-link" class:active={$page.url.pathname === '/'}>Home</a>
			<a href="/projects" class="nav-link" class:active={$page.url.pathname.startsWith('/projects')}>Projects</a>
		</div>
	</div>
</nav>

{@render children?.()}

<style>
	:global(body) {
		margin: 0;
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
		color: #f8fafc;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		line-height: 1.6;
	}
	
	.main-nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		background: rgba(15, 23, 42, 0.95);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(51, 65, 85, 0.3);
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 20px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 70px;
	}

	.nav-brand {
		font-size: 1.5rem;
		font-weight: 700;
		color: #f8fafc;
		text-decoration: none;
		transition: color 0.3s ease;
	}

	.nav-brand:hover {
		color: #60a5fa;
	}

	.nav-links {
		display: flex;
		gap: 32px;
	}

	.nav-link {
		color: #cbd5e1;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.3s ease;
		position: relative;
	}

	.nav-link:hover {
		color: #f8fafc;
	}

	.nav-link.active {
		color: #60a5fa;
	}

	.nav-link.active::after {
		content: '';
		position: absolute;
		bottom: -6px;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, #3b82f6, #8b5cf6);
		border-radius: 1px;
	}

	@media (max-width: 768px) {
		.nav-container {
			padding: 0 16px;
		}
		
		.nav-links {
			gap: 24px;
		}
	}
</style>
