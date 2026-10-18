/**
 * 热点资讯（高考/考公/考研/中考/英语四六级）相关类型
 * 对应后端: com.haifeng.admin.controller.fileload.BizArticleController
 * 接口前缀: /api/v1/admin/fileload/article
 * 模块挂「文件管理」一级模块下（moduleCode = fileload_article）
 */

/** 所属模块（与 DB CHECK 约束一致） */
export const ARTICLE_MODULE_OPTIONS = ['高考', '考公', '考研', '中考', '英语四六级'] as const
export type ArticleModule = (typeof ARTICLE_MODULE_OPTIONS)[number]

/** 省份裸值（无 省/市 后缀，如 山西；全国=全国）。与 DB province 字段格式对齐。 */
export const ARTICLE_PROVINCE_OPTIONS = [
  '全国',
  '北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏',
  '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西',
  '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆',
] as const

/** 状态：0已发布 1下架 */
export const ARTICLE_STATUS_OPTIONS = [
  { label: '已发布', value: 0 },
  { label: '下架', value: 1 },
] as const

/** 列表 VO（不含 content 正文） */
export interface BizArticleListVO {
  id: string
  /** 所属模块：高考/考公/考研/中考/英语四六级 */
  moduleName: string
  /** 省份裸值（如 山西；全国）；null=不限省份 */
  province: string | null
  /** 年份；null=不分年份 */
  year: number | null
  /** 专栏名 */
  columnName: string
  /** 标题 */
  title: string
  /** 列表页摘要 */
  summary: string | null
  /** 状态：0已发布 1下架 */
  status: number
  /** 排序权重（越大越靠前） */
  sortOrder: number
  /** 浏览量 */
  viewCount: number
  /** 发布时间 */
  publishTime: string | null
  createTime: string | null
  updateTime: string | null
}

/** 详情 VO（含富文本正文） */
export interface BizArticleDetailVO {
  id: string
  moduleName: string
  province: string | null
  year: number | null
  columnName: string
  title: string
  summary: string | null
  /** 富文本 HTML 正文 */
  content: string
  status: number
  sortOrder: number
  viewCount: number
  publishTime: string | null
  createTime: string | null
  updateTime: string | null
}

/** 分页查询 DTO（后端 BizArticleQueryDTO extends BasePageQueryDTO，size 下限 10） */
export interface BizArticleQueryDTO {
  /** 模块名精准 */
  moduleName?: string
  /** 省份精准（裸值） */
  province?: string
  /** 年份精准 */
  year?: number
  /** 专栏名精准 */
  columnName?: string
  /** 标题模糊 */
  title?: string
  page: number
  size: number
}

/** 新增 DTO */
export interface BizArticleAddDTO {
  /** 所属模块：高考/考公/考研/中考/英语四六级 */
  moduleName: string
  /** 省份裸值；空=不限省份 */
  province?: string
  /** 年份；空=不分年份 */
  year?: number
  /** 专栏名 */
  columnName: string
  /** 标题 */
  title: string
  /** 列表页摘要 */
  summary?: string
  /** 富文本 HTML 正文 */
  content: string
  /** 状态：0已发布 1下架，默认0 */
  status?: number
  /** 排序权重（越大越靠前） */
  sortOrder?: number
  /** 浏览量（允许 admin 自行设置初始浏览值；空则默认 0） */
  viewCount?: number
  /** 发布时间；空则由后端指定 */
  publishTime?: string
}

/** 修改 DTO（配合路径参数 id） */
export interface BizArticleUpdateDTO {
  moduleName: string
  province?: string
  year?: number
  columnName: string
  title: string
  summary?: string
  content: string
  status?: number
  sortOrder?: number
  /** 浏览量（允许 admin 手动修改；空表示不改动原值） */
  viewCount?: number
  publishTime?: string
}

/** 搜索组件的筛选参数（year 为原始输入字符串，提交前由父页面转换校验） */
export interface ArticleSearchParams {
  moduleName: string
  province: string
  year: string
  columnName: string
  title: string
}

/** 表单弹窗提交的统一载荷（add/update 共用） */
export interface ArticleFormPayload {
  moduleName: string
  province?: string
  year?: number
  columnName: string
  title: string
  summary?: string
  content: string
  status: number
  sortOrder?: number
  /** 浏览量（允许 admin 自行设置/修改） */
  viewCount?: number
  publishTime?: string
}
