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
	<title>Evan Gan - Developer & Creator</title>
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
		padding-top: 80px; /* Account for fixed navigation */
	}

	.hero-section {
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		background: 
			radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
			radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
		position: relative;
		overflow: hidden;
	}

	.hero-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: 
			linear-gradient(135deg, transparent 0%, rgba(139, 92, 246, 0.05) 50%, transparent 100%);
		animation: float 6s ease-in-out infinite;
	}

	@keyframes float {
		0%, 100% { transform: translateY(0px) rotate(0deg); }
		50% { transform: translateY(-20px) rotate(1deg); }
	}

	.hero-content h1 {
		font-size: 4rem;
		font-weight: 700;
		margin: 0;
		color: #f1f5f9;
		background: linear-gradient(135deg, #f1f5f9 0%, #a855f7 50%, #06b6d4 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		position: relative;
		z-index: 1;
	}

	.hero-content h1::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, #8b5cf6, #06b6d4, #10b981);
		opacity: 0.1;
		border-radius: 20px;
		filter: blur(40px);
		z-index: -1;
		animation: glow 3s ease-in-out infinite alternate;
	}

	@keyframes glow {
		from { transform: scale(0.8); opacity: 0.1; }
		to { transform: scale(1.2); opacity: 0.2; }
	}

	.cursor {
		display: inline-block;
		width: 3px;
		margin-left: 4px;
		opacity: 1;
		transition: opacity 0.1s;
		background: linear-gradient(135deg, #8b5cf6, #06b6d4);
		border-radius: 2px;
		box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
	}

	.cursor.blink {
		opacity: 0;
	}

	.about-section {
		padding: 140px 0;
		background: 
			radial-gradient(circle at 70% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
			radial-gradient(circle at 30% 80%, rgba(245, 158, 11, 0.08) 0%, transparent 50%);
		position: relative;
	}

	.about-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: 
			repeating-linear-gradient(
				90deg,
				transparent,
				transparent 98px,
				rgba(139, 92, 246, 0.03) 100px
			);
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 0 24px;
		text-align: center;
		position: relative;
		z-index: 1;
	}

	.about-section h2 {
		font-size: 2.8rem;
		font-weight: 700;
		margin-bottom: 2rem;
		color: #f1f5f9;
		position: relative;
	}

	.about-section h2::after {
		content: '';
		position: absolute;
		bottom: -10px;
		left: 50%;
		transform: translateX(-50%);
		width: 60px;
		height: 4px;
		background: linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981);
		border-radius: 2px;
	}

	.about-section p {
		font-size: 1.3rem;
		color: #e2e8f0;
		margin-bottom: 3rem;
		max-width: 700px;
		margin-left: auto;
		margin-right: auto;
		line-height: 1.7;
	}

	.cta-button {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		padding: 18px 36px;
		background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #10b981 100%);
		color: white;
		text-decoration: none;
		border-radius: 16px;
		font-weight: 600;
		font-size: 1.1rem;
		transition: all 0.4s ease;
		box-shadow: 
			0 8px 32px rgba(139, 92, 246, 0.3),
			0 0 0 1px rgba(255, 255, 255, 0.1);
		position: relative;
		overflow: hidden;
	}

	.cta-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.6s ease;
	}

	.cta-button:hover::before {
		left: 100%;
	}

	.cta-button:hover {
		transform: translateY(-3px) scale(1.02);
		box-shadow: 
			0 12px 40px rgba(139, 92, 246, 0.4),
			0 0 0 1px rgba(255, 255, 255, 0.2);
	}

	.arrow {
		transition: transform 0.4s ease;
		font-size: 1.2rem;
	}

	.cta-button:hover .arrow {
		transform: translateX(6px) rotate(45deg);
	}

	@media (max-width: 768px) {
		.hero-content h1 {
			font-size: 2.8rem;
		}
		
		.about-section {
			padding: 100px 0;
		}
		
		.about-section h2 {
			font-size: 2.2rem;
		}
		
		.about-section p {
			font-size: 1.15rem;
		}
		
		.container {
			padding: 0 20px;
		}
	}
</style>
