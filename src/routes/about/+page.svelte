<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import AffiliationTile from '$lib/components/AffiliationTile.svelte';
	import StatTile from '$lib/components/StatTile.svelte';
	import EventMapTile from '$lib/components/EventMapTile.svelte';
	import ContactBlock from '$lib/components/ContactBlock.svelte';
	import ProgressiveImage from '$lib/components/ProgressiveImage.svelte';
	import { photoElementAttributes, startPageImageLoading } from '$lib/pageImageLoader';

	let { data } = $props();

	const allProjectsHref = resolve('/projects/[[tag]]', { tag: 'all' });

	function projectHref(projectId: string): string {
		return `${allProjectsHref}#${projectId}`;
	}

	// WPI has no image yet, so its tile renders the striped placeholder; fill in role/detail when known.
	const AFFILIATIONS = [
		{
			name: 'The LigerBots',
			role: 'FIRST Robotics',
			detail: 'Team 2877 · 2022–2026',
			image: '/thumbnails/1760310168343-webp.webp',
			href: 'https://ligerbots.org',
			fill: 'var(--affiliation-ligerbots)',
			labelColor: 'var(--affiliation-ligerbots-label)'
		},
		{
			name: 'Hack Club',
			role: 'Event organizer',
			detail: 'Hackathons for teens · 2024–2026',
			image: '/thumbnails/ShipwreckedGroupPhoto-webp.webp',
			href: 'https://hackclub.com',
			fill: 'var(--affiliation-hackclub)',
			labelColor: 'var(--affiliation-hackclub-label)'
		},
		{
			name: 'Open Sauce',
			role: 'Exhibitor',
			detail: 'Showed my CoreXY pen plotter · 2026',
			image: '/thumbnails/1788642542809-webp.webp',
			href: projectHref('corexy-pen-plotter'),
			fill: 'var(--affiliation-opensauce)',
			labelColor: 'var(--affiliation-opensauce-label)'
		},
		{
			name: 'WPI',
			role: 'Student',
			detail: 'Worcester Polytechnic Institute · 2026-2030',
			fill: 'var(--affiliation-wpi)',
			stripe: 'var(--affiliation-wpi-stripe)',
			labelColor: 'var(--affiliation-wpi-label)'
		}
	];

	function previewOf(image: string): string | null {
		return data.previewByThumbnail[image] ?? null;
	}

	let pageElement: HTMLElement | undefined = $state();

	onMount(() =>
		startPageImageLoading(pageElement!, [
			...AFFILIATIONS.flatMap((affiliation) =>
				affiliation.image ? [{ thumbnail: affiliation.image, preview: previewOf(affiliation.image) }] : []
			),
			...data.recentProjects
		])
	);
</script>

<svelte:head>
	<title>About - Evan Gan</title>
</svelte:head>

<main bind:this={pageElement} class="about-page">
	<div class="widget-grid">
		<section class="intro span-full span-two-rows">
			<img class="intro-photo" src="/photo-of-me.webp" width="888" height="1200" alt="Evan Gan" />
			<div class="intro-text">
				<div class="eyebrow">About</div>
				<h1>Hey, I'm Evan.</h1>
				<p>
					I'm a Robotics Engineering &amp; Computer Science double major at WPI, and I like building things. Mostly software, but also circuit boards, a pen
					plotter, and once an 8-foot guillotine for smashing pumpkins. There's plenty more on
					<a href={allProjectsHref}>my projects page</a>.
				</p>
				<p>
					In high school I was on my FIRST Robotics team, where I did a bit of everything, from CAD and design to
					manufacturing and programming.
				</p>
				<p>I also organize hackathons for teens, which is how I ended up running events from Boston to Berlin.</p>
			</div>
		</section>

		{#each AFFILIATIONS as affiliation (affiliation.name)}
			<div class="span-two-rows">
				<AffiliationTile {...affiliation} preview={affiliation.image ? previewOf(affiliation.image) : null} />
			</div>
		{/each}

		<StatTile
			label="Hackathons run"
			value="7"
			caption="organized and run since 2024"
			background="var(--cat-hackathons)"
			ink="var(--stat-hackathons-ink)"
		/>
		<StatTile
			label="Managed"
			value="$500K"
			caption="in event budgets"
			background="var(--color-inverse)"
			ink="var(--color-bg)"
			labelColor="var(--stat-dark-label)"
			captionColor="var(--stat-dark-secondary)"
		/>
		<StatTile
			label="Biggest event"
			value="130"
			caption="people at Shipwrecked"
			background="var(--stat-purple-tint)"
			ink="var(--stat-purple-ink)"
		/>
		<StatTile
			label="Projects"
			value={String(data.projectCount)}
			background="var(--cat-programming-tint)"
			ink="var(--cat-programming-ink)"
		>
			{#snippet footer()}
				<a class="stat-link" href={allProjectsHref}>see them all ›</a>
			{/snippet}
		</StatTile>

		<section class="recent span-two-cols" aria-labelledby="recent-heading">
			<h2 id="recent-heading" class="recent-heading">Working on lately</h2>
			<div class="recent-list">
				{#each data.recentProjects as project (project.id)}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- projectHref builds on a resolve()d path -->
					<a class="recent-item" href={projectHref(project.id)}>
						<span class="recent-photo" {...photoElementAttributes(project.thumbnail)}>
							<ProgressiveImage src={project.thumbnail} preview={project.preview} />
						</span>
						<span>
							<span class="recent-name">{project.nameText}</span>
							<span class="recent-date">{project.dateDisplay}</span>
						</span>
					</a>
				{/each}
			</div>
		</section>

		<div class="span-two-cols">
			<EventMapTile />
		</div>

		<div class="span-full">
			<ContactBlock id="say-hi" />
		</div>
	</div>
</main>

<style>
	.about-page {
		min-height: 100vh;
		padding: calc(var(--nav-clearance) + 8px) var(--page-gutter) 96px;
		background: var(--color-bg);
		color: var(--color-label);
		font-family: var(--font-text);
		-webkit-font-smoothing: antialiased;
	}

	.widget-grid {
		max-width: var(--page-max-width);
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		grid-auto-rows: 190px;
		gap: 20px;
	}

	.span-full {
		grid-column: 1 / -1;
	}

	.span-two-cols {
		grid-column: span 2;
	}

	.span-two-rows {
		grid-row: span 2;
	}

	.intro {
		display: flex;
		align-items: stretch;
		border-radius: var(--radius-widget);
		background: var(--color-surface);
		overflow: hidden;
	}

	/* Full height at the photo's own aspect ratio, so swapping the photo never needs a re-crop. */
	.intro-photo {
		height: 100%;
		width: auto;
		max-width: 50%;
		object-fit: cover;
		display: block;
		flex-shrink: 0;
	}

	.intro-text {
		flex: 1 1 auto;
		min-width: 0;
		padding: 40px 44px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 14px;
	}

	.eyebrow {
		font-size: 15px;
		font-weight: 600;
		color: var(--color-label-tertiary);
	}

	h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 56px;
		line-height: 1;
		font-weight: 700;
		letter-spacing: -0.04em;
	}

	.intro-text p {
		margin: 0;
		font-size: 19px;
		line-height: 1.55;
		color: var(--color-label-secondary);
	}

	.intro-text p a {
		color: var(--color-label);
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.stat-link {
		display: block;
		margin-top: 6px;
		font-size: 15px;
		font-weight: 600;
		color: inherit;
		text-decoration: none;
	}

	.stat-link:hover {
		text-decoration: underline;
	}

	.recent {
		border-radius: var(--radius-widget);
		background: var(--color-surface);
		padding: 22px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.recent-heading {
		margin: 0;
		font-size: 13px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--cat-programming);
	}

	.recent-list {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 14px;
	}

	.recent-item {
		display: flex;
		gap: 12px;
		align-items: center;
		min-width: 0;
		color: var(--color-label);
		text-decoration: none;
	}

	.recent-photo {
		width: 72px;
		height: 72px;
		flex-shrink: 0;
		border-radius: 16px;
		overflow: hidden;
		background: var(--color-surface-sunken);
	}

	.recent-item > span {
		min-width: 0;
	}

	.recent-name {
		display: block;
		font-size: 16px;
		font-weight: 600;
		line-height: 1.25;
	}

	.recent-item:hover .recent-name {
		color: var(--color-accent);
	}

	.recent-date {
		display: block;
		font-size: 13px;
		line-height: 1.4;
		color: var(--color-label-tertiary);
	}

	@media (max-width: 900px) {
		/* The text column is narrow here, so two fixed rows clip the bio: size the intro row to its text and let
		   the photo stretch to match (object-fit crops it). */
		.widget-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			grid-template-rows: auto;
		}

		.intro {
			grid-row: span 1;
		}

		.intro-photo {
			width: 40%;
			height: auto;
			max-width: none;
		}
	}

	/* Below this the intro stacks, so fixed 190px rows would clip it; tiles keep their own min-heights. */
	@media (max-width: 700px) {
		.widget-grid {
			grid-auto-rows: auto;
		}

		.intro {
			grid-row: auto;
			flex-direction: column;
		}

		.intro-photo {
			width: 100%;
			max-width: none;
			height: auto;
		}

		.intro-text {
			padding: 28px 24px;
		}

		h1 {
			font-size: 44px;
		}
	}

	@media (max-width: 560px) {
		.about-page {
			padding-left: 16px;
			padding-right: 16px;
		}

		.widget-grid {
			grid-template-columns: minmax(0, 1fr);
		}

		.span-two-cols {
			grid-column: span 1;
		}

		.span-two-rows {
			grid-row: span 1;
		}

		.recent-list {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
