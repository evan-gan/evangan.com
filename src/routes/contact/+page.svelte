<script lang="ts">
</script>

<svelte:head>
	<title>Contact - Evan Gan</title>
</svelte:head>

<main>
	<div class="container">
		<header class="page-header">
			<h1>Get In Touch</h1>
		</header>

		<div class="content">
			<p>
				I'm always open to discussing new projects, creative ideas, or opportunities to be part of an ambitious vision. Feel free to reach out.
			</p>
			
			<div class="contact-links">
				<a href="https://github.com/evan-gan" target="_blank" rel="noopener noreferrer" class="contact-link">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
					</svg>
					GitHub
				</a>
				<a href="https://www.linkedin.com/in/evan-gan/" target="_blank" rel="noopener noreferrer" class="contact-link">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
						<rect x="2" y="9" width="4" height="12"></rect>
						<circle cx="4" cy="4" r="2"></circle>
					</svg>
					LinkedIn
				</a>
			</div>
		</div>
	</div>
</main>

<style>
	main {
		min-height: calc(100vh - 80px);
		padding: 100px 24px 80px;
		background: #f8f9fa;
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
	}

	.page-header {
		text-align: center;
		margin-bottom: 48px;
	}

	.page-header h1 {
		font-size: 3rem;
		font-weight: 700;
		margin: 0;
		color: #000000;
	}

	.content {
		background: #ffffff;
		border: 2px solid #000000;
		border-radius: 16px;
		padding: 48px;
		box-shadow: 4px 4px 0px #000000;
	}

	.content p {
		font-size: 1.25rem;
		line-height: 1.8;
		color: #000000;
		margin: 0 0 32px 0;
		font-weight: 500;
	}

	.contact-links {
		display: flex;
		justify-content: center;
		gap: 20px;
		flex-wrap: wrap;
	}

	.contact-link {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 32px;
		background: #ffffff;
		color: #000000;
		text-decoration: none;
		border-radius: 16px;
		font-weight: 600;
		font-size: 1.1rem;
		border: 2px solid #000000;
		box-shadow: 3px 3px 0px #000000;
		transition: all 0.2s ease;
	}

	.contact-link:hover {
		background: rgba(23, 241, 209, 1);
		transform: translate(-1px, -1px);
		box-shadow: 4px 4px 0px #000000;
	}

	.contact-link:focus-visible {
		outline: 2px solid rgba(23, 241, 209, 1);
		outline-offset: 2px;
	}

	.contact-link:active {
		transform: translate(1px, 1px);
		box-shadow: 2px 2px 0px #000000;
	}

	.contact-link svg {
		flex-shrink: 0;
	}

	@media (max-width: 768px) {
		main {
			padding: 80px 20px 60px;
		}

		.page-header h1 {
			font-size: 2.5rem;
		}

		.content {
			padding: 32px 24px;
		}

		.content p {
			font-size: 1.1rem;
		}

		.contact-links {
			flex-direction: column;
			align-items: stretch;
		}

		.contact-link {
			justify-content: center;
		}
	}

	@media (max-width: 480px) {
		.page-header h1 {
			font-size: 2rem;
		}

		.content {
			padding: 24px 20px;
		}

		.content p {
			font-size: 1rem;
		}

		.contact-link {
			padding: 14px 24px;
			font-size: 1rem;
		}
	}
</style>