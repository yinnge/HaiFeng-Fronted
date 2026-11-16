/**
 * 培训机构（首页管理）
 *
 * <p>字段契约与后端 haifeng-admin 的 InstitutionListVO / InstitutionDetailVO / InstitutionAddDTO 对齐。
 */

/** 主打班型条目（对应后端 InstitutionClassType） */
export interface InstitutionClassType {
  /** 班型标题，如「高三冲刺班」 */
  title: string
  /** 班型介绍 */
  introduction?: string
  /** 班型标签，如「热门」 */
  tag?: string
}

/** 分类下拉选项（value 与 label 同为中文） */
export interface InstitutionOptionVO {
  value: string
  label: string
}

/** 上下架状态：1=上架，0=下架 */
export type InstitutionStatus = 0 | 1

export interface InstitutionListVO {
  id: string
  /** 机构分类：高中冲刺小班 / 考公考编机构 / 央国企培训 / 职业培训机构 */
  category: string
  name: string
  /** 省份（中文裸值） */
  province: string
  /** 创办时间，如「2013年」 */
  foundedYear: string | null
  address: string | null
  phone: string | null
  email: string | null
  /** 绑定的管理账号 ID */
  userId: string
  /** 管理账号用户名（派生字段） */
  managerUsername: string | null
  /** 管理账号手机号（派生字段） */
  managerPhone: string | null
  /** 上下架状态 */
  status: InstitutionStatus
  sortOrder: number
  createdAt: string
}

export interface InstitutionDetailVO {
  id: string
  category: string
  name: string
  province: string
  foundedYear: string | null
  /** 轮播图片 URL 列表 */
  carouselImages: string[] | null
  /** 机构标签 */
  tags: string[] | null
  /** 机构简介 */
  introduction: string | null
  /** 主打方向 */
  mainDirection: string | null
  /** 班级规模 */
  classSize: string | null
  /** 师资配置 */
  teacherConfig: string | null
  /** 上课形式 */
  courseForm: string | null
  /** 主打班型 */
  classTypes: InstitutionClassType[] | null
  /** 说明 / 温馨提示 */
  notice: string | null
  /** 机构优势 */
  advantages: string[] | null
  address: string | null
  /** 微信二维码 URL */
  wechatQrcodeUrl: string | null
  email: string | null
  phone: string | null
  userId: string
  managerUsername: string | null
  managerPhone: string | null
  status: InstitutionStatus
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface InstitutionQueryDTO {
  /** 名称模糊查询 */
  name?: string
  /** 机构分类（精确匹配） */
  category?: string
  /** 省份（精确匹配） */
  province?: string
  /** 上下架筛选 */
  status?: InstitutionStatus
  page: number
  size: number
}

export interface InstitutionAddDTO {
  /** 机构分类（必填），只能是 4 个枚举值之一 */
  category: string
  /** 绑定的管理账号 ID（必填），一个账号只能管一个机构 */
  userId: string
  /** 机构名称（必填） */
  name: string
  /** 省份（必填） */
  province: string
  foundedYear?: string
  /** 轮播图，最多 10 张 */
  carouselImages?: string[]
  /** 标签，最多 10 个 */
  tags?: string[]
  /** 机构简介 */
  introduction?: string
  mainDirection?: string
  classSize?: string
  teacherConfig?: string
  courseForm?: string
  /** 主打班型，最多 10 个 */
  classTypes?: InstitutionClassType[]
  notice?: string
  /** 机构优势，最多 10 条 */
  advantages?: string[]
  address?: string
  wechatQrcodeUrl?: string
  email?: string
  phone?: string
  sortOrder?: number
}

export interface InstitutionUpdateDTO extends InstitutionAddDTO {}
