import { Readability } from "@mozilla/readability"
import { parseHTML } from "linkedom"
import TurndownService from "turndown"

type ScrapeInput = {
  html: string
  markdown?: boolean
}

type ScrapedPage = {
  title: string
  content: string
  textContent: string
  excerpt: string
  length: number
  byline: string | null
  siteName: string | null
}

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
})

export function scrapePage({
  html,
  markdown = true,
}: ScrapeInput): ScrapedPage | null {
  const article = extract(html)
  if (!article) {
    return null
  }

  const cleanedHtml = cleanString(article.content || "")
  const cleanedText = cleanString(article.textContent || "")
  const content = markdown ? convertToMarkdown(cleanedHtml) : cleanedHtml
  const textContent = markdown ? cleanString(content) : cleanedText

  return {
    title: cleanString(article.title || ""),
    content,
    textContent,
    excerpt: cleanString(article.excerpt || ""),
    length: article.length || textContent.length,
    byline: article.byline ?? null,
    siteName: article.siteName ?? null,
  }
}

function extract(html: string) {
  const doc = parseHTML(html)
  const reader = new Readability(doc.window.document)
  return reader.parse()
}

function convertToMarkdown(html: string) {
  const doc = parseHTML(html)
  return turndown.turndown(doc.window.document)
}

function cleanString(str: string) {
  return str
    .replace(/[\s\t\u200B-\u200D\uFEFF]+/g, " ")
    .replace(/^\s+/gm, "")
    .replace(/\n+/g, "\n")
    .trim()
}
