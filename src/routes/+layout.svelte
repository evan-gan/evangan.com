<script lang="ts">
	import '../app.css';
    import { page } from '$app/stores';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
	<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</svelte:head>

{#if !$page.url.pathname.startsWith('/editor')}
<header class="site-header">
	<a href="/" class="site-logo">Evan Gan</a>
</header>
{/if}

{@render children?.()}

<style>
	.site-header {
		position: fixed;
		top: 0;
		left: 0;
		padding: 24px 32px;
		z-index: 1000;
	}

	.site-logo {
		font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		font-size: 1.5rem;
		font-weight: 600;
		color: #6b7280;
		text-decoration: none;
		letter-spacing: 0.02em;
		transition: color 0.2s ease;
	}

	.site-logo:hover {
		color: #000000;
	}

	@media (max-width: 768px) {
		.site-header {
			padding: 16px 20px;
		}

		.site-logo {
			font-size: 1.2rem;
		}
	}

	:global(body) {
		margin: 0;
		padding: 0;
		background: #ffffff;
		color: #000000;
		font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		line-height: 1.6;
		min-height: 100vh;
	}
	
	:global(*) {
		box-sizing: border-box;
	}
	
	:global(::selection) {
		background: rgba(255, 208, 116, 0.3);
		color: #000000;
	}
</style>
