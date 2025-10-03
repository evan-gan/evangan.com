<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</svelte:head>

{@render children?.()}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background: #ffffff;
		color: #000000;
		font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		line-height: 1.6;
		min-height: 100vh;
	}
	
	:global(*) {
		box-sizing: border-box;
	}
	
	:global(::selection) {
		background: rgba(255, 208, 116, 0.3);
		color: #000000;
	}
</style>
