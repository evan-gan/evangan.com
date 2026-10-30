<script lang="ts">
	// Stylised (not geographic) map: Boston in the middle, arcs out to the other event cities.
	const CITIES = [
		{ name: 'Boston', ink: 'var(--cat-hackathons-ink)' },
		{ name: 'Los Angeles', ink: 'var(--cat-programming-ink)' },
		{ name: 'San Francisco', ink: 'var(--cat-programming-ink)' },
		{ name: 'Berlin', ink: 'var(--stat-purple-ink)' }
	];
</script>

<section class="event-map" aria-label="Places I've run events">
	<svg viewBox="0 0 560 190" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Arcs from Boston to Los Angeles, San Francisco and Berlin">
		<defs>
			<pattern id="event-map-dots" width="12" height="12" patternUnits="userSpaceOnUse">
				<circle cx="2" cy="2" r="1.3" fill="var(--map-dots)" />
			</pattern>
		</defs>
		<rect width="560" height="190" fill="url(#event-map-dots)" />
		<path d="M248 92 Q170 30 92 112" class="arc" stroke="var(--cat-programming)" />
		<path d="M248 92 Q160 10 70 96" class="arc" stroke="var(--cat-programming)" />
		<path d="M248 92 Q350 10 432 70" class="arc" stroke="var(--brand-purple)" />
		<circle cx="248" cy="92" r="8" fill="var(--cat-hackathons)" class="pin" />
		<circle cx="92" cy="112" r="6" fill="var(--cat-programming)" class="pin" />
		<circle cx="70" cy="96" r="6" fill="var(--cat-programming)" class="pin" />
		<circle cx="432" cy="70" r="6" fill="var(--brand-purple)" class="pin" />
	</svg>
	<h2 class="heading">Where I've run events</h2>
	<ul class="cities">
		{#each CITIES as city (city.name)}
			<li style:color={city.ink}>{city.name}</li>
		{/each}
	</ul>
</section>

<style>
	.event-map {
		position: relative;
		min-height: 190px;
		height: 100%;
		border-radius: var(--radius-widget);
		overflow: hidden;
		background: var(--map-ground);
	}

	svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.arc {
		fill: none;
		stroke-width: 2.5;
		stroke-dasharray: 5 6;
		stroke-linecap: round;
	}

	.pin {
		stroke: #ffffff;
		stroke-width: 3;
	}

	.heading {
		position: absolute;
		left: 22px;
		top: 18px;
		margin: 0;
		font-size: 13px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--cat-programming-ink);
	}

	.cities {
		position: absolute;
		left: 22px;
		right: 22px;
		bottom: 18px;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.cities li {
		padding: 5px 10px;
		border-radius: var(--radius-pill);
		background: var(--color-surface);
		font-size: 13px;
		font-weight: 600;
		line-height: 1.2;
	}
</style>
