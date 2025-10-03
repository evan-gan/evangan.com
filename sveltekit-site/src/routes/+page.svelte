<script lang="ts">
	function splitText(text: string): string[] {
		return text.split('');
	}
</script>

<svelte:head>
	<title>Evan Gan</title>
</svelte:head>

<main>
	<nav>
		<ul class="nav-ul">
			<li class="nav-li">
				<a href="/about" class="nav-a">
					<span class="nav-a-letters">
						{#each splitText('about') as letter}
							<span class="nav-a-letter">{letter}</span>
						{/each}
					</span>
					<span class="nav-a-stripe nav-a-stripe--yellow"></span>
					<span class="nav-a-stripe nav-a-stripe--turquoise"></span>
					<span class="nav-a-stripe nav-a-stripe--purple"></span>
					<span class="nav-a-letters-top">
						{#each splitText('about') as letter}
							<span class="nav-a-letter">{letter}</span>
						{/each}
					</span>
				</a>
			</li>
			<li class="nav-li">
				<a href="/projects" class="nav-a">
					<span class="nav-a-letters">
						{#each splitText('projects') as letter}
							<span class="nav-a-letter">{letter}</span>
						{/each}
					</span>
					<span class="nav-a-stripe nav-a-stripe--yellow"></span>
					<span class="nav-a-stripe nav-a-stripe--turquoise"></span>
					<span class="nav-a-stripe nav-a-stripe--purple"></span>
					<span class="nav-a-letters-top">
						{#each splitText('projects') as letter}
							<span class="nav-a-letter">{letter}</span>
						{/each}
					</span>
				</a>
			</li>
			<li class="nav-li">
				<a href="/contact" class="nav-a">
					<span class="nav-a-letters">
						{#each splitText('contact') as letter}
							<span class="nav-a-letter">{letter}</span>
						{/each}
					</span>
					<span class="nav-a-stripe nav-a-stripe--yellow"></span>
					<span class="nav-a-stripe nav-a-stripe--turquoise"></span>
					<span class="nav-a-stripe nav-a-stripe--purple"></span>
					<span class="nav-a-letters-top">
						{#each splitText('contact') as letter}
							<span class="nav-a-letter">{letter}</span>
						{/each}
					</span>
				</a>
			</li>
		</ul>
	</nav>
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		width: 100vw;
		overflow: hidden; /* No scroll on homepage only */
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav-ul {
		font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		font-weight: 700;
		text-transform: lowercase;
		font-size: 7.5rem;
		letter-spacing: -0.05em;
	}

	.nav-li {
		position: relative;
		line-height: 0.76471;
	}

	.nav-li + .nav-li {
		margin-top: 1rem;
	}

	a {
		color: inherit;
		text-decoration: none;
		cursor: pointer;
	}

	.nav-a {
		display: inline-block;
		position: relative;
		transition: 0.4s linear color;
	}

	.nav-a-letters {
		display: flex;
	}

	@media (hover: hover) and (pointer: fine) {
		.nav-a > * {
			pointer-events: none;
		}
	}

	.nav-a-stripe {
		position: absolute;
		background-color: rgba(176, 135, 255, 1);
		width: calc(100% + 0.075em);
		left: 0;
		top: 0.5em;
		height: 0.115em;
		transform: scaleX(0);
		transform-origin: right;
		transition: transform 0.8s cubic-bezier(0.4, 0, 0, 1);
	}

	.nav-a-stripe--yellow {
		background-color: rgba(255, 208, 116, 1);
		transition-delay: 0.1s;
	}

	@media (hover: hover) and (pointer: fine) {
		.nav-a:hover .nav-a-stripe {
			transform-origin: left;
			transform: scaleX(1);
		}
		.nav-a:hover .nav-a-stripe--yellow {
			transition-delay: 0s;
		}
	}

	.nav-a-stripe--turquoise {
		background-color: rgba(23, 241, 209, 1);
		transition-delay: 50ms;
	}

	@media (hover: hover) and (pointer: fine) {
		.nav-a:hover .nav-a-stripe--turquoise {
			transition-delay: 50ms;
		}
		.nav-a:hover .nav-a-stripe--purple {
			transition-delay: 0.1s;
		}
	}

	.nav-a-letters-top {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
	}

	.nav-a-letter {
		display: block;
		will-change: transform, opacity;
	}

	.nav-a-letters .nav-a-letter:nth-child(2n) {
		opacity: 0;
	}

	.nav-a-letters-top .nav-a-letter:nth-child(2n + 1) {
		opacity: 0 !important;
	}

	/* Responsive sizing */
	@media (max-width: 1200px) {
		.nav-ul {
			font-size: 6rem;
		}
	}

	@media (max-width: 768px) {
		.nav-ul {
			font-size: 4rem;
		}
	}

	@media (max-width: 480px) {
		.nav-ul {
			font-size: 3rem;
		}
		
		.nav-li + .nav-li {
			margin-top: 0.5rem;
		}
	}
</style>
