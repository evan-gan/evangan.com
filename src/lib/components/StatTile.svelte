<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		value: string;
		/** Line under the number; pass `footer` instead to put a link there. */
		caption?: string;
		footer?: Snippet;
		/** CSS colours, usually tokens from app.css. Label and caption fall back to the ink colour. */
		background: string;
		ink: string;
		labelColor?: string;
		captionColor?: string;
		/** Makes the whole tile a link (e.g. a category filter); `pressed` marks it as the current one. */
		href?: string;
		pressed?: boolean;
	}

	let { label, value, caption, footer, background, ink, labelColor, captionColor, href, pressed = false }: Props =
		$props();
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- callers pass resolve()d hrefs -->
<svelte:element
	this={href ? 'a' : 'section'}
	{href}
	aria-current={href && pressed ? 'page' : undefined}
	class="stat-tile"
	class:pressed
	aria-label={href ? undefined : label}
	style:--stat-bg={background}
	style:--stat-ink={ink}
	style:--stat-label={labelColor ?? ink}
	style:--stat-caption={captionColor ?? ink}
>
	<span class="label">{label}</span>
	<span>
		<span class="value">{value}</span>
		{#if footer}
			{@render footer()}
		{:else if caption}
			<span class="caption">{caption}</span>
		{/if}
	</span>
</svelte:element>

<style>
	.stat-tile {
		width: 100%;
		min-height: var(--stat-tile-min-height, 190px);
		margin: 0;
		border: 0;
		text-decoration: none;
		height: 100%;
		border-radius: var(--radius-widget);
		background: var(--stat-bg);
		color: var(--stat-ink);
		padding: 22px 24px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		transition:
			transform var(--duration-settle) var(--ease-spring),
			box-shadow var(--duration-settle);
	}

	.stat-tile:hover {
		transform: translateY(-3px);
		box-shadow: var(--shadow-lift);
	}

	a.stat-tile:focus-visible {
		outline: 3px solid var(--color-accent);
		outline-offset: 3px;
	}

	/* A ring in the tile's own ink, so the selected filter reads in any colour. */
	.stat-tile.pressed {
		box-shadow: inset 0 0 0 3px var(--stat-ink);
	}

	.stat-tile.pressed:hover {
		box-shadow:
			inset 0 0 0 3px var(--stat-ink),
			var(--shadow-lift);
	}

	.label {
		font-size: 13px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--stat-label);
	}

	.value {
		display: block;
		font-family: var(--font-display);
		font-size: 60px;
		line-height: 0.9;
		font-weight: 700;
		letter-spacing: -0.04em;
	}

	.caption {
		display: block;
		margin-top: 6px;
		font-size: 14px;
		line-height: 1.35;
		font-weight: 600;
		color: var(--stat-caption);
	}
</style>
