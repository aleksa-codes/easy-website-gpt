# 🤖 Easy WebsiteGPT (WXT)

> April 2026 update: migrated from CRXJS and improved with a cleaner architecture and updated UI.

Chat with the currently opened webpage using multiple AI providers, with strict page-grounded answers and persistent per-URL chat history.

[![WXT](https://img.shields.io/badge/WXT-MV3-0ea5e9)](https://wxt.dev/)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vercel AI SDK](https://img.shields.io/badge/AI_SDK-v6-111827)](https://ai-sdk.dev/)
[![Bun](https://img.shields.io/badge/Bun-Package_Manager-f9f1e1)](https://bun.sh/)

## Features

- Page-grounded chat: responses are instructed to use only the current webpage content.
- Multi-provider support: OpenAI, Anthropic, Google AI, and Groq.
- Streaming responses: real-time token streaming with reasoning parts where available.
- Better page extraction: Readability + Linkedom + Turndown for cleaner context.
- Per-page history: conversation state is saved by page URL and restored automatically.
- Built-in settings: provider/model selection, API key management, and TTS preferences.
- Modern extension UI: React 19 + Tailwind v4 + shadcn/ui primitives.

## Quick Start

```bash
# Install dependencies
bun install

# Run extension in dev mode
bun run dev
```

Then load the extension from `.output/chrome-mv3` in `chrome://extensions` (Developer Mode -> Load unpacked).

## Scripts

| Command                 | Description                         |
| ----------------------- | ----------------------------------- |
| `bun run dev`           | Run extension in dev mode           |
| `bun run dev:firefox`   | Run extension in dev mode (Firefox) |
| `bun run build`         | Build production bundle             |
| `bun run build:firefox` | Build production bundle (Firefox)   |
| `bun run zip`           | Create production zip               |
| `bun run zip:firefox`   | Create production zip (Firefox)     |
| `bun run typecheck`     | Run TypeScript checks               |
| `bun run format`        | Format repository with Prettier     |

## Project Structure

```txt
src/
├─ entrypoints/         # background + popup/options entry files
├─ features/            # screen-level React features
├─ components/          # chat/settings components and shared UI
├─ components/ui/       # shadcn-style UI primitives
├─ lib/                 # AI pipeline, extraction, models, storage, types
└─ assets/              # global Tailwind stylesheet
```

## How It Works

1. Popup requests the active tab content through `chrome.scripting.executeScript`.
2. Content is cleaned with Readability and converted to markdown context.
3. `useChat` streams model output using AI SDK v6 transport.
4. Provider/model routing happens in the shared AI pipeline.
5. Settings/API keys are stored in `chrome.storage.sync`; chat history is stored in `chrome.storage.local` keyed by URL.

## AI Providers

- OpenAI
- Anthropic
- Google AI
- Groq

Each provider requires its own API key in Settings.

## Load In Chrome

1. Run `bun run build`.
2. Open `chrome://extensions`.
3. Enable Developer Mode.
4. Click Load unpacked.
5. Select `.output/chrome-mv3`.

## Tech Stack

- [WXT](https://wxt.dev/) for MV3 extension tooling
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [Vercel AI SDK v6](https://ai-sdk.dev/) with provider SDKs
- [@mozilla/readability](https://www.npmjs.com/package/@mozilla/readability), [linkedom](https://www.npmjs.com/package/linkedom), [turndown](https://www.npmjs.com/package/turndown)
- [Bun](https://bun.sh/) for package management and scripts

## License

MIT License. See [LICENSE](LICENSE) for details.
