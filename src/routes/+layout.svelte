<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { beforeNavigate } from '$app/navigation';
	import GlassNav from '$lib/components/GlassNav.svelte';
	import { holdImagesDuringNavigation } from '$lib/imageCache.svelte';

	let { children } = $props();

	// Background image downloads would otherwise compete with the next page's data and code on a
	// slow link, leaving a clicked link apparently dead until they finish. Hash-only changes and
	// leaving the site don't load anything from here, so they're left alone.
	beforeNavigate(({ from, to, type, complete }) => {
		if (type === 'leave' || !to || to.url.pathname === from?.url.pathname) return;
		holdImagesDuringNavigation(complete);
	});

	const NAV_BRAND = { href: resolve('/'), label: 'Evan Gan' };
	const NAV_LINKS = [
		{ href: resolve('/about'), label: 'About' },
		{ href: resolve('/projects'), label: 'Projects' }
	];
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
	<!-- DM Sans: home + error pages. Inter: fallback for the system font on non-Apple devices. -->
	<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

{#if !page.url.pathname.startsWith('/editor')}
	<GlassNav brand={NAV_BRAND} links={NAV_LINKS} currentPath={page.url.pathname} />
{/if}

{@render children?.()}

<style>
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
