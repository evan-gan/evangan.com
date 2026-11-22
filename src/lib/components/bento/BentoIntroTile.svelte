<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Filters (or anything else) shown under the tagline. */
		children?: Snippet;
		heading?: string;
		tagline?: string;
	}

	let {
		children,
		heading = "Things I've built.",
		tagline = 'Software, circuit boards, robots, hackathons, and the odd pumpkin-smashing guillotine. Tap a tile for more details.'
	}: Props = $props();
</script>

<!-- 2×2 cell intro, styled like the About page's intro block (minus the photo). -->
<section class="intro">
	<div class="eyebrow">Projects</div>
	<h1>{heading}</h1>
	<p>{tagline}</p>
	{#if children}{@render children()}{/if}
</section>

<style>
	.intro {
		grid-column: span 2;
		grid-row: span 2;
		min-width: 0;
		padding: 36px 40px;
		border-radius: var(--radius-widget);
		background: var(--color-surface);
		color: var(--color-label);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		gap: 14px;
	}

	.eyebrow {
		font-size: 15px;
		font-weight: 600;
		color: var(--color-label-tertiary);
	}

	h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 56px;
		line-height: 1;
		font-weight: 700;
		letter-spacing: -0.04em;
	}

	p {
		margin: 0;
		font-size: 18px;
		line-height: 1.5;
		color: var(--color-label-secondary);
	}

	/* On tablets the text column is narrow, so size the row to the text instead of two fixed rows. */
	@media (max-width: 900px) {
		.intro {
			grid-row: auto;
		}
	}

	@media (max-width: 560px) {
		.intro {
			grid-column: 1 / -1;
			padding: 28px 24px;
		}

		h1 {
			font-size: 44px;
		}
	}
</style>
