# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains Next.js App Router entries and global styles.
- `app/api/github/route.ts` is the server-side GitHub proxy and error mapper.
- `App.tsx` is the main client workflow (fetch repo, configure card, export image).
- `components/` holds UI building blocks such as `ControlPanel.tsx` and `CardPreview.tsx`.
- `services/githubService.ts` contains client-side data fetching/normalization logic.
- `types.ts` is the shared contract for enums and interfaces (for example `CardConfig`, `RepoData`).
- Add new assets under `public/` (create it if needed) and keep feature code close to its module.

## Build, Test, and Development Commands
- `pnpm install`: install dependencies.
- `pnpm dev`: run local dev server (default Next.js port).
- `pnpm build`: create a production build; use this as the pre-merge gate.
- `pnpm start`: run the production build locally.
- `pnpm exec eslint .`: run lint checks (there is no dedicated `lint` script yet). Treat current repo-level lint findings as baseline and avoid introducing new ones.

## Coding Style & Naming Conventions
- Language stack: TypeScript + React function components.
- Follow existing style: 2-space indentation, semicolons, single quotes.
- Use `PascalCase` for React components/files (`CardPreview.tsx`), `camelCase` for variables/functions (`fetchRepoDetails`), and `UPPER_SNAKE_CASE` for module constants.
- Extend shared types in `types.ts` instead of duplicating inline interfaces.
- Keep modules focused: UI in `components/`, transport/data mapping in `services/`, API integration in `app/api/`.

## Testing Guidelines
- No automated test framework is configured currently.
- Minimum validation for each change:
- `pnpm build` passes.
- `pnpm exec eslint .` is reviewed; do not add new lint errors.
- Manual smoke test: fetch `owner/repo`, change card settings, export PNG successfully.
- If adding tests, prefer `*.test.ts` / `*.test.tsx` naming and colocate with source or in `__tests__/`.

## Commit & Pull Request Guidelines
- Follow Conventional Commit style seen in history: `feat(scope): ...`, `feat: ...`.
- Write imperative, scoped commit subjects and keep each commit focused.
- PRs should include: objective, key changes, verification steps/commands, linked issue, and screenshots for UI changes.
- Avoid mixing refactors and features unless tightly related.

## Security & Configuration Tips
- Configure `GITHUB_TOKEN` in `.env.local` for higher GitHub API limits.
- Never commit `.env*` files or secrets.
- Keep authenticated GitHub access server-side via `app/api/github/route.ts`.
