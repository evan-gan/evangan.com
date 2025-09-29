<script lang="ts">
	import { onMount } from 'svelte';
	
	let typingText = '';
	let showCursor = true;
	
	const messages = ["Hey there!", "I'm Evan"];
	let currentMessageIndex = 0;
	let currentCharIndex = 0;
	let isDeleting = false;
	
	onMount(() => {
		typeMessage();
		
		// Cursor blinking
		const cursorInterval = setInterval(() => {
			showCursor = !showCursor;
		}, 500);
		
		return () => clearInterval(cursorInterval);
	});
	
	function typeMessage() {
		const currentMessage = messages[currentMessageIndex];
		
		if (isDeleting) {
			typingText = currentMessage.substring(0, currentCharIndex - 1);
			currentCharIndex--;
		} else {
			typingText = currentMessage.substring(0, currentCharIndex + 1);
			currentCharIndex++;
		}
		
		let typingSpeed = isDeleting ? 50 : 100 + Math.random() * 100;
		
		if (!isDeleting && currentCharIndex === currentMessage.length) {
			if (currentMessageIndex === messages.length - 1) {
				// Stay on last message
				return;
			}
			// Pause before deleting
			setTimeout(() => {
				isDeleting = true;
				typeMessage();
			}, 2000);
			return;
		}
		
		if (isDeleting && currentCharIndex === 0) {
			isDeleting = false;
			currentMessageIndex++;
		}
		
		setTimeout(typeMessage, typingSpeed);
	}
</script>

<svelte:head>
	<title>Evan Gans - Developer & Creator</title>
</svelte:head>

<main>
	<!-- Hero Section -->
	<section class="hero-section">
		<div class="hero-content">
			<h1>
				{typingText}<span class="cursor" class:blink={showCursor}>|</span>
			</h1>
		</div>
	</section>

	<!-- About Section -->
	<section class="about-section">
		<div class="container">
			<h2>What I Do</h2>
			<p>
				I'm a passionate developer who loves creating digital experiences that make people's 
				lives better. From web applications to mobile apps and data science projects, 
				I enjoy solving complex problems with elegant solutions.
			</p>
			<a href="/projects" class="cta-button">
				View My Projects
				<span class="arrow">→</span>
			</a>
		</div>
	</section>
</main>

<style>
	:global(body) {
		margin: 0;
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
		color: #f8fafc;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		line-height: 1.6;
		padding-top: 70px; /* Account for fixed navigation */
	}

	.hero-section {
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		background: linear-gradient(135deg, #1a2332 0%, #2d1b1f 50%, #1a2e1f 100%);
		position: relative;
		overflow: hidden;
	}

	.hero-content h1 {
		font-size: 3.5rem;
		font-weight: 700;
		margin: 0;
		color: #f8fafc;
	}

	.cursor {
		display: inline-block;
		width: 3px;
		margin-left: 4px;
		opacity: 1;
		transition: opacity 0.1s;
	}

	.cursor.blink {
		opacity: 0;
	}

	.about-section {
		padding: 120px 0;
		background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 0 20px;
		text-align: center;
	}

	.about-section h2 {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 2rem;
		color: #f8fafc;
	}

	.about-section p {
		font-size: 1.2rem;
		color: #cbd5e1;
		margin-bottom: 3rem;
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.cta-button {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		padding: 16px 32px;
		background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
		color: white;
		text-decoration: none;
		border-radius: 12px;
		font-weight: 600;
		font-size: 1.1rem;
		transition: all 0.3s ease;
		box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
	}

	.cta-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
	}

	.arrow {
		transition: transform 0.3s ease;
	}

	.cta-button:hover .arrow {
		transform: translateX(4px);
	}

	@media (max-width: 768px) {
		.hero-content h1 {
			font-size: 2.5rem;
		}
		
		.about-section h2 {
			font-size: 2rem;
		}
		
		.about-section p {
			font-size: 1.1rem;
		}
	}
</style>
