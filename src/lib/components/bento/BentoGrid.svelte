<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		/** Columns on phones (e.g. 2 to pair up small filter tiles). 4 on desktop, 2 on tablets. */
		phoneColumns?: number;
		label?: string;
	}

	let { children, phoneColumns = 1, label }: Props = $props();
</script>

<!-- The About page's widget grid: fixed 190px rows, 20px gaps. -->
<section
	class="bento-grid"
	style:--bento-columns-phone={phoneColumns}
	aria-label={label}
>
	{@render children()}
</section>

<style>
	.bento-grid {
		--bento-columns: 4;
		display: grid;
		grid-template-columns: repeat(var(--bento-columns), minmax(0, 1fr));
		grid-auto-rows: 190px;
		gap: 20px;
	}

	@media (max-width: 900px) {
		.bento-grid {
			--bento-columns: 2;
		}
	}

	@media (max-width: 560px) {
		.bento-grid {
			--bento-columns: var(--bento-columns-phone);
			grid-auto-rows: auto;
			gap: 14px;
		}
	}
</style>
