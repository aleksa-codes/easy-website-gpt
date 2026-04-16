import { scrapePage } from "@/lib/scrape"
import type { PageData } from "@/lib/types"

const MIN_CONTENT_LENGTH = 800
const MIN_LENGTH_RATIO = 0.65
const MAX_CONTENT_CHARS = 120_000

const EMPTY_PAGE: PageData = {
  title: "",
  content: "",
  url: "",
  metadata: {},
}

export async function getPageContent(): Promise<PageData> {
  if (typeof chrome === "undefined" || !chrome.tabs || !chrome.scripting) {
    return {
      title: "Development environment",
      content: "Development environment - page content not available",
      url: "localhost",
      metadata: {},
    }
  }

  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id
      if (!tabId) {
        resolve(EMPTY_PAGE)
        return
      }

      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: () => {
            const description =
              document
                .querySelector('meta[name="description"]')
                ?.getAttribute("content") ?? undefined

            const keywords =
              document
                .querySelector('meta[name="keywords"]')
                ?.getAttribute("content") ?? undefined

            const mainContent =
              document.querySelector("main") ??
              document.querySelector("article")

            const fallbackText = cleanString(
              mainContent
                ? (mainContent as HTMLElement).innerText
                : Array.from(document.body.children)
                    .filter((element) => {
                      const tag = element.tagName.toLowerCase()
                      return ![
                        "header",
                        "nav",
                        "footer",
                        "script",
                        "style",
                        "noscript",
                      ].includes(tag)
                    })
                    .map((element) => (element as HTMLElement).innerText)
                    .join("\n")
            )

            function cleanString(str: string) {
              return str
                .replace(/[\s\t\u200B-\u200D\uFEFF]+/g, " ")
                .replace(/^\s+/gm, "")
                .replace(/\n+/g, "\n")
                .trim()
            }

            return {
              title: document.title,
              html: document.documentElement.outerHTML,
              fallbackText,
              url: window.location.href,
              metadata: {
                description,
                keywords,
              },
            }
          },
        },
        (results) => {
          const payload =
            (results?.[0]?.result as {
              title?: string
              html?: string
              fallbackText?: string
              url?: string
              metadata?: { description?: string; keywords?: string }
            }) ?? null

          if (!payload?.url) {
            resolve(EMPTY_PAGE)
            return
          }

          const scraped = payload.html
            ? scrapePage({ html: payload.html, markdown: true })
            : null

          const scrapedContent = scraped?.content?.trim() ?? ""
          const fallbackContent = payload.fallbackText?.trim() ?? ""

          const useFallbackOnly =
            !scrapedContent ||
            (fallbackContent.length >= MIN_CONTENT_LENGTH &&
              scrapedContent.length < fallbackContent.length * MIN_LENGTH_RATIO)

          const useHybrid = !useFallbackOnly && fallbackContent.length > 0

          const mergedContent = useHybrid
            ? [
                "# Main article content\n",
                scrapedContent,
                "\n\n# Full page text content\n",
                fallbackContent,
              ]
                .filter(Boolean)
                .join("\n")
            : ""

          const chosenContent = useFallbackOnly
            ? fallbackContent || scrapedContent
            : useHybrid
              ? mergedContent
              : scrapedContent || fallbackContent

          const content = (chosenContent || "Content unavailable").slice(
            0,
            MAX_CONTENT_CHARS
          )

          const extractionMethod: PageData["metadata"]["extractionMethod"] =
            useFallbackOnly || !scraped
              ? "fallback"
              : useHybrid
                ? "hybrid"
                : "readability"

          const contentFormat: PageData["metadata"]["contentFormat"] =
            extractionMethod === "readability" ? "markdown" : "text"

          resolve({
            title: scraped?.title || payload.title || "Untitled page",
            content,
            url: payload.url,
            metadata: {
              ...(payload.metadata ?? {}),
              extractionMethod,
              contentFormat,
            },
          })
        }
      )
    })
  })
}
