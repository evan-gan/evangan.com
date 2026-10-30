<script lang="ts">
	interface Props {
		id?: string;
	}

	let { id }: Props = $props();
</script>

<section {id} class="contact-block" aria-labelledby="contact-block-heading">
	<div>
		<h2 id="contact-block-heading">Say hi.</h2>
		<p>Always happy to talk about new projects or ideas.</p>
	</div>
	<div class="links">
		<a href="https://github.com/evan-gan" target="_blank" rel="noopener noreferrer" class="chip">
			<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
			</svg>GitHub
		</a>
		<a href="https://www.linkedin.com/in/evan-gan/" target="_blank" rel="noopener noreferrer" class="chip">
			<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
				<rect x="2" y="9" width="4" height="12" />
				<circle cx="4" cy="4" r="2" />
			</svg>LinkedIn
		</a>
	</div>
</section>

<style>
	.contact-block {
		border-radius: var(--radius-widget);
		background: var(--color-inverse);
		color: var(--color-bg);
		padding: 28px 32px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		/* The nav is fixed, so a #say-hi jump would otherwise land under it. */
		scroll-margin-top: var(--nav-clearance);
	}

	h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 36px;
		line-height: 1.1;
		font-weight: 700;
		letter-spacing: -0.025em;
	}

	p {
		margin: 6px 0 0;
		font-size: 16px;
		line-height: 1.45;
		color: var(--stat-dark-secondary);
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 48px;
		padding: 0 20px;
		border-radius: var(--radius-pill);
		background: var(--color-bg);
		color: var(--color-label);
		font-size: 16px;
		font-weight: 600;
		text-decoration: none;
		transition: background var(--duration-quick);
	}

	.chip:hover {
		background: var(--color-surface);
	}

	.chip:focus-visible {
		outline: 3px solid var(--color-accent);
		outline-offset: 3px;
	}
</style>
