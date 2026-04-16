import {
  AlertCircle,
  Bot,
  Check,
  ChevronRight,
  Database,
  ExternalLink,
  KeyRound,
  Play,
  SlidersHorizontal,
  Square,
  Trash2,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DEFAULT_MODEL_BY_PROVIDER,
  DEFAULT_PROVIDER,
  PROVIDERS,
} from "@/lib/models"
import {
  clearAllChatHistories,
  getApiKeys,
  getSettings,
  removeApiKey,
  saveApiKey,
  saveSettings,
} from "@/lib/storage"
import type { AIProvider, AppSettings } from "@/lib/types"
import { cn } from "@/lib/utils"
import { getApiKeyValidationMessage, isValidApiKey } from "@/lib/validate"

const PROVIDER_ORDER: AIProvider[] = ["openai", "anthropic", "google", "groq"]

const INITIAL_SETTINGS: AppSettings = {
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

type TabState = "providers" | "preferences"

export function Options() {
  const [activeTab, setActiveTab] = useState<TabState>("providers")
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS)
  const [apiKeys, setApiKeys] = useState<Partial<Record<AIProvider, string>>>(
    {}
  )
  const [draftKeys, setDraftKeys] = useState<
    Partial<Record<AIProvider, string>>
  >({})
  const [errorByProvider, setErrorByProvider] = useState<
    Partial<Record<AIProvider, string>>
  >({})
  const [activeProvider, setActiveProvider] = useState<AIProvider>("openai")
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const previewUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const previewStopRequestedRef = useRef(false)
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false)

  useEffect(() => {
    void initialize()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return
    }

    const synth = window.speechSynthesis
    const loadVoices = () => {
      const next = synth.getVoices()
      setVoices(next)
    }

    loadVoices()
    synth.addEventListener("voiceschanged", loadVoices)

    return () => {
      synth.removeEventListener("voiceschanged", loadVoices)
      synth.cancel()
      previewUtteranceRef.current = null
      setIsPreviewingVoice(false)
    }
  }, [])

  async function initialize() {
    const [storedSettings, storedKeys] = await Promise.all([
      getSettings(),
      getApiKeys(),
    ])
    setSettings(storedSettings)
    setApiKeys(storedKeys)
    setDraftKeys(storedKeys)
    setActiveProvider(storedSettings.selectedProvider || "openai")
  }

  const providerData = useMemo(() => {
    const provider = PROVIDERS[activeProvider]
    const key = draftKeys[activeProvider] ?? ""
    const saved = apiKeys[activeProvider] ?? ""
    const selectedModel =
      settings.selectedModelByProvider[activeProvider] ?? provider.defaultModel
    const error = errorByProvider[activeProvider]

    return {
      provider,
      key,
      saved,
      selectedModel,
      error,
    }
  }, [activeProvider, apiKeys, draftKeys, errorByProvider, settings])

  async function handleProviderChange(provider: AIProvider) {
    const nextSettings = { ...settings, selectedProvider: provider }
    setSettings(nextSettings)
    await saveSettings({ selectedProvider: provider })
  }

  async function handleModelChange(provider: AIProvider, model: string) {
    const nextSettings: AppSettings = {
      ...settings,
      selectedModelByProvider: {
        ...settings.selectedModelByProvider,
        [provider]: model,
      },
    }

    setSettings(nextSettings)
    await saveSettings({
      selectedModelByProvider: nextSettings.selectedModelByProvider,
    })
  }

  async function saveProviderKey(provider: AIProvider) {
    const key = (draftKeys[provider] ?? "").trim()
    if (!key) {
      setErrorByProvider((prev) => ({
        ...prev,
        [provider]: "API key cannot be empty.",
      }))
      return
    }

    if (!isValidApiKey(provider, key)) {
      setErrorByProvider((prev) => ({
        ...prev,
        [provider]: getApiKeyValidationMessage(provider),
      }))
      return
    }

    await saveApiKey(provider, key)
    const nextKeys = await getApiKeys()
    setApiKeys(nextKeys)
    setDraftKeys(nextKeys)
    setErrorByProvider((prev) => ({ ...prev, [provider]: "" }))
    toast("API key saved", {
      description: `${PROVIDERS[provider].label} key saved successfully.`,
    })
  }

  async function removeProviderKey(provider: AIProvider) {
    await removeApiKey(provider)
    const nextKeys = await getApiKeys()
    setApiKeys(nextKeys)
    setDraftKeys(nextKeys)
    setErrorByProvider((prev) => ({ ...prev, [provider]: "" }))
    toast("API key removed", {
      description: `${PROVIDERS[provider].label} key removed.`,
    })
  }

  async function clearConversationData() {
    await clearAllChatHistories()
  }

  async function updateTTS(patch: Partial<AppSettings["tts"]>) {
    const next = {
      ...settings.tts,
      ...patch,
    }

    setSettings((prev) => ({ ...prev, tts: next }))
    await saveSettings({ tts: next })
  }

  function previewVoice(voiceURI: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return
    }

    const synth = window.speechSynthesis
    previewStopRequestedRef.current = true
    synth.cancel()
    previewStopRequestedRef.current = false
    setIsPreviewingVoice(false)

    const utterance = new SpeechSynthesisUtterance(
      "Voice preview. Easy WebsiteGPT is ready."
    )
    if (voiceURI) {
      const voice = synth.getVoices().find((item) => item.voiceURI === voiceURI)
      if (voice) {
        utterance.voice = voice
      }
    }

    utterance.onend = () => {
      previewStopRequestedRef.current = false
      previewUtteranceRef.current = null
      setIsPreviewingVoice(false)
    }
    utterance.onerror = () => {
      if (previewStopRequestedRef.current) {
        previewStopRequestedRef.current = false
        previewUtteranceRef.current = null
        setIsPreviewingVoice(false)
        return
      }

      previewUtteranceRef.current = null
      setIsPreviewingVoice(false)
      toast("Voice preview failed")
    }

    previewUtteranceRef.current = utterance
    setIsPreviewingVoice(true)
    synth.speak(utterance)
  }

  function stopVoicePreview() {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return
    }

    previewStopRequestedRef.current = true
    window.speechSynthesis.cancel()
    previewUtteranceRef.current = null
    setIsPreviewingVoice(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Premium Header */}
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
          {/* Logo & Title */}
          <div className="flex flex-1 items-center justify-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <h1 className="hidden text-base font-semibold tracking-tight sm:block">
              Easy WebsiteGPT
            </h1>
          </div>

          {/* Central Navigation Tabs */}
          <nav className="flex flex-1 justify-center">
            <div className="flex items-center rounded-full border bg-muted/40 p-1 shadow-sm">
              <button
                onClick={() => setActiveTab("providers")}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                  activeTab === "providers"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Providers</span>
              </button>
              <button
                onClick={() => setActiveTab("preferences")}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                  activeTab === "preferences"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </button>
            </div>
          </nav>

          {/* Right Action */}
          <div className="flex flex-1 items-center justify-end">
            <a
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              href="https://github.com/aleksa-codes/easy-website-gpt-wxt"
              rel="noopener noreferrer"
              target="_blank"
            >
              <ExternalLink className="size-3.5" />
              <span className="hidden sm:inline">View source</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex min-h-0 flex-1 overflow-hidden bg-muted/20">
        {activeTab === "providers" && (
          <div className="flex h-full w-full flex-col overflow-hidden md:flex-row">
            {/* Left Sidebar: Providers Master List */}
            <div className="flex flex-col border-b bg-muted/10 md:w-[280px] md:border-r md:border-b-0 lg:w-[320px]">
              <div className="border-b bg-background p-4 sm:p-5">
                <h2 className="text-sm font-semibold tracking-tight text-foreground">
                  AI Providers
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Configure your preferred models and API keys to power the
                  chat.
                </p>
              </div>
              <ScrollArea className="flex-1 bg-background/50">
                <div className="p-4">
                  <div className="space-y-1.5">
                    {PROVIDER_ORDER.map((providerId) => {
                      const provider = PROVIDERS[providerId]
                      const isSelected = activeProvider === providerId
                      const hasKey = !!apiKeys[providerId]

                      return (
                        <button
                          key={providerId}
                          onClick={() => setActiveProvider(providerId)}
                          className={cn(
                            "group flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition-all",
                            isSelected
                              ? "border-primary bg-primary/5 text-foreground shadow-sm ring-1 ring-primary/20"
                              : "border-transparent bg-transparent text-foreground hover:bg-black/5 hover:dark:bg-white/5"
                          )}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                                isSelected
                                  ? "bg-primary/20 text-primary"
                                  : "bg-muted text-muted-foreground group-hover:text-foreground"
                              )}
                            >
                              <Database className="h-4 w-4" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="truncate text-sm font-medium">
                                {provider.label}
                              </p>
                              <p
                                className={cn(
                                  "truncate text-xs",
                                  isSelected
                                    ? "text-primary/80"
                                    : "text-muted-foreground"
                                )}
                              >
                                {hasKey ? "Key configured" : "Setup required"}
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 shrink-0 transition-opacity",
                              isSelected
                                ? "text-primary opacity-100"
                                : "opacity-0 group-hover:opacity-40"
                            )}
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Right Pane: Provider Details */}
            <div className="flex flex-1 flex-col bg-background">
              <div className="flex h-full flex-col">
                {/* Detail Header */}
                <div className="flex items-center justify-between border-b px-6 py-8 sm:px-10 sm:py-10">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {providerData.provider.label}
                    </h2>
                    <p className="mt-1.5 max-w-lg text-sm text-muted-foreground">
                      Set up your API key and default model for{" "}
                      {providerData.provider.label}.
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-muted/20 px-6 py-8 sm:px-10">
                  <div className="mx-auto max-w-2xl space-y-8">
                    <Card className="border-border/50 bg-card shadow-sm">
                      <CardHeader className="bg-muted/10 pb-4">
                        <CardTitle className="text-base">
                          Configuration
                        </CardTitle>
                        <CardDescription>
                          Model settings for this provider
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid gap-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor={`${providerData.provider.id}-model`}
                            >
                              Model
                            </Label>
                            <Select
                              onValueChange={(value) => {
                                void handleModelChange(
                                  providerData.provider.id,
                                  value
                                )
                              }}
                              value={providerData.selectedModel}
                            >
                              <SelectTrigger
                                id={`${providerData.provider.id}-model`}
                                className="w-full"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {providerData.provider.models.map((model) => (
                                  <SelectItem
                                    key={model.value}
                                    value={model.value}
                                  >
                                    {model.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              Select the model to use when this provider is
                              active.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`${providerData.provider.id}-key`}>
                              {providerData.provider.apiKeyLabel}
                            </Label>
                            <Input
                              autoCapitalize="off"
                              autoCorrect="off"
                              id={`${providerData.provider.id}-key`}
                              onChange={(event) => {
                                const value = event.target.value
                                setDraftKeys((prev) => ({
                                  ...prev,
                                  [providerData.provider.id]: value,
                                }))
                                if (providerData.error) {
                                  setErrorByProvider((prev) => ({
                                    ...prev,
                                    [providerData.provider.id]: "",
                                  }))
                                }
                              }}
                              placeholder="Paste API key"
                              spellCheck={false}
                              type="password"
                              value={providerData.key}
                            />
                            <p className="text-xs text-muted-foreground">
                              Your API key is stored locally and securely in
                              your browser.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            <Button
                              onClick={() => {
                                void saveProviderKey(providerData.provider.id)
                              }}
                              variant="default"
                            >
                              <KeyRound className="mr-2 size-4" />
                              Save key
                            </Button>
                            <Button
                              disabled={!providerData.saved}
                              onClick={() => {
                                void removeProviderKey(providerData.provider.id)
                              }}
                              variant="outline"
                              className="border-destructive/20 text-destructive hover:border-destructive hover:bg-destructive hover:text-white"
                            >
                              <Trash2 className="mr-2 size-4" />
                              Remove key
                            </Button>
                            <a
                              className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                              href={providerData.provider.docsUrl}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              Get {providerData.provider.label} key
                              <ExternalLink className="size-3" />
                            </a>
                          </div>

                          <AnimatePresence>
                            {providerData.error ? (
                              <motion.div
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                initial={{ opacity: 0, y: -8 }}
                                className="pt-2"
                              >
                                <Alert variant="destructive">
                                  <AlertCircle className="size-4" />
                                  <AlertDescription>
                                    {providerData.error}
                                  </AlertDescription>
                                </Alert>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences / Settings Tab */}
        {activeTab === "preferences" && (
          <div className="mx-auto w-full max-w-4xl animate-in px-6 py-10 duration-300 fade-in slide-in-from-bottom-4">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Preferences
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Keep it simple: provider defaults, voice playback, and local
                data controls.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm">
              <section className="grid gap-4 border-b px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Default AI provider
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Used automatically whenever you open the popup.
                  </p>
                </div>
                <Select
                  onValueChange={(value) => {
                    void handleProviderChange(value as AIProvider)
                  }}
                  value={settings.selectedProvider}
                >
                  <SelectTrigger
                    id="default-provider"
                    className="w-full sm:w-[200px]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_ORDER.map((providerId) => (
                      <SelectItem key={providerId} value={providerId}>
                        {PROVIDERS[providerId].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>

              <section className="space-y-4 border-b px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Text to speech
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Listen to assistant replies with native browser voices.
                    </p>
                  </div>
                  <Button
                    className="h-8 rounded-full px-3"
                    onClick={() => {
                      void updateTTS({ enabled: !settings.tts.enabled })
                    }}
                    size="sm"
                    variant={settings.tts.enabled ? "default" : "outline"}
                  >
                    {settings.tts.enabled ? (
                      <>
                        <Check className="mr-1.5 size-3.5" />
                        On
                      </>
                    ) : (
                      "Off"
                    )}
                  </Button>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tts-voice">Voice</Label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Select
                      onValueChange={(value) => {
                        const nextVoiceURI = value === "default" ? "" : value
                        void updateTTS({ voiceURI: nextVoiceURI })
                      }}
                      value={settings.tts.voiceURI || "default"}
                    >
                      <SelectTrigger id="tts-voice" className="w-full">
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">
                          System default voice
                        </SelectItem>
                        {voices.map((voice) => (
                          <SelectItem
                            key={voice.voiceURI}
                            value={voice.voiceURI}
                          >
                            {voice.name} ({voice.lang})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      className={cn(
                        "sm:shrink-0",
                        isPreviewingVoice &&
                          "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                      )}
                      disabled={voices.length === 0}
                      onClick={() => {
                        if (isPreviewingVoice) {
                          stopVoicePreview()
                        } else {
                          previewVoice(settings.tts.voiceURI)
                        }
                      }}
                      variant="outline"
                    >
                      {isPreviewingVoice ? (
                        <>
                          <Square className="mr-1.5 size-3.5 fill-current" />
                          Stop preview
                        </>
                      ) : (
                        <>
                          <Play className="mr-1.5 size-3.5" />
                          Preview voice
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Voice availability depends on your OS and browser.
                  </p>
                </div>
              </section>

              <section className="space-y-4 px-5 py-5 sm:px-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Data and privacy
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    API keys stay in Chrome sync storage. Chat history is stored
                    locally by URL.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    Permanently delete all saved conversations across all
                    websites.
                  </p>
                  <Button
                    className="sm:shrink-0"
                    onClick={() => {
                      void clearConversationData()
                    }}
                    variant="destructive"
                  >
                    <Trash2 className="mr-2 size-4" />
                    Clear chat history
                  </Button>
                </div>
              </section>
            </div>

            <div className="pt-10 text-center">
              <a
                href="https://github.com/aleksa-codes"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground/70 transition-colors hover:text-primary"
              >
                <Bot className="h-3 w-3" />
                Created by aleksa.codes
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
