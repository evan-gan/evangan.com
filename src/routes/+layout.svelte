<script lang="ts">
	// Self-hosted variable font (one file per script subset, all weights), so no Google Fonts round trip.
	import '@fontsource-variable/figtree';
	import '../app.css';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { beforeNavigate } from '$app/navigation';
	import GlassNav from '$lib/components/GlassNav.svelte';
	import { holdImagesDuringNavigation } from '$lib/imageCache.svelte';
	import { PERSON_NAME } from '$lib/content/profile';
	import { OG_IMAGE, SITE_DESCRIPTION, absoluteUrl, canonicalUrl } from '$lib/content/site';

	let { children } = $props();

	// Background image downloads would otherwise compete with the next page's data and code on a
	// slow link, leaving a clicked link apparently dead until they finish. Hash-only changes and
	// leaving the site don't load anything from here, so they're left alone.
	beforeNavigate(({ from, to, type, complete }) => {
		if (type === 'leave' || !to || to.url.pathname === from?.url.pathname) return;
		holdImagesDuringNavigation(complete);
	});

	const NAV_BRAND = { href: resolve('/'), label: PERSON_NAME };
	const NAV_LINKS = [
		{ href: resolve('/about'), label: 'About' },
		{ href: resolve('/projects'), label: 'Projects' }
	];
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<meta name="description" content={SITE_DESCRIPTION} />
	<!-- Canonical + Open Graph: link previews, and how search engines and agents attribute pages to the site. -->
	{#if !page.error}
		<link rel="canonical" href={canonicalUrl(page.url.pathname)} />
		<meta property="og:url" content={canonicalUrl(page.url.pathname)} />
	{/if}
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={PERSON_NAME} />
	<meta property="og:description" content={SITE_DESCRIPTION} />
	<meta property="og:image" content={absoluteUrl(OG_IMAGE.src)} />
	<meta property="og:image:width" content={String(OG_IMAGE.width)} />
	<meta property="og:image:height" content={String(OG_IMAGE.height)} />
	<meta property="og:image:alt" content={OG_IMAGE.alt} />
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
		font-family: var(--font-text);
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
