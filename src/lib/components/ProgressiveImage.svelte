<script lang="ts">
	import { isImageLoaded, usablePreview } from '$lib/imageCache.svelte';

	interface Props {
		/** Full-quality image. */
		src: string;
		/** Small version shown until `src` is ready; null to wait for `src` alone. */
		preview: string | null;
		/** Empty for decorative images (e.g. inside a labelled button). */
		alt?: string;
		/** cover crops to fill the box; contain shows the whole photo. */
		fit?: 'cover' | 'contain';
	}

	let { src, preview, alt = '', fit = 'cover' }: Props = $props();

	// Only images the shared queue has finished downloading are shown, so this component never
	// starts a download itself (that would jump the queue's ordering).
	let previewSrc = $derived(usablePreview(preview));
	let showPreview = $derived(previewSrc !== null && isImageLoaded(previewSrc));
	let showFull = $derived(isImageLoaded(src));
	let fullPainted = $state(false);

	// decode() isn't guaranteed to settle promptly in every browser (e.g. for very large images), and
	// a pending one would leave the photo stuck on its preview. Revealing anyway is safe: an
	// undecoded image paints nothing, so the preview underneath keeps showing until it's ready.
	const DECODE_WAIT_LIMIT_MS = 800;

	// Downloaded isn't the same as decoded: the full layer stays transparent until it can paint,
	// so the cross-fade from the preview starts from a finished image.
	function revealWhenDecoded(image: HTMLImageElement) {
		const reveal = () => (fullPainted = true);
		const revealTimer = setTimeout(reveal, DECODE_WAIT_LIMIT_MS);
		image.decode().then(reveal, reveal);
		return () => clearTimeout(revealTimer);
	}
</script>

<span class="progressive" style:--fit={fit} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
	{#if showPreview}
		<img class="layer preview-layer" src={previewSrc} alt="" />
	{/if}
	{#if showFull}
		<img
			class="layer full-layer"
			class:painted={fullPainted}
			class:instant={!showPreview}
			src={src}
			alt=""
			decoding="async"
			{@attach revealWhenDecoded}
		/>
	{/if}
</span>

<style>
	.progressive {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.layer {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: var(--fit);
	}

	.preview-layer {
		animation: fade-in 260ms ease;
	}

	.full-layer {
		opacity: 0;
		transition: opacity 260ms ease;
	}

	.full-layer.painted {
		opacity: 1;
	}

	/* Over a preview the cross-fade hides the sharpness jump; with nothing underneath, a slow fade reads as lag. */
	.full-layer.instant {
		transition-duration: 160ms;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.preview-layer {
			animation: none;
		}

		.full-layer {
			transition: none;
		}
	}
</style>
