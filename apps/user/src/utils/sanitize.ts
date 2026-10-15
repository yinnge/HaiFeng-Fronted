/**
 * 富文本 HTML 清洗（展示前双保险：后端已清洗 + 前端 DOMPurify 再过一层）
 */
import DOMPurify from 'dompurify'

// 所有链接强制新窗口打开 + noopener，防 reverse tabnabbing
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  const el = node as Element
  if (el.tagName === 'A') {
    el.setAttribute('target', '_blank')
    el.setAttribute('rel', 'noopener noreferrer')
  }
})

/**
 * 清洗富文本 HTML，并把 <table> 包上 .table-wrap 以支持横向滚动
 * （展示端统一由 .article-content 控制样式，见 assets/styles/article-content.css）
 */
export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html) return ''
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
  return clean
    .replace(/<table(\s|>)/g, '<div class="table-wrap"><table$1')
    .replace(/<\/table>/g, '</table></div>')
}
