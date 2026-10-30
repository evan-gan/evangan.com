<script lang="ts">
	interface FilterOption {
		href: string;
		label: string;
	}

	interface Props {
		options: FilterOption[];
		activeHref: string;
		label: string;
	}

	let { options, activeHref, label }: Props = $props();
</script>

<!-- Filters are real links (one prerendered page per tag), so they work without JS and can be shared. -->
<!-- Callers pass hrefs already built with resolve(), so the lint rule can't see it here. -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->
<nav class="filter-scroller" aria-label={label}>
	<ul class="filter-bar">
		{#each options as option (option.href)}
			<li>
				<a
					href={option.href}
					class="filter-option"
					class:active={option.href === activeHref}
					aria-current={option.href === activeHref ? 'page' : undefined}
					data-sveltekit-noscroll
				>
					{option.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
<!-- eslint-enable svelte/no-navigation-without-resolve -->

<style>
	.filter-scroller {
		max-width: 100%;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.filter-scroller::-webkit-scrollbar {
		display: none;
	}

	.filter-bar {
		display: inline-flex;
		gap: 2px;
		margin: 0;
		padding: 5px;
		list-style: none;
		border-radius: var(--radius-pill);
		background: var(--color-surface);
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
	}

	.filter-option {
		display: flex;
		align-items: center;
		min-height: 40px;
		padding: 0 16px;
		box-sizing: border-box;
		border-radius: var(--radius-pill);
		font-size: 14px;
		font-weight: 500;
		white-space: nowrap;
		color: var(--color-label);
		text-decoration: none;
		transition:
			background var(--duration-quick),
			color var(--duration-quick);
	}

	.filter-option:hover {
		background: var(--color-bg);
	}

	.filter-option:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.filter-option.active {
		background: var(--color-inverse);
		color: var(--color-on-inverse);
		font-weight: 600;
	}
</style>
