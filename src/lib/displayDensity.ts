// Detects browser zoom (Ctrl/⌘ +) and pinch zoom. Browser zoom changes devicePixelRatio; pinch
// zoom leaves it alone and scales the visual viewport instead, so both are watched.

/** Device pixels per CSS pixel actually on screen: screen density × browser zoom × pinch zoom. */
export function currentDisplayDensity(): number {
	return window.devicePixelRatio * (window.visualViewport?.scale ?? 1);
}

/** The part of the page actually on screen, in getBoundingClientRect coordinates. */
export function visibleViewportRect() {
	const visual = window.visualViewport;
	if (!visual) return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
	return {
		left: visual.offsetLeft,
		top: visual.offsetTop,
		width: visual.width,
		height: visual.height
	};
}

/**
 * Call `onChange` whenever zoom changes. Returns a function that stops watching.
 */
export function watchDisplayDensity(onChange: () => void): () => void {
	let densityQuery: MediaQueryList | null = null;

	// A resolution media query only fires once (when leaving the current ratio), so re-arm it each time.
	function armDensityQuery() {
		densityQuery?.removeEventListener('change', handleDensityChange);
		densityQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
		densityQuery.addEventListener('change', handleDensityChange);
	}

	function handleDensityChange() {
		armDensityQuery();
		onChange();
	}

	armDensityQuery();
	window.visualViewport?.addEventListener('resize', onChange);
	return () => {
		densityQuery?.removeEventListener('change', handleDensityChange);
		window.visualViewport?.removeEventListener('resize', onChange);
	};
}
