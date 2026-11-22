// Geometry for the About page's event map. Everything is in the pixel space of assets/world-dots.png (see
// mapDots.ts), so city pins and the land dots line up without any extra transform.

import { MAP_DOTS } from './mapDots';

export type MapPoint = { x: number; y: number };
export type ViewBox = { x: number; y: number; width: number; height: number };

// The PNG is a Mercator-style map. These were fitted by hand to landmarks in it (Florida, Dakar, Iberia, the
// Berlin row, the US west coast), so they are only good to about one dot; nearestDot() hides the error.
const PIXELS_PER_DEGREE = 4.3;
const PRIME_MERIDIAN_X = 840;
const EQUATOR_Y = 487;
const PIXELS_PER_MERCATOR_UNIT = PIXELS_PER_DEGREE * (180 / Math.PI);

export function projectToMap(longitude: number, latitude: number): MapPoint {
	const latitudeRadians = (latitude * Math.PI) / 180;
	const mercatorY = Math.log(Math.tan(Math.PI / 4 + latitudeRadians / 2));
	return {
		x: PRIME_MERIDIAN_X + longitude * PIXELS_PER_DEGREE,
		y: EQUATOR_Y - mercatorY * PIXELS_PER_MERCATOR_UNIT
	};
}

/** The land dot closest to `point`. Pins sit on a dot so a coastal city never floats in the sea. */
export function nearestDot(
	point: MapPoint,
	dots: ReadonlyArray<readonly [number, number]> = MAP_DOTS
): MapPoint {
	if (dots.length === 0) throw new Error('nearestDot needs at least one dot; is mapDots.ts empty?');
	let closest = dots[0];
	let closestDistance = Infinity;
	for (const dot of dots) {
		const distance = Math.hypot(dot[0] - point.x, dot[1] - point.y);
		if (distance < closestDistance) {
			closest = dot;
			closestDistance = distance;
		}
	}
	return { x: closest[0], y: closest[1] };
}

export type FitOptions = {
	/** Map units left and right of the outermost pins. */
	sidePadding: number;
	/** Fractions of the box height between which the pins sit; leaves room for the heading and city chips. */
	pinBandTop: number;
	pinBandBottom: number;
};

export const DEFAULT_FIT_OPTIONS: FitOptions = {
	sidePadding: 60,
	pinBandTop: 0.28,
	pinBandBottom: 0.68
};

/**
 * The smallest box that shows every pin with padding, with the pins inside a vertical band.
 *
 * Args:
 *   pins: pin positions in map units (at least one)
 *   options: padding and band, see FitOptions
 *
 * Returns:
 *   An SVG viewBox in map units
 */
export function fitViewBox(pins: MapPoint[], options: FitOptions = DEFAULT_FIT_OPTIONS): ViewBox {
	if (pins.length === 0) throw new Error('fitViewBox needs at least one pin to frame.');
	const xs = pins.map((pin) => pin.x);
	const ys = pins.map((pin) => pin.y);
	const minY = Math.min(...ys);
	// A single row of pins has no height, so give the band a floor rather than dividing down to zero.
	const pinSpanY = Math.max(Math.max(...ys) - minY, 40);
	const height = pinSpanY / (options.pinBandBottom - options.pinBandTop);
	return {
		x: Math.min(...xs) - options.sidePadding,
		y: minY - options.pinBandTop * height,
		width: Math.max(...xs) - Math.min(...xs) + 2 * options.sidePadding,
		height
	};
}

/** Quadratic arc from `from` to `to`, bowed upwards in proportion to its length (like a flight path). */
export function arcPath(from: MapPoint, to: MapPoint, bow = 0.3): string {
	const lift = Math.hypot(to.x - from.x, to.y - from.y) * bow;
	const controlX = (from.x + to.x) / 2;
	const controlY = (from.y + to.y) / 2 - lift;
	return `M${from.x} ${from.y} Q${controlX} ${controlY} ${to.x} ${to.y}`;
}

/** All the dots as one path of zero-length segments; with round caps each renders as a dot of stroke-width. */
export function dotsPath(dots: ReadonlyArray<readonly [number, number]> = MAP_DOTS): string {
	return dots.map(([x, y]) => `M${x} ${y}h0`).join('');
}
