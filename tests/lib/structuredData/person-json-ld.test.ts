import { describe, expect, it } from 'vitest';
import { buildPersonJsonLd, jsonLdScriptTag } from '../../../src/lib/structuredData';

describe('buildPersonJsonLd', () => {
	const person = buildPersonJsonLd();

	it('describes a schema.org Person with name, url and description', () => {
		expect(person['@context']).toBe('https://schema.org');
		expect(person['@type']).toBe('Person');
		expect(person.name).toBe('Evan Gan');
		expect(person.url).toBe('https://www.evangan.com/');
		expect(typeof person.description).toBe('string');
	});

	it('links the profiles in sameAs and lists knowsAbout topics', () => {
		expect(person.sameAs).toContain('https://github.com/evan-gan');
		expect((person.knowsAbout as string[]).length).toBeGreaterThan(0);
	});
});

describe('jsonLdScriptTag', () => {
	it('wraps parseable JSON in an ld+json script tag', () => {
		const tag = jsonLdScriptTag({ name: 'Evan' });
		const json = tag.match(/^<script type="application\/ld\+json">(.*)<\/script>$/)?.[1];
		expect(JSON.parse(json!)).toEqual({ name: 'Evan' });
	});

	it('escapes "<" so a value cannot close the script element', () => {
		const tag = jsonLdScriptTag({ name: '</script><script>alert(1)</script>' });
		expect(tag.match(/<\/script>/g)).toHaveLength(1);
		expect(JSON.parse(tag.slice(35, -9)).name).toBe('</script><script>alert(1)</script>');
	});
});
