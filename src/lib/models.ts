import type { AIProvider, ProviderConfig } from "@/lib/types"

export const PROVIDERS: Record<AIProvider, ProviderConfig> = {
  openai: {
    id: "openai",
    label: "OpenAI",
    apiKeyLabel: "OpenAI API key",
    docsUrl: "https://platform.openai.com/api-keys",
    defaultModel: "gpt-5.4-mini",
    models: [
      { value: "o4-mini", label: "o4-mini (reasoning)", tier: "latest" },
      { value: "gpt-5.4-pro", label: "GPT-5.4 Pro (latest)", tier: "latest" },
      { value: "gpt-5.4", label: "GPT-5.4 (balanced)", tier: "balanced" },
      {
        value: "gpt-5.4-mini",
        label: "GPT-5.4 Mini (cheap)",
        tier: "cheap",
      },
    ],
  },
  anthropic: {
    id: "anthropic",
    label: "Anthropic",
    apiKeyLabel: "Anthropic API key",
    docsUrl: "https://console.anthropic.com/settings/keys",
    defaultModel: "claude-sonnet-4-6",
    models: [
      {
        value: "claude-opus-4-6",
        label: "Claude Opus 4.6 (latest)",
        tier: "latest",
      },
      {
        value: "claude-sonnet-4-6",
        label: "Claude Sonnet 4.6 (balanced)",
        tier: "balanced",
      },
      {
        value: "claude-haiku-4-5",
        label: "Claude Haiku 4.5 (cheap)",
        tier: "cheap",
      },
    ],
  },
  google: {
    id: "google",
    label: "Google AI",
    apiKeyLabel: "Google AI Studio API key",
    docsUrl: "https://aistudio.google.com/app/apikey",
    defaultModel: "gemini-3.1-pro-preview",
    models: [
      {
        value: "gemini-3.1-pro-preview",
        label: "Gemini 3.1 Pro (latest)",
        tier: "latest",
      },
      {
        value: "gemini-3-flash",
        label: "Gemini 3.1 Flash (balanced)",
        tier: "balanced",
      },
      {
        value: "gemini-3.1-flash-lite-preview",
        label: "Gemini 3.1 Flash Lite (cheap)",
        tier: "cheap",
      },
    ],
  },
  groq: {
    id: "groq",
    label: "Groq",
    apiKeyLabel: "Groq API key",
    docsUrl: "https://console.groq.com/keys",
    defaultModel: "llama-3.3-70b-versatile",
    models: [
      {
        value: "llama-3.3-70b-versatile",
        label: "MetaLlama 3.3 70B",
        tier: "latest",
      },
      {
        value: "llama-3.1-8b-instant",
        label: "MetaLlama 3.1 8B",
        tier: "balanced",
      },
      {
        value: "openai/gpt-oss-120b",
        label: "OpenAI GPT OSS 120B",
        tier: "latest",
      },
      {
        value: "openai/gpt-oss-20b",
        label: "OpenAI GPT OSS 20B",
        tier: "cheap",
      },
      {
        value: "groq/compound",
        label: "Groq Compound",
        tier: "latest",
      },
      {
        value: "groq/compound-mini",
        label: "Groq Compound Mini",
        tier: "cheap",
      },
    ],
  },
}

export const DEFAULT_PROVIDER: AIProvider = "openai"

export const DEFAULT_MODEL_BY_PROVIDER = {
  openai: PROVIDERS.openai.defaultModel,
  anthropic: PROVIDERS.anthropic.defaultModel,
  google: PROVIDERS.google.defaultModel,
  groq: PROVIDERS.groq.defaultModel,
} as const

export function getModelForProvider(
  provider: AIProvider,
  selectedModel?: string
): string {
  const config = PROVIDERS[provider]
  if (!selectedModel) return config.defaultModel

  const exists = config.models.some((model) => model.value === selectedModel)
  return exists ? selectedModel : config.defaultModel
}
