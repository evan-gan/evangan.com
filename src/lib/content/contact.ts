// Contact: the About page's "Say hi." block (ContactBlock.svelte), about.md / index.md / llms.txt link
// lists, and JSON-LD sameAs (search engines use it to tie these accounts to you).

export const CONTACT_HEADING = 'Say hi.';
export const CONTACT_BLURB = 'Always happy to talk about new projects or ideas.';

// `icon` picks the chip's SVG in ContactBlock.svelte.
export const PROFILE_LINKS = [
	{ label: 'GitHub', url: 'https://github.com/evan-gan', icon: 'github' },
	{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/evan-gan/', icon: 'linkedin' }
] as const;
