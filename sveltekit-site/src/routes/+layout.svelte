<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
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
		background: linear-gradient(135deg, #0a0f1c 0%, #1e1b3d 50%, #2d1b3d 100%);
		color: #f1f5f9;
		font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		line-height: 1.6;
		min-height: 100vh;
	}
	
	:global(*) {
		box-sizing: border-box;
	}
	
	:global(::selection) {
		background: rgba(139, 92, 246, 0.3);
		color: #f1f5f9;
	}
	
	.main-nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		background: rgba(10, 15, 28, 0.9);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(139, 92, 246, 0.2);
		transition: all 0.3s ease;
	}

	.nav-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 24px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 80px;
	}

	.nav-brand {
		font-size: 1.5rem;
		font-weight: 700;
		color: #f1f5f9;
		text-decoration: none;
		transition: all 0.3s ease;
		position: relative;
		font-family: 'JetBrains Mono', monospace;
	}

	.nav-brand:hover {
		color: #a855f7;
		transform: translateY(-1px);
	}

	.nav-brand::before {
		content: '';
		position: absolute;
		top: -4px;
		left: -4px;
		right: -4px;
		bottom: -4px;
		background: linear-gradient(45deg, #8b5cf6, #06b6d4, #10b981, #f59e0b);
		border-radius: 12px;
		opacity: 0;
		z-index: -1;
		transition: opacity 0.3s ease;
		background-size: 200% 200%;
		animation: gradientShift 3s ease infinite;
	}

	.nav-brand:hover::before {
		opacity: 0.2;
	}

	@keyframes gradientShift {
		0% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
		100% { background-position: 0% 50%; }
	}

	.nav-links {
		display: flex;
		gap: 40px;
	}

	.nav-link {
		color: #cbd5e1;
		text-decoration: none;
		font-weight: 500;
		transition: all 0.3s ease;
		position: relative;
		padding: 8px 16px;
		border-radius: 8px;
	}

	.nav-link:hover {
		color: #f1f5f9;
		background: rgba(139, 92, 246, 0.1);
		transform: translateY(-1px);
	}

	.nav-link.active {
		color: #a855f7;
		background: rgba(139, 92, 246, 0.15);
	}

	.nav-link.active::after {
		content: '';
		position: absolute;
		bottom: -8px;
		left: 50%;
		transform: translateX(-50%);
		width: 6px;
		height: 6px;
		background: linear-gradient(135deg, #8b5cf6, #06b6d4);
		border-radius: 50%;
		box-shadow: 0 0 12px rgba(139, 92, 246, 0.6);
	}

	@media (max-width: 768px) {
		.nav-container {
			padding: 0 20px;
			height: 70px;
		}
		
		.nav-links {
			gap: 28px;
		}
		
		.nav-brand {
			font-size: 1.3rem;
		}
	}
</style>
