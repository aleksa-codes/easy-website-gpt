import type { UIMessage } from "ai"
export type Message = UIMessage

export interface PageData {
  title: string
  content: string
  url: string
  metadata: {
    description?: string
    keywords?: string
    extractionMethod?: "readability" | "fallback" | "hybrid"
    contentFormat?: "markdown" | "text"
  }
}

export type AIProvider = "openai" | "anthropic" | "google" | "groq"

export interface TTSSettings {
  enabled: boolean
  voiceURI: string
}

export interface ProviderConfig {
  id: AIProvider
  label: string
  apiKeyLabel: string
  docsUrl: string
  models: {
    value: string
    label: string
    tier: "latest" | "balanced" | "cheap"
  }[]
  defaultModel: string
}

export interface AppSettings {
  selectedProvider: AIProvider
  selectedModelByProvider: Record<AIProvider, string>
  tts: TTSSettings
}
