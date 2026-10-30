<script lang="ts">
	import { photoElementAttributes } from '$lib/pageImageLoader';
	import ProgressiveImage from './ProgressiveImage.svelte';

	interface Props {
		name: string;
		/** Small uppercase line above the name, e.g. "FIRST Robotics". */
		role: string;
		detail: string;
		/** Without an image the tile shows a striped "add a photo" placeholder in `fill`. */
		image?: string;
		/** Small version of `image` shown while it loads (see ProgressiveImage). */
		preview?: string | null;
		href?: string;
		/** CSS colours (usually var(--affiliation-*)) for the base fill, placeholder stripe (defaults to fill) and role label. */
		fill: string;
		stripe?: string;
		labelColor: string;
	}

	let { name, role, detail, image, preview = null, href, fill, stripe, labelColor }: Props = $props();

	const isExternal = $derived(href?.startsWith('http') ?? false);
</script>

<svelte:element
	this={href ? 'a' : 'section'}
	{href}
	target={isExternal ? '_blank' : undefined}
	rel={isExternal ? 'noopener noreferrer' : undefined}
	class="affiliation-tile"
	class:placeholder={!image}
	aria-label={`${name}, ${role}`}
	style:--tile-fill={fill}
	style:--tile-stripe={stripe ?? fill}
	style:--tile-label={labelColor}
>
	{#if image}
		<span class="media" {...photoElementAttributes(image)}>
			<ProgressiveImage src={image} {preview} />
		</span>
	{:else}
		<span class="placeholder-mark" aria-hidden="true">
			<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
				<path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
				<circle cx="12" cy="13" r="4" />
			</svg>
			<span>[{name} photo]</span>
		</span>
	{/if}
	<span class="scrim"></span>
	<span class="caption">
		<span class="role">{role}</span>
		<span class="name">{name}</span>
		<span class="detail">{detail}</span>
	</span>
</svelte:element>

<style>
	.affiliation-tile {
		position: relative;
		display: block;
		height: 100%;
		min-height: 340px;
		border-radius: var(--radius-widget);
		overflow: hidden;
		background: var(--tile-fill);
		color: #ffffff;
		text-decoration: none;
		transition:
			transform var(--duration-settle) var(--ease-spring),
			box-shadow var(--duration-settle);
	}

	.affiliation-tile:hover {
		transform: translateY(-3px);
		box-shadow: var(--shadow-lift);
	}

	.affiliation-tile:focus-visible {
		outline: 3px solid var(--color-accent);
		outline-offset: 3px;
	}

	.placeholder {
		background: repeating-linear-gradient(135deg, var(--tile-fill) 0 18px, var(--tile-stripe) 18px 36px);
	}

	.media {
		position: absolute;
		inset: 0;
		transition: transform 0.6s var(--ease-spring);
	}

	.affiliation-tile:hover .media {
		transform: scale(1.05);
	}

	.placeholder-mark {
		position: absolute;
		left: 50%;
		top: 38%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.85);
	}

	.scrim {
		position: absolute;
		inset: 0;
		background: var(--affiliation-scrim);
	}

	.caption {
		position: absolute;
		left: 22px;
		right: 22px;
		bottom: 22px;
	}

	.caption > span {
		display: block;
	}

	.role {
		font-size: 13px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--tile-label);
	}

	.name {
		margin-top: 4px;
		font-family: var(--font-display);
		font-size: 30px;
		line-height: 1.05;
		font-weight: 700;
		letter-spacing: -0.03em;
	}

	.detail {
		margin-top: 6px;
		font-size: 14px;
		line-height: 1.4;
	}
</style>
