import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useEffect, useMemo, useRef, useState } from "react"

import { ChatMessage } from "@/components/chat-message"
import { SettingsDialog } from "@/components/settings-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { generateChatResponse } from "@/lib/ai"
import { DEFAULT_PROVIDER, getModelForProvider } from "@/lib/models"
import { getPageContent } from "@/lib/page-content"
import {
  clearChatHistory,
  getApiKeys,
  getChatHistory,
  getSettings,
  removeApiKey,
  saveApiKey,
  saveChatHistory,
  saveSettings,
} from "@/lib/storage"
import type { AIProvider, AppSettings, Message, PageData } from "@/lib/types"
import {
  AlertTriangle,
  Bot,
  Loader2,
  RotateCcw,
  Send,
  Settings,
  StopCircle,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"

const MAX_MESSAGES = 20

const EMPTY_PAGE_DATA: PageData = {
  title: "",
  content: "",
  url: "",
  metadata: {},
}

const DEFAULT_SETTINGS: AppSettings = {
  selectedProvider: DEFAULT_PROVIDER,
  selectedModelByProvider: {
    openai: "gpt-5.4-mini",
    anthropic: "claude-sonnet-4-6",
    google: "gemini-3.1-pro-preview",
    groq: "meta-llama/llama-4-scout-17b-16e-instruct",
  },
  tts: {
    enabled: true,
    voiceURI: "",
  },
}

export function Popup() {
  const [input, setInput] = useState("")
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [apiKeys, setApiKeys] = useState<Partial<Record<AIProvider, string>>>(
    {}
  )
  const [pageData, setPageData] = useState<PageData>(EMPTY_PAGE_DATA)
  const [speakingMessageKey, setSpeakingMessageKey] = useState<string | null>(
    null
  )

  const provider = settings.selectedProvider
  const selectedModel = getModelForProvider(
    provider,
    settings.selectedModelByProvider[provider]
  )
  const activeApiKey = apiKeys[provider]?.trim() ?? ""

  const stateRef = useRef({ provider, selectedModel, activeApiKey, pageData })
  useEffect(() => {
    stateRef.current = { provider, selectedModel, activeApiKey, pageData }
  }, [provider, selectedModel, activeApiKey, pageData])

  const {
    messages,
    setMessages,
    sendMessage,
    stop: stopStreaming,
    error: chatError,
    status,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: async (_input, init) => {
        const body = JSON.parse(init?.body as string)
        const { provider, selectedModel, activeApiKey, pageData } =
          stateRef.current
        return await generateChatResponse(
          provider,
          selectedModel,
          activeApiKey,
          body.messages,
          pageData,
          init?.signal as AbortSignal
        )
      },
    }),
    onFinish: ({ messages: finalMessages }) => {
      const { pageData } = stateRef.current
      if (pageData.url) {
        saveChatHistory(pageData.url, finalMessages as Message[]).catch(
          console.error
        )
      }
    },
  })

  const loading = status === "submitted" || status === "streaming"

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const shouldAutoScrollRef = useRef(true)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const ttsStopRequestedRef = useRef(false)

  const isStreaming = loading

  const messageLimitReached = useMemo(
    () => messages.length >= MAX_MESSAGES,
    [messages.length]
  )

  useEffect(() => {
    void initialize()
  }, [])

  useEffect(() => {
    if (chatError) {
      toast("Request failed", { description: chatError.message })
    }
  }, [chatError])

  useEffect(() => {
    if (shouldAutoScrollRef.current && isStreaming) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
    }
  }, [messages, isStreaming])

  async function initialize() {
    const [storedSettings, storedKeys, content] = await Promise.all([
      getSettings(),
      getApiKeys(),
      getPageContent(),
    ])

    setSettings(storedSettings)
    setApiKeys(storedKeys)
    setPageData(content)

    if (content.url) {
      const history = await getChatHistory(content.url)
      setMessages(history)
    }
  }

  async function handleProviderChange(nextProvider: AIProvider) {
    const nextSettings: AppSettings = {
      ...settings,
      selectedProvider: nextProvider,
      selectedModelByProvider: {
        ...settings.selectedModelByProvider,
      },
    }
    setSettings(nextSettings)
    await saveSettings({ selectedProvider: nextProvider })
  }

  async function handleModelChange(
    nextProvider: AIProvider,
    nextModel: string
  ) {
    const nextSettings: AppSettings = {
      ...settings,
      selectedModelByProvider: {
        ...settings.selectedModelByProvider,
        [nextProvider]: nextModel,
      },
    }
    setSettings(nextSettings)
    await saveSettings({
      selectedModelByProvider: {
        ...settings.selectedModelByProvider,
        [nextProvider]: nextModel,
      },
    })
  }

  async function handleSaveApiKey(nextProvider: AIProvider, key: string) {
    await saveApiKey(nextProvider, key)
    const keys = await getApiKeys()
    setApiKeys(keys)
  }

  async function handleRemoveApiKey(nextProvider: AIProvider) {
    await removeApiKey(nextProvider)
    const keys = await getApiKeys()
    setApiKeys(keys)
  }

  async function resetConversation() {
    stopStreaming()
    stopSpeaking()
    setMessages([])

    if (pageData.url) {
      await clearChatHistory(pageData.url)
    }
  }

  function handleScroll() {
    if (!viewportRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = viewportRef.current
    // Allow a small threshold (e.g., 50px) to consider it "at the bottom"
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
    shouldAutoScrollRef.current = isAtBottom
  }

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  function stop() {
    stopStreaming()
    toast("Response stopped")
  }

  function stopSpeaking() {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return
    }

    ttsStopRequestedRef.current = true
    window.speechSynthesis.cancel()
    utteranceRef.current = null
    setSpeakingMessageKey(null)
  }

  async function copyMessageText(text: string): Promise<boolean> {
    const trimmed = text.trim()
    if (!trimmed) return false

    try {
      await navigator.clipboard.writeText(trimmed)
      return true
    } catch {
      return false
    }
  }

  async function speakMessage(messageKey: string, text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return
    }

    const cleanText = text.trim()
    if (!cleanText) return

    if (speakingMessageKey === messageKey) {
      stopSpeaking()
      return
    }

    ttsStopRequestedRef.current = true
    window.speechSynthesis.cancel()
    ttsStopRequestedRef.current = false

    const utterance = new SpeechSynthesisUtterance(cleanText)
    const voices = window.speechSynthesis.getVoices()
    if (settings.tts.voiceURI) {
      const selected = voices.find(
        (voice) => voice.voiceURI === settings.tts.voiceURI
      )
      if (selected) {
        utterance.voice = selected
      }
    }

    utterance.onend = () => {
      ttsStopRequestedRef.current = false
      utteranceRef.current = null
      setSpeakingMessageKey(null)
    }
    utterance.onerror = () => {
      if (ttsStopRequestedRef.current) {
        ttsStopRequestedRef.current = false
        utteranceRef.current = null
        setSpeakingMessageKey(null)
        return
      }

      utteranceRef.current = null
      setSpeakingMessageKey(null)
    }

    utteranceRef.current = utterance
    setSpeakingMessageKey(messageKey)
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [])

  async function handleSend() {
    if (
      !input.trim() ||
      !activeApiKey ||
      !pageData.url ||
      messageLimitReached ||
      loading
    ) {
      return
    }

    sendMessage({ text: input })
    setInput("")
  }

  return (
    <div className="flex h-[600px] w-[400px] flex-col overflow-hidden rounded-xl border border-border/40 bg-background shadow-2xl">
      {/* Premium Header */}
      <header className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b bg-background/85 px-4 backdrop-blur-md">
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -10 }}
        >
          <div className="relative flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bot className="size-4" />
            <div className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-background bg-green-500" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm leading-none font-semibold tracking-tight">
              Easy WebsiteGPT
            </h1>
            <p className="mt-0.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              {provider} • {selectedModel.split("/").pop()}
            </p>
          </div>
        </motion.div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              className="size-8 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              onClick={() => {
                void resetConversation()
              }}
              size="icon"
              variant="ghost"
              title="Reset conversation"
            >
              <RotateCcw className="size-4" />
            </Button>
          )}

          <SettingsDialog
            apiKeys={apiKeys}
            onModelChange={handleModelChange}
            onProviderChange={handleProviderChange}
            onRemoveApiKey={handleRemoveApiKey}
            onSaveApiKey={handleSaveApiKey}
            settings={settings}
            trigger={
              <Button
                className="size-8 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                size="icon"
                variant="ghost"
                title="Settings"
              >
                <Settings className="size-4" />
              </Button>
            }
          />
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex min-h-0 flex-1 flex-col bg-muted/10">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-full flex-col items-center justify-center p-6 text-center"
              exit={{ opacity: 0, scale: 0.96 }}
              initial={{ opacity: 0, scale: 0.96 }}
              key="empty"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                <Bot className="size-6" />
              </div>
              <h2 className="mb-1.5 text-lg font-semibold tracking-tight text-foreground">
                How can I help?
              </h2>
              <p className="max-w-[250px] text-sm leading-relaxed text-muted-foreground/80">
                {activeApiKey
                  ? "I'm ready to answer questions about the content of this webpage."
                  : "Please add your API key in settings to start chatting."}
              </p>
            </motion.div>
          ) : (
            <ScrollArea
              className="h-full"
              key="messages"
              onScroll={handleScroll}
              viewportRef={viewportRef}
            >
              <div className="flex flex-col gap-4 p-4">
                {messages.map((message, index) => {
                  const textContent =
                    message.parts
                      ?.filter((part) => part.type === "text")
                      .map((part) => part.text)
                      .join("") ?? ""
                  const reasoningContent =
                    message.parts
                      ?.filter((part) => part.type === "reasoning")
                      .map((part) => part.text)
                      .join("") ?? ""
                  const isLastAssistantMessage =
                    index === messages.length - 1 &&
                    message.role === "assistant"
                  const showStreamingPlaceholder =
                    isStreaming && isLastAssistantMessage && !textContent
                  const messageKey = `${message.role}-${index}`

                  return (
                    <ChatMessage
                      content={textContent}
                      isStreaming={showStreamingPlaceholder}
                      isSpeaking={speakingMessageKey === messageKey}
                      onCopy={() => copyMessageText(textContent)}
                      onSpeak={
                        settings.tts.enabled
                          ? () => {
                              void speakMessage(messageKey, textContent)
                            }
                          : undefined
                      }
                      onStopSpeak={
                        settings.tts.enabled ? stopSpeaking : undefined
                      }
                      reasoning={reasoningContent}
                      key={messageKey}
                      role={message.role as any}
                    />
                  )
                })}
                <div ref={messagesEndRef} className="h-2" />
              </div>
            </ScrollArea>
          )}
        </AnimatePresence>
      </main>

      {/* Input Area */}
      <div className="shrink-0 border-t bg-background p-3">
        {messages.length > 0 && (
          <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span>
                {messages.length}/{MAX_MESSAGES} messages
              </span>
              {messageLimitReached && (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500">
                  <AlertTriangle className="size-3" />
                  Limit reached
                </span>
              )}
            </div>
            {isStreaming && (
              <button
                className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                onClick={stop}
              >
                <StopCircle className="size-3" />
                Stop
              </button>
            )}
          </div>
        )}

        <div className="relative flex items-center">
          <Input
            className="h-11 flex-1 rounded-full border-muted-foreground/20 bg-muted/50 pr-12 pl-4 text-[13px] shadow-sm transition-colors focus-visible:border-primary focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/30"
            disabled={loading || !activeApiKey || messageLimitReached}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                void handleSend()
              }
            }}
            placeholder={
              messageLimitReached
                ? "Message limit reached"
                : activeApiKey
                  ? "Ask anything..."
                  : "Setup API key first"
            }
            ref={inputRef}
            value={input}
          />

          <Button
            className="absolute right-1 size-9 rounded-full shadow-sm transition-all"
            disabled={
              loading || !activeApiKey || !input.trim() || messageLimitReached
            }
            onClick={() => {
              void handleSend()
            }}
            size="icon"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
