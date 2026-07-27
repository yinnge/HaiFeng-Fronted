import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({
  breaks: true,
  gfm: true,
})

/**
 * Render Markdown string to sanitized HTML.
 * Returns empty string for null/undefined input.
 */
export function renderMarkdown(md: string | null | undefined): string {
  if (!md) return ''
  try {
    const raw = marked.parse(md) as string
    return DOMPurify.sanitize(raw)
  } catch {
    return ''
  }
}
