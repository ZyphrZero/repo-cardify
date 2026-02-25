# Repo Cardify

<p align="center">
  <strong>Design high-quality GitHub social cards in minutes.</strong><br />
  Fetch repository metadata, style every visual block on a live canvas, and export SVG / PNG / JPG / WEBP assets.
</p>

<p align="center">
  <a href="./README_ZH.md">简体中文</a>
</p>

<p align="center">
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" />
  <img alt="pnpm" src="https://img.shields.io/badge/Package_Manager-pnpm-f69220?logo=pnpm&logoColor=white" />
</p>

## Overview

Repo Cardify is a Next.js App Router project for generating share-ready repository cards.
It pulls GitHub repository data through a server-side API proxy, lets you edit the visual layout directly on canvas, and exports final assets at social-card size (`1200 x 630`).

## Highlights

| Capability | Details |
| --- | --- |
| Live repository fetch | Supports `owner/repo` or `https://github.com/owner/repo`, with normalized error messages from `app/api/github/route.ts`. |
| Visual card editor | Drag-and-resize editable blocks (avatar, title, description, stats, badges) with snapping guides. |
| Custom styling | 4 themes, 6 font families, 10 hero-pattern overlays, color controls, and per-block settings via popovers. |
| Stats and language badges | Configurable stars/forks/issues display and top language badges (up to 3 languages from GitHub API). |
| High-quality export | Exports SVG, PNG, JPG, and WEBP from a unified download menu. SVG export embeds font files and inlines avatar data for better portability. |
| Preset workflow | Export/import card configuration as JSON with runtime sanitization in `services/presetService.ts`. |
| Built-in localization | UI supports English and Simplified Chinese (`i18n.ts`). |
| UI theme modes | `system`, `light`, and `dark` interface modes with persistent local settings. |

## Quick Start

### Prerequisites

- Node.js `20+` (recommended for Next.js 16)
- `pnpm`

### Install and run

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.

## Environment Variables

Create `.env.local` in the project root:

```bash
GITHUB_TOKEN=your_github_token
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `GITHUB_TOKEN` | No | Increases GitHub API rate limits and enables authenticated repository access through the server route. |
| `LOGO_STORAGE_DIR` | No | Filesystem directory for uploaded custom logos. Default: `<project>/.repo-cardify/logos`. |

## Usage

1. Enter a repository (`owner/repo` or GitHub URL) and click `Fetch`.
2. Adjust global style options in the right panel (`Theme`, `Typography`, `Pattern`).
3. Click editable blocks on canvas to open block-specific controls (`Avatar`, `Title`, `Description`, `Stats`, `Badges`).
4. Optionally export your current style as a preset JSON, or import one.
5. Click the unified `Download` button and choose `SVG`, `PNG`, `JPG`, or `WEBP`.
6. Use `Copy URL`, `Copy Markdown`, `Copy <img />`, or `Copy OG Meta` to embed a live-generated image in your README/site.

## README Embed

After fetching a repository and adjusting styles:

1. Click one of the copy buttons in the export bar.
2. Paste directly into your target repository README.

Generated image endpoint pattern:

```text
https://<your-domain>/<owner>/<repo>/image?c=<compactConfig>&l=<en|zh-CN>
```

Manual examples:

```markdown
![owner/repo](https://your-domain/owner/repo/image?c=...)
```

```html
<img src="https://your-domain/owner/repo/image?c=..." alt="owner/repo" width="1200" height="630" />
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start development server |
| `pnpm build` | Build production bundle |
| `pnpm start` | Run production server |
| `pnpm exec eslint .` | Run lint checks |

## Project Structure

```text
app/
  [owner]/[name]/image/route.ts # Shareable image endpoint for README embedding
  api/logo/route.ts         # Custom logo upload endpoint
  api/logo/[logoId]/route.ts # Stored logo file serving endpoint
  api/github/route.ts       # GitHub proxy + error mapping
  globals.css               # Global styles + light/dark UI theming
  layout.tsx                # Root layout, font links, Tailwind CDN
  page.tsx                  # Next.js route entry
components/
  CardSvg.tsx               # Shared SVG renderer (client preview + server image route)
  CardPreview.tsx           # SVG rendering pipeline
  EditorCanvas.tsx          # Interactive drag/resize editing layer
  ControlPanel.tsx          # Main style controls + preset import/export
  BlockPopover.tsx          # Block-specific advanced controls
services/
  githubService.ts          # Client fetch + avatar base64 normalization
  presetService.ts          # Preset sanitize/import/export
  shareImageService.ts      # Share URL config encode/decode helpers
  exportFontService.ts      # Font embedding for SVG export
App.tsx                     # Main app workflow
i18n.ts                     # Localization messages and helpers
types.ts                    # Shared domain types and defaults
```

## API Contract

### `GET /api/github?repo=<value>`

`repo` accepts:
- `owner/repo`
- `https://github.com/owner/repo`

Response shape:

```json
{
  "owner": "string",
  "name": "string",
  "description": "string | null",
  "stars": 0,
  "forks": 0,
  "issues": 0,
  "language": "string | null",
  "languages": ["string"],
  "avatarUrl": "string"
}
```

### `GET /:owner/:repo/image?c=<compactConfig>&l=<en|zh-CN>`

Returns an `image/svg+xml` response that can be referenced directly in Markdown or HTML image tags.
Supports socialify-style toggle params such as `language`, `owner`, `name`, `stargazers`, `forks`, `issues`, and `theme`.
`c` is generated by the UI copy actions for full-fidelity layout/theme state.

### `POST /api/logo`

Upload a custom logo using multipart form data (`file` field).
Returns a short `logoId` and a share-safe URL (`/api/logo/<logoId>`).

### `GET /api/logo/:logoId`

Returns the stored logo binary for rendering and sharing.

## Verification Checklist

- `pnpm build` passes
- `pnpm exec eslint .` has no newly introduced issues
- Manual smoke test:
  - fetch a repository
  - edit card styles and block layout
  - export PNG successfully

## Troubleshooting

| Problem | Likely cause | Action |
| --- | --- | --- |
| `GitHub API rate limit exceeded` | Missing or low-rate unauthenticated requests | Set `GITHUB_TOKEN` in `.env.local` |
| Avatar not embedded in export | Remote image fetch or CORS fallback issue | Retry with network access, or upload a custom logo manually |
| Exported text font mismatch | Embedded font fetch failed | Check connectivity to `unpkg.com` or retry export |

## Security Notes

- Keep `GITHUB_TOKEN` server-side only (`app/api/github/route.ts`).
- Never commit `.env.local` or any secret file.
- Use minimal GitHub token scopes required for your repositories.
