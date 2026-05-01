# React/shadcn Animation Integration Notes

This workspace is currently a static HTML/CSS/JS prototype, not a React, TypeScript, Tailwind, or shadcn project. I adapted the supplied animation ideas directly into the static page:

- `DottedSurface` became a fixed canvas wave field in `script.js`.
- Cursor `Spotlight` became CSS variables driven by pointer movement.
- `SplineScene` became a Spline web viewer section in `index.html`.

If this page is later moved into a React/shadcn app, use this setup:

```bash
npx shadcn@latest init
npm install three next-themes @splinetool/runtime @splinetool/react-spline framer-motion
```

Expected paths:

- Components: `components/ui`
- Shared utility: `lib/utils.ts`
- Global styles: `app/globals.css` or `src/app/globals.css`

`components/ui` matters because the pasted imports assume aliases like `@/components/ui/dotted-surface` and `@/lib/utils`. If a project uses a different component folder, either create `components/ui` or update the import aliases consistently.
