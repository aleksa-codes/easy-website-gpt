# AGENTS.md

## Project Purpose

This repository is the WXT-based version of **Easy WebsiteGPT**.
It lets users chat with the currently visited webpage using multiple AI providers. The core behavior is webpage-grounded Q&A: answers should be based on extracted page content.

## Stack

- WXT (`wxt.config.ts`) with `srcDir: "src"`
- React 19 + TypeScript
- Tailwind CSS v4 via `@tailwindcss/vite`
- shadcn/ui components
- AI SDK v6 (`ai`, `@ai-sdk/react`) + provider SDKs
- Bun package manager (`bun.lock`)

## Core Architecture

- Background worker: `src/entrypoints/background.ts`
  - Lightweight MV3 background entry.
- Popup chat UI: `src/features/popup/popup.tsx`
  - Uses `useChat` from `@ai-sdk/react` with custom transport.
  - Streams text + reasoning parts and persists history by URL.
- Options UI: `src/features/options/options.tsx`
  - Provider/model selection and API key management.
  - Data management actions (clear chat history).
- AI pipeline: `src/lib/ai.ts`
  - Multi-provider model routing.
  - `streamText` + UI message streaming response.
  - Groq reasoning handling (`reasoningFormat` + extraction middleware).
- Page extraction: `src/lib/page-content.ts`, `src/lib/scrape.ts`
  - Extract page HTML via `chrome.scripting.executeScript`.
  - Clean article extraction with Readability + Linkedom.
  - Convert article HTML to markdown with Turndown.
- Storage: `src/lib/storage.ts`
  - `chrome.storage.sync`: settings + API keys
  - `chrome.storage.local`: chat histories keyed by page URL

## Data Model

Defined in `src/lib/types.ts`:

- `PageData`: `{ title, content, url, metadata }`
- `AppSettings`:
  - `selectedProvider`
  - `selectedModelByProvider`
- `Message`: AI SDK `UIMessage`

## Development Rules

1. Preserve the product intent: answer questions about the **current webpage content**, not general knowledge.
2. Keep page extraction clean and robust; prefer improvements that reduce boilerplate/noise in extracted content.
3. Maintain AI SDK v6 patterns (`useChat`, `UIMessage.parts`, stream response helpers).
4. Preserve multi-provider behavior and model validation in `src/lib/models.ts`.
5. Prefer `@/` imports (maps to `src/`).
6. Keep architecture simple and functional; avoid unnecessary service/object layers.

## Commands

- `bun run typecheck`
- `bun run build`
- `bun run dev`

Always run `typecheck` + `build` before handing off significant changes.

## UI / Asset Notes

- Extension icons are sourced from `public/icon/` (`16`, `32`, `48`, `96`, `128`).
- `wxt.config.ts` must reference `icon/*` paths for manifest icons.
- If new icon sizes are needed, generate from a larger source image with macOS `sips`.
