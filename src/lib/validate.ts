import { PROVIDERS } from "@/lib/models"
import type { AIProvider } from "@/lib/types"

const KEY_PATTERNS: Record<AIProvider, RegExp> = {
  openai: /^sk-[a-zA-Z0-9-_]{1,250}$/,
  anthropic: /^sk-ant-[a-zA-Z0-9-_]{1,250}$/,
  google: /^[a-zA-Z0-9-_]{20,}$/,
  groq: /^gsk_[a-zA-Z0-9_-]{20,200}$/,
}

export function isValidApiKey(provider: AIProvider, key: string): boolean {
  return KEY_PATTERNS[provider].test(key.trim())
}

export function getApiKeyValidationMessage(provider: AIProvider): string {
  const providerName = PROVIDERS[provider].label
  switch (provider) {
    case "openai":
      return `${providerName} keys should look like sk-...`
    case "anthropic":
      return `${providerName} keys should look like sk-ant-...`
    case "google":
      return `${providerName} keys are long tokens from AI Studio.`
    case "groq":
      return `${providerName} keys should look like gsk_...`
    default:
      return `Invalid ${providerName} API key format.`
  }
}
