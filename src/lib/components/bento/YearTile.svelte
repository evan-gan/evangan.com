<script lang="ts">
	import { EARLIER_LABEL, formatProjectCount } from '$lib/projectGroups';
	import StatTile from '../StatTile.svelte';

	interface Props {
		/** A year group label ("2026" or "Earlier"). */
		label: string;
		count: number;
	}

	let { label, count }: Props = $props();
</script>

<!-- Dark tile that opens each year in the projects flow. -->
<StatTile
	label={label === EARLIER_LABEL ? 'Before that' : 'Year'}
	value={label}
	caption={formatProjectCount(count)}
	background="var(--color-inverse)"
	ink="var(--color-bg)"
	labelColor="var(--stat-dark-label)"
	captionColor="var(--stat-dark-secondary)"
/>
