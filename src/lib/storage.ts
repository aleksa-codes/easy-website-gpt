import {
  DEFAULT_MODEL_BY_PROVIDER,
  DEFAULT_PROVIDER,
  getModelForProvider,
  PROVIDERS,
} from "@/lib/models"
import type { AIProvider, AppSettings, Message } from "@/lib/types"

const DEFAULT_SETTINGS: AppSettings = {
  selectedProvider: DEFAULT_PROVIDER,
  selectedModelByProvider: {
    openai: DEFAULT_MODEL_BY_PROVIDER.openai,
    anthropic: DEFAULT_MODEL_BY_PROVIDER.anthropic,
    google: DEFAULT_MODEL_BY_PROVIDER.google,
    groq: DEFAULT_MODEL_BY_PROVIDER.groq,
  },
  tts: {
    enabled: true,
    voiceURI: "",
  },
}

type ApiKeys = Partial<Record<AIProvider, string>>

export async function getApiKeys(): Promise<ApiKeys> {
  const data = await chrome.storage.sync.get({ apiKeys: {}, apiKey: "" })
  const apiKeys = ((data.apiKeys as ApiKeys) || {}) as ApiKeys

  const legacyOpenAIKey = typeof data.apiKey === "string" ? data.apiKey : ""
  if (legacyOpenAIKey && !apiKeys.openai) {
    const migrated = { ...apiKeys, openai: legacyOpenAIKey }
    await chrome.storage.sync.set({ apiKeys: migrated })
    return migrated
  }

  return apiKeys
}

export async function getApiKey(provider: AIProvider): Promise<string | null> {
  const apiKeys = await getApiKeys()
  return apiKeys[provider] ?? null
}

export async function saveApiKey(
  provider: AIProvider,
  apiKey: string
): Promise<void> {
  const existing = await getApiKeys()
  const next = { ...existing, [provider]: apiKey }
  await chrome.storage.sync.set({
    apiKeys: next,
    ...(provider === "openai" ? { apiKey } : {}),
  })
}

export async function removeApiKey(provider: AIProvider): Promise<void> {
  const existing = await getApiKeys()
  const next = { ...existing }
  delete next[provider]
  await chrome.storage.sync.set({
    apiKeys: next,
    ...(provider === "openai" ? { apiKey: "" } : {}),
  })
}

export async function getSettings(): Promise<AppSettings> {
  const data = await chrome.storage.sync.get({ settings: DEFAULT_SETTINGS })
  const incoming = (data.settings as AppSettings) || DEFAULT_SETTINGS

  const isKnownProvider =
    typeof incoming.selectedProvider === "string" &&
    incoming.selectedProvider in PROVIDERS
  const selectedProvider = isKnownProvider
    ? incoming.selectedProvider
    : DEFAULT_SETTINGS.selectedProvider
  const selectedModelByProvider = {
    openai: getModelForProvider(
      "openai",
      incoming.selectedModelByProvider?.openai
    ),
    anthropic: getModelForProvider(
      "anthropic",
      incoming.selectedModelByProvider?.anthropic
    ),
    google: getModelForProvider(
      "google",
      incoming.selectedModelByProvider?.google
    ),
    groq: getModelForProvider("groq", incoming.selectedModelByProvider?.groq),
  }

  return {
    selectedProvider,
    selectedModelByProvider,
    tts: {
      enabled: incoming.tts?.enabled ?? DEFAULT_SETTINGS.tts.enabled,
      voiceURI: incoming.tts?.voiceURI ?? DEFAULT_SETTINGS.tts.voiceURI,
    },
  }
}

export async function saveSettings(
  settings: Partial<AppSettings>
): Promise<void> {
  const existing = await getSettings()
  const mergedModels = {
    ...existing.selectedModelByProvider,
    ...(settings.selectedModelByProvider ?? {}),
  }

  const next: AppSettings = {
    selectedProvider: settings.selectedProvider ?? existing.selectedProvider,
    selectedModelByProvider: {
      openai: getModelForProvider("openai", mergedModels.openai),
      anthropic: getModelForProvider("anthropic", mergedModels.anthropic),
      google: getModelForProvider("google", mergedModels.google),
      groq: getModelForProvider("groq", mergedModels.groq),
    },
    tts: {
      enabled: settings.tts?.enabled ?? existing.tts.enabled,
      voiceURI: settings.tts?.voiceURI ?? existing.tts.voiceURI,
    },
  }

  await chrome.storage.sync.set({ settings: next })
}

export async function saveChatHistory(
  url: string,
  messages: Message[]
): Promise<void> {
  const data = await chrome.storage.local.get({ chatHistories: {} })
  const histories = (data.chatHistories as Record<string, Message[]>) || {}
  histories[url] = messages
  await chrome.storage.local.set({ chatHistories: histories })
}

export async function getChatHistory(url: string): Promise<Message[]> {
  const data = await chrome.storage.local.get({ chatHistories: {} })
  const histories = (data.chatHistories as Record<string, Message[]>) || {}
  return histories[url] ?? []
}

export async function clearChatHistory(url: string): Promise<void> {
  const data = await chrome.storage.local.get({ chatHistories: {} })
  const histories = (data.chatHistories as Record<string, Message[]>) || {}
  delete histories[url]
  await chrome.storage.local.set({ chatHistories: histories })
}

export async function clearAllChatHistories(): Promise<void> {
  await chrome.storage.local.set({ chatHistories: {} })
}
