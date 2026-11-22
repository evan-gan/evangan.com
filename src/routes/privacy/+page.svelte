<script lang="ts">
	// Copy lives in src/lib/content/privacy.ts (shared with privacy.md).
	import { PRIVACY_INTRO, PRIVACY_SECTIONS, PRIVACY_UPDATED } from '$lib/content/privacy';
	import { formatIsoDateLong } from '$lib/date';
</script>

<svelte:head>
	<title>Privacy - Evan Gan</title>
	<link rel="alternate" type="text/markdown" href="/privacy.md" />
</svelte:head>

<!-- Same card look as the About intro block. -->
<main class="privacy-page">
	<article class="privacy-card">
		<div class="eyebrow">Last updated {formatIsoDateLong(PRIVACY_UPDATED)}</div>
		<h1>Privacy</h1>
		<p>{PRIVACY_INTRO}</p>
		{#each PRIVACY_SECTIONS as section (section.heading)}
			<h2>{section.heading}</h2>
			{#each section.paragraphs as paragraph (paragraph)}
				<p>{paragraph}</p>
			{/each}
			{#if section.link}
				<p>
					See
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
					<a href={section.link.url} target="_blank" rel="noopener noreferrer">{section.link.label}</a>.
				</p>
			{/if}
		{/each}
	</article>
</main>

<style>
	.privacy-page {
		min-height: 100vh;
		padding: calc(var(--nav-clearance) + 8px) var(--page-gutter) 96px;
		background: var(--color-bg);
		color: var(--color-label);
		font-family: var(--font-text);
		-webkit-font-smoothing: antialiased;
	}

	.privacy-card {
		max-width: 720px;
		margin: 0 auto;
		padding: 40px 44px;
		border-radius: var(--radius-widget);
		background: var(--color-surface);
	}

	.eyebrow {
		font-size: 15px;
		font-weight: 600;
		color: var(--color-label-tertiary);
	}

	h1 {
		margin: 14px 0 20px;
		font-family: var(--font-display);
		font-size: 56px;
		line-height: 1;
		font-weight: 700;
		letter-spacing: -0.04em;
	}

	h2 {
		margin: 28px 0 8px;
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	p {
		margin: 0 0 12px;
		font-size: 19px;
		line-height: 1.55;
		color: var(--color-label-secondary);
	}

	a {
		color: var(--color-label);
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	@media (max-width: 600px) {
		.privacy-card {
			padding: 28px 24px;
		}

		h1 {
			font-size: 44px;
		}
	}
</style>
