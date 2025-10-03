# evangan.com

Hey there! This is my personal portfolio website built with SvelteKit and deployed as a static site.

## Quick Start

> _Tip: Use pnpm. It's nice and more preformat than npm. To install, run `npm install -g pnpm`_

```sh
# Install dependencies
pnpm install

# Start development server (includes /editor route)
pnpm dev

# Build for production (excludes /editor)
pnpm build

# Preview production build
pnpm preview
```

## Development Notes

- **Editor Route**: The `/editor` route is only available in development mode and is automatically excluded from production builds.
- **Static Build**: This site uses `@sveltejs/adapter-static` to generate a fully static site.
- **Preview**: Always use `pnpm install && pnpm build && pnpm preview` to see the actual production output, as the dev server includes development-only features. (the project editor)

## Project Structure

- `/src/routes` - SvelteKit routes
- `/projects` - YAML project data
- `/static` - Static assets (images, thumbnails, etc.)
- `/editor` - Development-only project editor (excluded from build)
