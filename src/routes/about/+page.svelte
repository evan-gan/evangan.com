<script lang="ts">
</script>

<svelte:head>
	<title>About - Evan Gan</title>
</svelte:head>

<main>
	<div class="container">
		<header class="page-header">
			<h1>About Me</h1>
		</header>

		<div class="content">
			<p>
				I'm a passionate developer who loves creating digital experiences that make people's lives better. 
				From web applications to mobile apps and data science projects, I enjoy solving complex problems with elegant solutions.
			</p>
			<p>
				Check out my <a href="/projects">projects page</a> to see what I've been working on.
			</p>
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
		margin: 0 0 24px 0;
		font-weight: 500;
	}

	.content p:last-child {
		margin-bottom: 0;
	}

	.content a {
		color: rgba(23, 241, 209, 1);
		text-decoration: underline;
		text-underline-offset: 2px;
		font-weight: 600;
		transition: color 0.2s ease, text-decoration-thickness 0.2s ease;
	}

	.content a:hover {
		color: rgba(176, 135, 255, 1);
		text-decoration-thickness: 2px;
	}

	.content a:focus-visible {
		outline: 2px solid rgba(23, 241, 209, 1);
		outline-offset: 2px;
		border-radius: 2px;
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
	}
</style>