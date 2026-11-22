<script lang="ts">
	interface Props {
		href: string;
		label: string;
	}

	let { href, label }: Props = $props();
</script>

<!-- Three brand-colour stripes sweep across the word on hover, staggered so the colours cascade. -->
<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- callers pass resolve()d hrefs -->
<a {href} class="stripe-word">
	{label}
	<span class="stripe stripe-yellow" aria-hidden="true"></span>
	<span class="stripe stripe-mint" aria-hidden="true"></span>
	<span class="stripe stripe-purple" aria-hidden="true"></span>
</a>

<style>
	.stripe-word {
		position: relative;
		display: inline-block;
		color: var(--color-label);
		text-decoration: none;
	}

	.stripe-word:focus-visible {
		outline: 3px solid var(--color-accent);
		outline-offset: 6px;
		border-radius: 8px;
	}

	.stripe {
		position: absolute;
		left: -0.02em;
		top: 0.52em;
		width: calc(100% + 0.06em);
		height: 0.11em;
		border-radius: 0.06em;
		transform: scaleX(0);
		transform-origin: right;
		transition: transform 0.8s cubic-bezier(0.4, 0, 0, 1);
		pointer-events: none;
	}

	/* Delays are mirrored between hover-in and hover-out so the last colour in is the first out. */
	.stripe-yellow {
		background: var(--brand-yellow);
		transition-delay: 0.1s;
	}

	.stripe-mint {
		background: var(--brand-mint);
		transition-delay: 0.05s;
	}

	.stripe-purple {
		background: var(--brand-purple);
	}

	@media (hover: hover) and (pointer: fine) {
		.stripe-word:hover .stripe,
		.stripe-word:focus-visible .stripe {
			transform: scaleX(1);
			transform-origin: left;
		}

		.stripe-word:hover .stripe-yellow {
			transition-delay: 0s;
		}

		.stripe-word:hover .stripe-purple {
			transition-delay: 0.1s;
		}
	}
</style>
