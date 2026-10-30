<script lang="ts">
	import { arcPath, dotsPath, fitViewBox, nearestDot, projectToMap } from '$lib/eventMap';

	// The first city is the hub every arc starts from.
	const CITIES = [
		{ name: 'Boston', longitude: -71.06, latitude: 42.36, pin: 'var(--cat-hackathons)', ink: 'var(--cat-hackathons-ink)' },
		{ name: 'Los Angeles', longitude: -118.24, latitude: 34.05, pin: 'var(--cat-programming)', ink: 'var(--cat-programming-ink)' },
		{ name: 'San Francisco', longitude: -122.42, latitude: 37.77, pin: 'var(--cat-programming)', ink: 'var(--cat-programming-ink)' },
		{ name: 'Berlin', longitude: 13.4, latitude: 52.52, pin: 'var(--brand-purple)', ink: 'var(--stat-purple-ink)' }
	];

	const pins = CITIES.map((city) => ({ ...city, ...nearestDot(projectToMap(city.longitude, city.latitude)) }));
	const [hub, ...destinations] = pins;
	const viewBox = fitViewBox(pins);
	const landDots = dotsPath();
</script>

<section class="event-map" aria-label="Places I've run events">
	<!-- meet keeps every pin in view at any tile shape; overflow: visible lets the rest of the map fill the tile
	     around the framed area. yMin pins the frame to the top on narrow tiles, clear of the wrapping city chips. -->
	<svg
		viewBox="{viewBox.x} {viewBox.y} {viewBox.width} {viewBox.height}"
		preserveAspectRatio="xMidYMin meet"
		role="img"
		aria-label="Map with arcs from Boston to Los Angeles, San Francisco and Berlin"
	>
		<path d={landDots} class="land" />
		{#each destinations as city (city.name)}
			<path d={arcPath(hub, city)} class="arc" stroke={city.pin} />
		{/each}
		{#each pins as city (city.name)}
			<circle cx={city.x} cy={city.y} r={city === hub ? 10 : 8} fill={city.pin} class="pin" />
		{/each}
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
		overflow: visible;
	}

	/* stroke-width is the dot diameter, in map units (dots are 20 units apart in the source PNG). */
	.land {
		fill: none;
		stroke: var(--map-dots);
		stroke-width: 8;
		stroke-linecap: round;
	}

	.arc {
		fill: none;
		stroke-width: 3.4;
		stroke-dasharray: 7 8;
		stroke-linecap: round;
	}

	.pin {
		stroke: #ffffff;
		stroke-width: 3.5;
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

	/* On a phone the frame is width-limited (so pins sit near the top) and the chips wrap to two rows: start the
	   map below the heading and make the tile tall enough that the pins clear the chips. */
	@media (max-width: 560px) {
		.event-map {
			min-height: 240px;
		}

		svg {
			top: 44px;
		}
	}
</style>
