<script lang="ts">
	import { resolve } from '$app/paths';
	import { BIO_PARAGRAPHS, KNOWS_ABOUT, PERSON_NAME, PERSON_SUMMARY } from '$lib/content/profile';

	interface IntroProject {
		id: string;
		nameText: string;
		taglineText: string;
	}

	interface Props {
		projects: IntroProject[];
	}

	let { projects }: Props = $props();

	const allProjectsHref = resolve('/projects/[[tag]]', { tag: 'all' });
</script>

<!-- The home page is all photos and two big link words, so this text is visually hidden. It gives
     screen readers a heading and summary, and is the page's text for agents that don't run JavaScript. -->
<section class="sr-only" aria-labelledby="home-intro-heading">
	<h1 id="home-intro-heading">{PERSON_NAME}</h1>
	<p>{PERSON_SUMMARY}</p>
	<p>{BIO_PARAGRAPHS[0]}</p>
	<p>Topics: {KNOWS_ABOUT.join(', ')}.</p>
	<h2>Recent projects</h2>
	<ul>
		{#each projects as project (project.id)}
			<li>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- builds on a resolve()d path -->
				<a href={`${allProjectsHref}#${project.id}`}>{project.nameText}</a>: {project.taglineText}
			</li>
		{/each}
	</ul>
</section>
