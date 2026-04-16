import { useEffect, useMemo, useState, type ReactNode } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { PROVIDERS } from "@/lib/models"
import type { AIProvider, AppSettings } from "@/lib/types"
import { getApiKeyValidationMessage, isValidApiKey } from "@/lib/validate"
import { AlertCircle, ExternalLink, Key, Trash2 } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

interface SettingsDialogProps {
  settings: AppSettings
  apiKeys: Partial<Record<AIProvider, string>>
  onProviderChange: (provider: AIProvider) => Promise<void>
  onModelChange: (provider: AIProvider, model: string) => Promise<void>
  onSaveApiKey: (provider: AIProvider, apiKey: string) => Promise<void>
  onRemoveApiKey: (provider: AIProvider) => Promise<void>
  trigger: ReactNode
}

export function SettingsDialog({
  settings,
  apiKeys,
  onProviderChange,
  onModelChange,
  onSaveApiKey,
  onRemoveApiKey,
  trigger,
}: SettingsDialogProps) {
  const [inputValue, setInputValue] = useState("")
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const provider = settings.selectedProvider
  const providerConfig = PROVIDERS[provider]
  const savedKey = apiKeys[provider] ?? ""
  const selectedModel = settings.selectedModelByProvider[provider]

  useEffect(() => {
    setInputValue(savedKey)
    setShowError(false)
    setErrorMessage("")
  }, [savedKey, provider])

  const groupedModels = useMemo(() => {
    const latest = providerConfig.models.filter(
      (model) => model.tier === "latest"
    )
    const balanced = providerConfig.models.filter(
      (model) => model.tier === "balanced"
    )
    const cheap = providerConfig.models.filter(
      (model) => model.tier === "cheap"
    )
    return { latest, balanced, cheap }
  }, [providerConfig.models])

  async function handleSaveKey() {
    const trimmed = inputValue.trim()
    if (!trimmed) {
      setShowError(true)
      setErrorMessage("API key cannot be empty.")
      return
    }

    if (!isValidApiKey(provider, trimmed)) {
      setShowError(true)
      setErrorMessage(getApiKeyValidationMessage(provider))
      return
    }

    setIsSaving(true)
    try {
      await onSaveApiKey(provider, trimmed)
      setShowError(false)
      setErrorMessage("")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleRemoveKey() {
    setIsSaving(true)
    try {
      await onRemoveApiKey(provider)
      setInputValue("")
      setShowError(false)
      setErrorMessage("")
    } finally {
      setIsSaving(false)
    }
  }

  function openOptionsPage() {
    if (typeof chrome !== "undefined" && chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage()
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[425px]">
        <div className="p-5 pb-4">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Key className="size-4 text-primary" />
              AI Settings
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure your AI provider and API key for this extension.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="provider" className="text-xs">
                Provider
              </Label>
              <Select
                onValueChange={(value) => {
                  void onProviderChange(value as AIProvider)
                }}
                value={provider}
              >
                <SelectTrigger id="provider" className="h-8 text-xs">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai" className="text-xs">
                    OpenAI
                  </SelectItem>
                  <SelectItem value="anthropic" className="text-xs">
                    Anthropic
                  </SelectItem>
                  <SelectItem value="google" className="text-xs">
                    Google AI
                  </SelectItem>
                  <SelectItem value="groq" className="text-xs">
                    Groq
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="model" className="text-xs">
                Model
              </Label>
              <Select
                onValueChange={(value) => {
                  void onModelChange(provider, value)
                }}
                value={selectedModel}
              >
                <SelectTrigger id="model" className="h-8 text-xs">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {groupedModels.latest.map((model) => (
                    <SelectItem
                      key={model.value}
                      value={model.value}
                      className="text-xs"
                    >
                      {model.label}
                    </SelectItem>
                  ))}
                  {groupedModels.balanced.length > 0 && (
                    <Separator className="my-1" />
                  )}
                  {groupedModels.balanced.map((model) => (
                    <SelectItem
                      key={model.value}
                      value={model.value}
                      className="text-xs"
                    >
                      {model.label}
                    </SelectItem>
                  ))}
                  {groupedModels.cheap.length > 0 && (
                    <Separator className="my-1" />
                  )}
                  {groupedModels.cheap.map((model) => (
                    <SelectItem
                      key={model.value}
                      value={model.value}
                      className="text-xs"
                    >
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="apiKey" className="text-xs">
                {providerConfig.apiKeyLabel}
              </Label>
              <a
                className="flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
                href={providerConfig.docsUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Get API Key
                <ExternalLink className="size-3" />
              </a>
            </div>

            <div className="flex gap-1.5">
              <Input
                autoCapitalize="off"
                autoCorrect="off"
                id="apiKey"
                className="h-8 font-mono text-xs"
                onChange={(event) => {
                  setInputValue(event.target.value)
                  if (showError) {
                    setShowError(false)
                    setErrorMessage("")
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void handleSaveKey()
                  }
                }}
                placeholder="Paste API key here..."
                spellCheck={false}
                type="password"
                value={inputValue}
              />
              <Button
                className="h-8 px-3 text-xs"
                disabled={
                  isSaving ||
                  !inputValue.trim() ||
                  inputValue.trim() === savedKey
                }
                onClick={() => {
                  void handleSaveKey()
                }}
              >
                Save
              </Button>
              {savedKey && (
                <Button
                  className="h-8 w-8 p-0"
                  disabled={isSaving}
                  onClick={() => {
                    void handleRemoveKey()
                  }}
                  variant="ghost"
                >
                  <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              )}
            </div>

            <AnimatePresence>
              {showError && (
                <motion.div
                  animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <Alert
                    variant="destructive"
                    className="h-auto min-h-0 px-3 py-2"
                  >
                    <AlertCircle className="size-3.5" />
                    <AlertDescription className="ml-2 text-xs">
                      {errorMessage}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t bg-muted/40 p-4">
          <Button
            className="h-7 px-2.5 text-[11px]"
            onClick={openOptionsPage}
            size="sm"
            variant="secondary"
          >
            <ExternalLink className="mr-1.5 size-3" />
            Advanced Options
          </Button>

          <p className="text-[10px] text-muted-foreground/60">
            Keys are stored locally.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
