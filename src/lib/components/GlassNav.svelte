<script lang="ts">
	interface NavLink {
		href: string;
		label: string;
	}

	interface Props {
		brand: NavLink;
		links: NavLink[];
		currentPath: string;
	}

	let { brand, links, currentPath }: Props = $props();

	// Treat nested routes (/projects/hackathons) as being "on" their section.
	function isCurrent(href: string): boolean {
		return currentPath === href || currentPath.startsWith(href + '/');
	}
</script>

<!-- Callers pass hrefs already built with resolve(), so the lint rule can't see it here. -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->
<header class="glass-nav-bar">
	<nav aria-label="Primary" class="glass-nav">
		<a href={brand.href} class="glass-nav-link brand">{brand.label}</a>
		{#each links as link (link.href)}
			<a
				href={link.href}
				class="glass-nav-link"
				class:current={isCurrent(link.href)}
				aria-current={isCurrent(link.href) ? 'page' : undefined}
			>
				{link.label}
			</a>
		{/each}
	</nav>
</header>
<!-- eslint-enable svelte/no-navigation-without-resolve -->

<style>
	.glass-nav-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		display: flex;
		justify-content: center;
		padding: 16px 16px 0;
		/* The bar spans the full width only to centre the pill; let clicks through the empty sides. */
		pointer-events: none;
	}

	.glass-nav {
		pointer-events: auto;
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 5px;
		max-width: 100%;
		overflow-x: auto;
		border-radius: var(--radius-pill);
		background: var(--glass-fill);
		backdrop-filter: var(--glass-blur);
		-webkit-backdrop-filter: var(--glass-blur);
		box-shadow: var(--glass-edge), var(--shadow-float);
		font-family: var(--font-text);
		-webkit-font-smoothing: antialiased;
	}

	.glass-nav-link {
		padding: 9px 16px;
		border-radius: var(--radius-pill);
		font-size: 15px;
		line-height: 1.2;
		white-space: nowrap;
		color: var(--color-label);
		text-decoration: none;
		transition: background var(--duration-quick);
	}

	.glass-nav-link:hover {
		background: rgba(255, 255, 255, 0.55);
	}

	.glass-nav-link:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.brand,
	.current {
		font-weight: 600;
	}

	.current {
		background: var(--color-surface);
		box-shadow: var(--shadow-chip);
	}

	.current:hover {
		background: var(--color-surface);
	}

	@media (max-width: 420px) {
		.glass-nav-link {
			padding: 9px 12px;
			font-size: 14px;
		}
	}
</style>
