<script lang="ts">
	import { page } from '$app/stores';
	
	function splitText(text: string): string[] {
		return text.split('');
	}
</script>

<svelte:head>
	<title>404 - Page Not Found</title>
</svelte:head>

<main>
	<div class="error-container">
		<h1 class="error-code">404</h1>
		<p class="error-message">Looks like this page doesn't exist.</p>
	</div>
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 2rem;
	}

	.error-container {
		text-align: center;
		max-width: 600px;
	}

	.error-code {
		font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		font-weight: 700;
		font-size: 12rem;
		margin: 0 0 2rem 0;
		color: #000000;
		line-height: 1;
	}

	.error-message {
		font-size: 1.25rem;
		color: #000000;
		margin: 0 0 3rem 0;
		line-height: 1.6;
	}

	.home-link {
		display: inline-block;
		position: relative;
		font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		font-weight: 700;
		font-size: 1.5rem;
		color: #000000;
		text-decoration: none;
		transition: 0.4s linear color;
	}

	.link-letters {
		display: flex;
	}

	@media (hover: hover) and (pointer: fine) {
		.home-link > * {
			pointer-events: none;
		}
	}

	.link-stripe {
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

	.link-stripe--yellow {
		background-color: rgba(255, 208, 116, 1);
		transition-delay: 0.1s;
	}

	@media (hover: hover) and (pointer: fine) {
		.home-link:hover .link-stripe {
			transform-origin: left;
			transform: scaleX(1);
		}
		.home-link:hover .link-stripe--yellow {
			transition-delay: 0s;
		}
	}

	.link-stripe--turquoise {
		background-color: rgba(23, 241, 209, 1);
		transition-delay: 50ms;
	}

	@media (hover: hover) and (pointer: fine) {
		.home-link:hover .link-stripe--turquoise {
			transition-delay: 50ms;
		}
		.home-link:hover .link-stripe--purple {
			transition-delay: 0.1s;
		}
	}

	.link-letters-top {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
	}

	.link-letter {
		display: block;
		will-change: transform, opacity;
	}

	.link-letters .link-letter:nth-child(2n) {
		opacity: 0;
	}

	.link-letters-top .link-letter:nth-child(2n + 1) {
		opacity: 0 !important;
	}

	@media (max-width: 768px) {
		.error-code {
			font-size: 8rem;
		}

		.error-message {
			font-size: 1.1rem;
		}

		.home-link {
			font-size: 1.25rem;
		}
	}
</style>
