/**
 * 资讯模块名（moduleName）→ 彩色标签映射。
 * 共 5 个值（高考/中考/考公/考研/英语四六级），对齐全局四色+橙规范。
 */
export interface ArticleModuleMeta {
  text: string
  /** 文字色 */
  color: string
  /** 浅底背景色 */
  bg: string
}

const MODULE_MAP: Record<string, ArticleModuleMeta> = {
  高考: { text: '高考', color: '#F97316', bg: '#FFF7ED' },
  中考: { text: '中考', color: '#2563EB', bg: '#EFF6FF' },
  考公: { text: '考公', color: '#E11D48', bg: '#FFF1F2' },
  考研: { text: '考研', color: '#059669', bg: '#ECFDF5' },
  英语四六级: { text: '英语四六级', color: '#D97706', bg: '#FFFBEB' },
}

export function articleModuleMeta(name?: string | null): ArticleModuleMeta {
  const key = (name || '').trim()
  return MODULE_MAP[key] || { text: key || '资讯', color: '#64748B', bg: '#F1F5F9' }
}

/** 日期格式化为 月-日（MM-DD）；无时间时回退到年份或空 */
export function formatArticleDate(publishTime?: string | null, year?: number | null): string {
  if (publishTime) {
    const datePart = publishTime.slice(0, 10)
    if (datePart.length >= 10) return datePart.slice(5)
  }
  if (year) return String(year)
  return '--'
}
