# evangan.com - AI Coding Agent Instructions

## Architecture Overview

This is a **static portfolio site** built with SvelteKit (`@sveltejs/adapter-static`) and deployed to Vercel. The key architectural decision is maintaining a **dev-only editor** that's excluded from production builds.

### Dual-Mode Operation
- **Development**: Includes `/editor` route with Node.js APIs for YAML editing
- **Production**: Pure static site, all dev-only routes excluded via `adapter-static` with `strict: false`
- API routes at `/api/*` use `export const prerender = false` and check `if (!dev)` to ensure dev-only access

## Project Data Architecture

### YAML Structure (`projects/projects.yaml`)
Projects are stored in a dual-format YAML file supporting both legacy (array) and current (object) formats:

```yaml
tagOrder:              # Controls category filter order
  - Highlights
  - Hackathons I Ran
  - Programming Projects
projects:              # Array of project objects
  - date: "Oct 3, 2025"
    name: "..."
    categories: ["Programming Projects"]
    # ... other fields
```

### Data Flow
1. **Editor (dev only)**: `/editor` → `/api/projects` → direct YAML read/write via Node.js `fs/promises`
2. **Gallery (all modes)**: `src/lib/projects.ts` → `normalizeProjects()` → sorted, categorized data
3. **Date Parsing**: Custom `formatDate()` in `src/lib/date.ts` handles ranges ("Aug 8–11, 2025"), single dates, month-year, year-only

### Key Normalization Logic
- `normalizeProjects()` handles both YAML formats seamlessly
- Projects auto-sorted by date (newest first) using custom `parseDate()` with year → month → day comparison
- Tag ordering: Categories sorted by `tagOrder` array, unlisted categories appended by importance
- URL normalization: Auto-adds `https://` to bare domains, preserves local paths starting with `/`

## Design System: Brutalist Aesthetic

### Core Design Patterns
- **Borders**: 2-3px solid black (`#000000`)
- **Shadows**: Hard drop shadows
  - Base: `2px 2px 0px #000000`
  - Hover: `3px 3px 0px #000000`
  - Large boxes: `8px 8px 0px #000000` → `10px 10px 0px #000000` on hover
- **Colors**: 
  - Yellow: `rgba(255, 208, 116, 1)`
  - Turquoise: `rgba(23, 241, 209, 1)` 
  - Purple: `rgba(176, 135, 255, 1)`
- **Typography**: DM Sans font, bold weights, black text
- **Backgrounds**: Solid colors only - **NEVER use gradients**

### Lift Effect Pattern
```css
.element {
  box-shadow: 2px 2px 0px #000000;
  transition: all 0.3s ease;
}
.element:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0px #000000;
}
```

## Critical Development Workflows

### Adding/Editing Projects
1. Run `pnpm dev` (port 5173)
2. Navigate to `/editor` (dev-only route)
3. Use visual editor - changes auto-save to `projects/projects.yaml`
4. Date validation: ⚠️ emoji shows if `formatDate()` can't parse the date
5. Tag Order editor: Drag-and-drop to reorder category filters
6. Auto-cleanup: Unused categories removed from `tagOrder` on save

### Image Compression Workflow
Run `./compress-thumbnails.sh` to:
- Compress images with ImageMagick: `-auto-orient -quality 50 -sampling-factor 4:2:0 -strip -interlace JPEG`
- Creates `-compressed` suffix versions
- Auto-updates filenames in `projects.yaml` via `sed`
- Archives originals to `oldNonCompressedAssets/`
- **Critical**: `-auto-orient` runs *before* `-strip` to prevent rotation issues

### Build & Preview Commands
- **Dev**: `pnpm dev` - includes `/editor`, Node.js APIs enabled
- **Production Preview**: `pnpm install && pnpm build && pnpm preview` - exact production output
- **Never** test static features in dev mode - APIs won't be available in production

## SvelteKit-Specific Patterns

### Static Site Configuration
```javascript
// svelte.config.js
adapter: adapter({
  pages: 'build',
  assets: 'build',
  fallback: undefined,
  strict: false  // Allows dev-only routes to be excluded
})
```

### Prerendering Control
- Root layout: `export const prerender = true` (in `+layout.ts`)
- API routes: `export const prerender = false` + `if (!dev)` guards

### Conditional Routes
- Site logo in `+layout.svelte`: Hidden on `/editor` via `{#if !$page.url.pathname.startsWith('/editor')}`
- This pattern prevents editor-only UI from appearing in production

## Common Patterns & Conventions

### Image Loading States
Projects gallery uses Set-based tracking to prevent wrong thumbnail display:
```svelte
let loadedImages = new Set<string>();

// Clear on filter change to force reload
$: {
  filteredProjects = /* ... */;
  loadedImages = new Set();
}
```
Skeleton loaders show until `handleImageLoad()` adds URL to Set.

### Tag Ordering System
1. Editor provides drag-and-drop tag reordering (HTML5 native drag events)
2. `tagOrder` array in YAML controls filter button sequence
3. `filterItems` computed: Ordered tags first, unlisted categories appended
4. First item in `filterItems` is default selected filter

### Date Validation in Editor
```svelte
$: isDateValid = editedProject ? formatDate(editedProject.date) !== editedProject.date : true;
```
If `formatDate()` returns unchanged string, date is unparseable → show ⚠️ warning.

## Deployment (Vercel)

### Configuration (`vercel.json`)
```json
{
  "installCommand": "pnpm install",
  "buildCommand": "pnpm build",
  "outputDirectory": "build",
  "trailingSlash": false,
  "cleanUrls": true  // Enables /about instead of /about.html
}
```

### Static Site Routing
- `cleanUrls: true` handles direct URL access (no 404s)
- All routes prerendered except API routes (which are excluded from build)

## File Operations

### YAML Read/Write (Dev Only)
```typescript
// API routes check dev mode
if (!dev) throw error(404, 'Not found');

// Direct file access via Node.js
import { readFile, writeFile } from 'fs/promises';
const content = await readFile(PROJECTS_FILE, 'utf-8');
```

### Image Upload (Dev Only)
Editor supports drag-and-drop thumbnail upload via `/api/upload-thumbnail` - saves to `static/thumbnails/`.

## Testing & Validation

- **Build Check**: Always run `pnpm build` before deploying - catches static adapter issues
- **Route Access**: Test direct URL access in preview mode (simulates Vercel routing)
- **Image Compression**: Verify `-compressed` suffix before compression to avoid re-compressing
- **YAML Structure**: Both array and object formats must work for backward compatibility
