# Repo Cardify

<p align="center">
  <strong>Design high-quality GitHub social cards in minutes.</strong><br />
  Fetch repository metadata, style every visual block on a live canvas, and export SVG / PNG / JPG assets.
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
| High-quality export | Exports SVG, PNG, and JPG. SVG export embeds font files and inlines avatar data for better portability. |
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

## Usage

1. Enter a repository (`owner/repo` or GitHub URL) and click `Fetch`.
2. Adjust global style options in the right panel (`Theme`, `Typography`, `Pattern`).
3. Click editable blocks on canvas to open block-specific controls (`Avatar`, `Title`, `Description`, `Stats`, `Badges`).
4. Optionally export your current style as a preset JSON, or import one.
5. Download the final card as `SVG`, `PNG`, or `JPG`.

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
  api/github/route.ts       # GitHub proxy + error mapping
  globals.css               # Global styles + light/dark UI theming
  layout.tsx                # Root layout, font links, Tailwind CDN
  page.tsx                  # Next.js route entry
components/
  CardPreview.tsx           # SVG rendering pipeline
  EditorCanvas.tsx          # Interactive drag/resize editing layer
  ControlPanel.tsx          # Main style controls + preset import/export
  BlockPopover.tsx          # Block-specific advanced controls
services/
  githubService.ts          # Client fetch + avatar base64 normalization
  presetService.ts          # Preset sanitize/import/export
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
