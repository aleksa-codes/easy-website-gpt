import type { HTMLProps } from "react"
import { useState } from "react"

import MemoizedReactMarkdown from "@/components/markdown"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Bot,
  BrainCircuit,
  ChevronDown,
  Copy,
  Square,
  User,
  Volume2,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"

interface ChatMessageProps {
  role: "user" | "assistant" | "system" | "data"
  content: string
  reasoning?: string
  isStreaming?: boolean
  isSpeaking?: boolean
  onCopy?: () => Promise<boolean>
  onSpeak?: () => void
  onStopSpeak?: () => void
}

const Link = ({
  className,
  children,
  ...props
}: HTMLProps<HTMLAnchorElement>) => (
  <a
    className={cn(
      "text-primary underline underline-offset-3 hover:text-primary/85",
      className
    )}
    rel="noopener noreferrer"
    target="_blank"
    {...props}
  >
    {children}
  </a>
)

const Paragraph = ({
  className,
  children,
  ...props
}: HTMLProps<HTMLParagraphElement>) => (
  <p className={cn("mb-2 last:mb-0", className)} {...props}>
    {children}
  </p>
)

const CodeBlock = ({
  inline,
  className,
  children,
  ...props
}: HTMLProps<HTMLElement> & { inline?: boolean }) => {
  if (inline) {
    return (
      <code
        className={cn(
          "rounded-sm bg-zinc-700 px-1.5 py-0.5 font-mono text-sm text-zinc-200",
          className
        )}
        {...props}
      >
        {children}
      </code>
    )
  }

  return (
    <pre className="my-2 overflow-x-auto rounded-lg bg-zinc-800 p-4">
      <code className="block font-mono text-sm text-zinc-200" {...props}>
        {String(children).replace(/\n$/, "")}
      </code>
    </pre>
  )
}

const LoadingDots = () => (
  <div className="flex items-center gap-1.5">
    <motion.span
      animate={{
        opacity: [0.35, 1, 0.35],
        y: [0, -3, 0],
        scale: [0.92, 1, 0.92],
      }}
      className="size-2 rounded-full bg-primary/60 shadow-[0_0_8px_hsl(var(--primary)/0.35)]"
      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.span
      animate={{
        opacity: [0.35, 1, 0.35],
        y: [0, -3, 0],
        scale: [0.92, 1, 0.92],
      }}
      className="size-2 rounded-full bg-primary/60 shadow-[0_0_8px_hsl(var(--primary)/0.35)]"
      transition={{
        duration: 1.1,
        delay: 0.14,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    <motion.span
      animate={{
        opacity: [0.35, 1, 0.35],
        y: [0, -3, 0],
        scale: [0.92, 1, 0.92],
      }}
      className="size-2 rounded-full bg-primary/60 shadow-[0_0_8px_hsl(var(--primary)/0.35)]"
      transition={{
        duration: 1.1,
        delay: 0.28,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </div>
)

export function ChatMessage({
  role,
  content,
  reasoning,
  isStreaming = false,
  isSpeaking = false,
  onCopy,
  onSpeak,
  onStopSpeak,
}: ChatMessageProps) {
  const [isReasoningOpen, setIsReasoningOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const isAssistant = role === "assistant"
  const isEmpty = !content.trim() && !reasoning?.trim()

  async function handleCopy() {
    if (!onCopy) return

    const success = await onCopy()
    if (!success) return

    setCopied(true)
    window.setTimeout(() => {
      setCopied(false)
    }, 1400)
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-start gap-2", { "justify-end": !isAssistant })}
      initial={{ opacity: 0, y: 10 }}
    >
      {isAssistant && (
        <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
          <Bot className="size-5 text-primary" />
        </div>
      )}

      <Card
        className={cn(
          "max-w-[82%] rounded-2xl px-4 py-3 text-sm break-words shadow-xs",
          isAssistant ? "bg-muted/60" : "bg-primary text-primary-foreground",
          isAssistant && isEmpty && "flex min-h-12 items-center justify-center"
        )}
      >
        {isAssistant ? (
          isEmpty ? (
            <LoadingDots />
          ) : (
            <div className="flex flex-col">
              {reasoning && (
                <div className="mb-2 flex flex-col">
                  <button
                    onClick={() => setIsReasoningOpen(!isReasoningOpen)}
                    className="flex w-fit items-center gap-1.5 rounded-full bg-background/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
                  >
                    <BrainCircuit className="size-3.5" />
                    <span>Thought process</span>
                    <ChevronDown
                      className={cn(
                        "size-3 transition-transform",
                        isReasoningOpen && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {isReasoningOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="my-3 border-l-2 border-primary/30 py-1 pl-4">
                          <div className="prose prose-sm dark:prose-invert prose-code:before:hidden prose-code:after:hidden max-w-none text-muted-foreground/90 italic">
                            <MemoizedReactMarkdown
                              components={{
                                a: Link,
                                p: Paragraph,
                                code: CodeBlock,
                              }}
                              rehypePlugins={[rehypeRaw, rehypeSanitize]}
                            >
                              {reasoning}
                            </MemoizedReactMarkdown>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {content && (
                <div className="prose prose-sm dark:prose-invert prose-code:before:hidden prose-code:after:hidden max-w-none">
                  <MemoizedReactMarkdown
                    components={{
                      a: Link,
                      p: Paragraph,
                      code: CodeBlock,
                    }}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  >
                    {content}
                  </MemoizedReactMarkdown>
                </div>
              )}
              {content && (onCopy || onSpeak) && (
                <div className="mt-3 flex items-center gap-1.5">
                  {onCopy && (
                    <button
                      className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                      onClick={() => {
                        void handleCopy()
                      }}
                      title="Copy response"
                      type="button"
                    >
                      <Copy className="size-3.5" />
                      {copied ? "Copied" : "Copy"}
                    </button>
                  )}
                  {onSpeak && !isSpeaking && (
                    <button
                      className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                      onClick={onSpeak}
                      title="Read aloud"
                      type="button"
                    >
                      <Volume2 className="size-3.5" />
                      Listen
                    </button>
                  )}
                  {isSpeaking && onStopSpeak && (
                    <button
                      className="inline-flex h-7 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/15"
                      onClick={onStopSpeak}
                      title="Stop reading"
                      type="button"
                    >
                      <Square className="size-3.5 fill-current" />
                      Stop
                    </button>
                  )}
                </div>
              )}
              {!content && isStreaming && (
                <div className="mt-1 flex min-h-10 items-center rounded-xl border border-primary/15 bg-background/40 px-3">
                  <LoadingDots />
                </div>
              )}
            </div>
          )
        ) : (
          <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
        )}
      </Card>

      {!isAssistant && (
        <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80">
          <User className="size-5 text-primary-foreground" />
        </div>
      )}
    </motion.div>
  )
}
