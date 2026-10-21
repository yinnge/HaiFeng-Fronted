/**
 * 模糊搜索结果项（院校 / 城市 / 专业）
 */
export interface SearchItem {
  id: string
  name: string
}

/**
 * 资讯搜索高亮区间 [start, end)
 */
export interface ArticleHighlightSpan {
  start: number
  end: number
}

/**
 * 资讯搜索建议项（热点资讯标题搜索，带命中高亮区间）
 */
export interface BizArticleSearchItem {
  /** 资讯 id（跳详情用；后端 json-bigint 解析为 string） */
  id: string
  /** 专栏名（建议列表 pill） */
  columnName: string | null
  /** 省份裸值；null=不限省份文章 */
  province: string | null
  /** 标题（含高亮区间定位的原文） */
  title: string
  /** 命中高亮区间，按 start 升序 */
  highlight: ArticleHighlightSpan[]
}

