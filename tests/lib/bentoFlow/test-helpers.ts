import type { FlowItem, FlowRow } from '../../../src/lib/bentoFlow';

export const GAP = 20;

export function photo(ratio: number, emphasis = 1): FlowItem {
	return { ratio, emphasis, minHeight: 100 };
}

/** Width a row actually takes, gaps included. */
export function rowWidth(row: FlowRow): number {
	return row.units.reduce((total, unit) => total + unit.width, 0) + GAP * (row.units.length - 1);
}

/** Item indices in the order the rows show them (stacks top then bottom). */
export function displayOrder(rows: FlowRow[]): number[] {
	return rows.flatMap((row) => row.units.flatMap((unit) => (unit.kind === 'single' ? [unit.index] : unit.indices)));
}
