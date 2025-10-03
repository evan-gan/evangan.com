<script lang="ts">
</script>

<svelte:head>
	<title>About - Evan Gan</title>
</svelte:head>

<main>
	<div class="container">
		<h1>About Me</h1>
		<p>
			I'm a passionate developer who loves creating digital experiences that make people's 
			lives better. From web applications to mobile apps and data science projects, 
			I enjoy solving complex problems with elegant solutions.
		</p>
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
		margin-bottom: 1.5rem;
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
	}
</style>
