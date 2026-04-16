import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createGroq } from "@ai-sdk/groq"
import { createOpenAI } from "@ai-sdk/openai"
import type { UIMessage } from "ai"
import {
  convertToModelMessages,
  extractReasoningMiddleware,
  smoothStream,
  streamText,
  wrapLanguageModel,
} from "ai"

import type { AIProvider, PageData } from "@/lib/types"

function createSystemMessage(pageData: PageData): string {
  const cleanContent = pageData.content.trim()

  return `You are Easy WebsiteGPT. The user is chatting with the current webpage.

Your job:
- Answer ONLY using the webpage content provided below.
- Treat this as a website Q&A assistant, not a general assistant.
- If the answer is not clearly in the content, say: "I can't find that on this page."
- Do not use outside knowledge or make assumptions.
- Be concise and direct.

Webpage content:
${cleanContent}`
}

function getModel(provider: AIProvider, modelId: string, apiKey: string) {
  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey })(modelId)
    case "anthropic":
      return createAnthropic({ apiKey })(modelId)
    case "google":
      return createGoogleGenerativeAI({ apiKey })(modelId)
    case "groq":
      return createGroq({ apiKey })(modelId)
    default:
      throw new Error("Unsupported AI provider.")
  }
}

export async function generateChatResponse(
  provider: AIProvider,
  model: string,
  apiKey: string,
  messages: UIMessage[],
  pageData: PageData,
  signal?: AbortSignal
): Promise<Response> {
  const baseModel = getModel(provider, model, apiKey)
  const aiModel =
    provider === "groq"
      ? wrapLanguageModel({
          model: baseModel,
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        })
      : baseModel

  const result = streamText({
    model: aiModel,
    abortSignal: signal,
    maxOutputTokens: 1200,
    experimental_transform: smoothStream(),
    messages: [
      {
        role: "system",
        content: createSystemMessage(pageData),
      },
      ...(await convertToModelMessages(messages)),
    ],
  })

  return result.toUIMessageStreamResponse({ sendReasoning: true })
}
