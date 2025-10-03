<script lang="ts">
</script>

<svelte:head>
	<title>Contact - Evan Gan</title>
</svelte:head>

<main>
	<div class="container">
		<h1>Get In Touch</h1>
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
			<a href="mailto:hello@evangan.com" class="contact-link">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
					<polyline points="22,6 12,13 2,6"></polyline>
				</svg>
				Email
			</a>
		</div>

		<a href="/" class="back-link">← Back to Home</a>
	</div>
</main>

<style>
	main {
		min-height: calc(100vh - 80px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 80px 20px 40px;
	}

	.container {
		max-width: 800px;
		width: 100%;
		text-align: center;
	}

	h1 {
		font-size: 3rem;
		font-weight: 700;
		margin-bottom: 2rem;
		color: #1f2937;
	}

	p {
		font-size: 1.25rem;
		line-height: 1.8;
		color: #4b5563;
		margin-bottom: 3rem;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.contact-links {
		display: flex;
		justify-content: center;
		gap: 2rem;
		margin-bottom: 3rem;
	}

	.contact-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 2rem;
		background: white;
		color: #1f2937;
		text-decoration: none;
		border-radius: 12px;
		font-weight: 600;
		border: 2px solid #e5e7eb;
		transition: all 0.3s ease;
	}

	.contact-link:hover {
		border-color: #8b5cf6;
		color: #8b5cf6;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
	}

	.back-link {
		display: inline-block;
		margin-top: 2rem;
		color: #8b5cf6;
		text-decoration: none;
		font-weight: 600;
		transition: transform 0.3s ease;
	}

	.back-link:hover {
		transform: translateX(-5px);
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 2.5rem;
		}

		p {
			font-size: 1.1rem;
		}

		.contact-links {
			flex-direction: column;
			align-items: center;
		}

		.contact-link {
			width: 100%;
			max-width: 300px;
		}
	}
</style>
