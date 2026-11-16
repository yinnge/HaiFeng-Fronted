export interface ContactUrl {
  wechat: string
  weibo: string
  zhihu: string
  douyin: string
  bilibili: string
}

export interface BasicMessage {
  address: string
  phone: string
  email: string
  consultationTime: string
}

export interface SiteInfoVO {
  siteIcp: string
  siteDescription: string
  contactUrl: ContactUrl
  basicMessage: BasicMessage
  vipPrice?: number
}

export interface HomePageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
  pages: number
}

export interface AnnouncementListVO {
  id: string
  title: string
  tag: string
  updatedAt: string
}

export interface AnnouncementDetailVO {
  id: string
  title: string
  content: string
  tag: string
}

export interface HomeArticleNewsVO {
  id: number | string
  /** 所属模块（高考/中考/考公/考研/英语四六级），作彩色标签 */
  moduleName: string
  title: string
  columnName: string
  /** 年份；NULL=不分年份 */
  year: number | null
  /** 发布时间（ISO），前端格式化为 月-日 */
  publishTime: string
}

export interface HomeArticleDetailVO {
  province: string | null
  /** 所属模块（高考/中考/考公/考研/英语四六级），作彩色标签 */
  moduleName: string
  year: number | null
  columnName: string
  title: string
  summary: string
  /** 富文本 HTML 正文 */
  content: string
  viewCount: number
  publishTime: string
}

/** 服务内容条目（services JSONB 内部 title/content） */
export interface PlannerServiceItem {
  title: string
  content: string
}

/** 规划师列表项：基础信息 + 列表页展示 */
export interface PlannerListVO {
  id: string
  name: string
  /** 服务对象：高考 / 考研 */
  serviceTarget: string
  /** 职位（首席/高级/学硕…），作徽章 */
  position: string
  /** 省份（ProvinceEnum 中文 desc 裸值） */
  province: string
  /** 列表描述 */
  listDesc: string
  /** 列表 tag */
  listTags: string[]
  /** svg 头像（本地静态资源相对路径，可空） */
  avatarUrl: string
}

/** 规划师详情：基础信息 + 列表页展示 + 详情页展示（不含预约联系方式） */
export interface PlannerDetailVO {
  id: string
  name: string
  serviceTarget: string
  position: string
  province: string
  avatarUrl: string
  listDesc: string
  listTags: string[]
  /** 从业年限，如 11年 */
  workYears: string
  /** 服务考生，如 3200+ */
  servedCount: string
  /** 初稿时效，如 48h */
  draftSla: string
  /** 认证描述，如 持证生涯规划师 */
  certDesc: string
  /** 详情大段介绍 */
  description: string
  detailTags: string[]
  services: PlannerServiceItem[]
}

/** 规划师预约信息：头像 + 姓名 + 联系方式（直连 DB，不缓存） */
export interface PlannerAppointmentVO {
  id: string
  avatarUrl: string
  name: string
  email: string
  phone: string
  address: string
  wechatQrcodeUrl: string
}

/** 机构主打班型（class_types JSONB 内部） */
export interface InstitutionClassType {
  title: string
  introduction: string
  tag: string
}

/** 机构列表项 */
export interface InstitutionListVO {
  id: string
  name: string
  /** 分类：高中冲刺小班/考公考编机构/央国企培训/职业培训机构 */
  category: string
  province: string
  tags: string[]
  /** 轮播图首图 URL（后端取 carousel_images[0]，可能为空） */
  coverImage?: string
}

/** 机构详情（不含联系方式） */
export interface InstitutionDetailVO {
  id: string
  category: string
  name: string
  province: string
  /** 创办时间，如 2013年 */
  foundedYear: string
  /** 轮播图片 */
  carouselImages: string[]
  tags: string[]
  introduction: string
  /** 主打方向 */
  mainDirection: string
  /** 班级规模 */
  classSize: string
  /** 师资配置 */
  teacherConfig: string
  /** 上课形式 */
  courseForm: string
  classTypes: InstitutionClassType[]
  /** 说明/温馨提示 */
  notice: string
  /** 机构优势 */
  advantages: string[]
}

/** 机构预约信息：机构名 + 联系方式 */
export interface InstitutionAppointmentVO {
  id: string
  name: string
  address: string
  wechatQrcodeUrl: string
  email: string
  phone: string
}

/** 提交咨询留言 */
export interface ConsultationAddDTO {
  message: string
  wechat?: string
  phone: string
}

/** 名师指导 - 6 张入口卡片配置（文案照抄原型，数字由接口动态替换） */
export interface MentorCardConfig {
  key: string
  kind: 'person' | 'org'
  accent: 'blue' | 'indigo' | 'orange' | 'green' | 'red' | 'cyan'
  eyebrow: string
  title: string
  desc: string
  /** 数量单位，如「位规划师」「家机构」 */
  countUnit: string
  /** 副标签模板，{n} 由接口省份数替换 */
  tagTemplate: string
  /** 名单弹窗简介 */
  sub: string
  /** 名单弹窗底部说明 */
  foot: string
  /** 完整 svg 图标字符串 */
  iconSvg: string
  /** 规划师：高考 / 考研 */
  serviceTarget?: string
  /** 机构：4 个分类之一 */
  category?: string
}
