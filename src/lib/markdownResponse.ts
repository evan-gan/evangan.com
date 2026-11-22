// Prerendered .md and llms.txt endpoints share these headers. Vercel serves the prerendered files
// statically, so vercel.json repeats the Content-Type for them; this one is what dev and preview use.
export function markdownResponse(markdown: string): Response {
	return new Response(markdown, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
	});
}

export function plainTextResponse(text: string): Response {
	return new Response(text, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
}
