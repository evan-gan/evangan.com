import { describe, expect, it } from 'vitest';
import { createSeededRandom, partitionBalanced, shuffleWithRandom } from '../../../src/lib/gallery';

describe('partitionBalanced', () => {
	const sizes = [5, 4, 3, 3, 2, 2, 1];

	it('puts every item in exactly one group', () => {
		const groups = partitionBalanced(sizes, 3, (size) => size);
		expect(groups.flat().sort()).toEqual([...sizes].sort());
	});

	it('keeps group totals within the largest item of each other', () => {
		const totals = partitionBalanced(sizes, 3, (size) => size).map((group) =>
			group.reduce((sum, size) => sum + size, 0)
		);
		expect(Math.max(...totals) - Math.min(...totals)).toBeLessThanOrEqual(Math.max(...sizes));
	});

	it('leaves extra groups empty when there are fewer items than groups', () => {
		const groups = partitionBalanced([1], 3, (size) => size);
		expect(groups.filter((group) => group.length === 0)).toHaveLength(2);
	});
});

describe('shuffleWithRandom', () => {
	it('keeps the same items and does not mutate the input', () => {
		const original = [1, 2, 3, 4, 5];
		const shuffled = shuffleWithRandom(createSeededRandom(1), original);
		expect([...shuffled].sort()).toEqual(original);
		expect(original).toEqual([1, 2, 3, 4, 5]);
	});

	it('gives the same order for the same seed', () => {
		const list = Array.from({ length: 20 }, (unused, index) => index);
		expect(shuffleWithRandom(createSeededRandom(42), list)).toEqual(
			shuffleWithRandom(createSeededRandom(42), list)
		);
	});
});

describe('createSeededRandom', () => {
	it('returns numbers in [0, 1)', () => {
		const random = createSeededRandom(99);
		for (let i = 0; i < 1000; i++) {
			const value = random();
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThan(1);
		}
	});
});
