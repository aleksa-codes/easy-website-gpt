# <img src="public/icon/32.png" width="24" height="24" alt=""> Easy WebsiteGPT

Ask questions about the webpage you have open. Easy WebsiteGPT uses the page text as context and keeps a separate chat history for each URL. **You’ll need an API key** from a supported provider.

![Easy WebsiteGPT provider settings beside the toolbar popup with a demo chat](docs/readme-preview.jpg)

[![WXT](https://img.shields.io/badge/WXT-MV3-0ea5e9)](https://wxt.dev/)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![Vercel AI SDK](https://img.shields.io/badge/AI_SDK-v7-111827)](https://ai-sdk.dev/)
[![Bun](https://img.shields.io/badge/Bun-Package_Manager-f9f1e1)](https://bun.sh/)

## Features

- **Chat about the current page:** Ask for a summary or for details from the page. Replies stream as the provider generates them.
- **Choose a provider and model:** Use OpenAI, Anthropic, Google AI, or Groq. Your selected provider receives the page context when you send a message.
- **Resume a conversation:** Chat history is saved locally by page URL.

The preview shows a demo conversation, not a live provider response.

## Quick Start

With [Bun](https://bun.sh/) installed, run:

```sh
bun install
bun run build
```

In `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select `.output/chrome-mv3`. Open the extension’s **Settings**, select a provider, and save its API key. Then open a webpage and ask a question from the popup.

## Development

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `bun run dev`       | Run the Chrome build with hot reload |
| `bun run typecheck` | Check TypeScript                     |
| `bun run format`    | Format with Prettier                 |
| `bun run zip`       | Build a ZIP for the Chrome Web Store |

See [AGENTS.md](AGENTS.md) for notes on page extraction, providers, and chat history.

## License

[MIT](LICENSE)
