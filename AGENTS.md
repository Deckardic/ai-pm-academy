<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project conventions (AI PM Academy)

- Architecture is Feature-Sliced Design. Routes in the root `app/` are thin re-exports of `src/pages/*`. Import other slices only through their public API: `index.ts` (client-safe) or `index.server.ts` (server-only). Run `pnpm lint:fsd` after structural changes.
- Cache Components is on: anything that reads the session, cookies, headers, params or searchParams must sit inside `<Suspense>`. Content from `content/` is read synchronously and belongs in the static shell.
- Content lives in `content/` (MDX + YAML) and is validated by `pnpm content:validate`. New MDX components must be added to `src/widgets/lesson-body/model/component-names.ts` and the component map in `lesson-body.tsx`.
- Motion follows Emil Kowalski's rules (see README → «Дизайн и анимации»): use the `--ease-*` tokens, animate only transform/opacity/clip-path, never `transition: all` or `scale(0)`, keep UI animations under 300 ms, don't animate high-frequency interactions, gate hover behind `(hover: hover)`, respect `prefers-reduced-motion`.
- Server actions validate input with Zod and check the session themselves. Quiz answers are graded on the server; correct answers never reach the client.
- Before pushing: `pnpm check` and `pnpm test:e2e` (after `pnpm build`).
