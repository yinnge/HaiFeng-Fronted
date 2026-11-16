/**
 * 规划师（首页管理）
 *
 * <p>字段契约与后端 haifeng-admin 的 PlannerListVO / PlannerDetailVO / PlannerAddDTO 对齐。
 * <p>注意：规划师无 status 列，上下架语义由软删除标记 is_deleted 承担，
 * 后端以派生字段 status 返回（1=在线 / 0=已下线）。
 */

/** 服务内容条目（对应后端 PlannerServiceItem） */
export interface PlannerServiceItem {
  /** 标题，如「首次诊断」 */
  title: string
  /** 内容描述 */
  content: string
}

/** 教师账号下拉选项 */
export interface TeacherOptionVO {
  /** 用户 ID（雪花 ID，后端已序列化为字符串） */
  id: string
  /** 用户名 */
  username: string
}

/** 上下架状态：1=在线，0=已下线 */
export type PlannerStatus = 0 | 1

export interface PlannerListVO {
  id: string
  /** 绑定的教师账号 ID */
  userId: string
  name: string
  /** 服务对象：高考 / 考研 */
  serviceTarget: string
  position: string | null
  /** 所属省份（中文裸值，如「陕西」） */
  province: string | null
  /** 列表描述 */
  listDesc: string | null
  /** 列表标签 */
  listTags: string[] | null
  /** 头像 URL */
  avatarUrl: string | null
  sortOrder: number
  /** 上下架状态（派生字段） */
  status: PlannerStatus
  /** 绑定的教师账号用户名（派生字段） */
  teacherUsername: string | null
}

export interface PlannerDetailVO {
  id: string
  userId: string
  name: string
  serviceTarget: string
  position: string | null
  province: string | null
  listDesc: string | null
  listTags: string[] | null
  avatarUrl: string | null
  /** 从业年限，如「11年」 */
  workYears: string | null
  /** 服务考生，如「3200+」 */
  servedCount: string | null
  /** 初稿时效，如「48h」 */
  draftSla: string | null
  /** 认证描述，如「持证生涯规划师」 */
  certDesc: string | null
  /** 详情介绍 */
  description: string | null
  /** 详情标签 */
  detailTags: string[] | null
  /** 服务内容 */
  services: PlannerServiceItem[] | null
  email: string | null
  phone: string | null
  address: string | null
  /** 微信二维码 URL */
  wechatQrcodeUrl: string | null
  sortOrder: number
  /** 上下架状态（派生字段） */
  status: PlannerStatus
  /** 绑定的教师账号用户名（派生字段） */
  teacherUsername: string | null
  createdAt: string
  updatedAt: string
}

export interface PlannerQueryDTO {
  /** 姓名模糊查询 */
  name?: string
  /** 服务对象筛选：高考 / 考研 */
  serviceTarget?: string
  /** 省份筛选（中文裸值） */
  province?: string
  /** 上下架筛选：1=仅在线，0=仅已下线，不传=全部 */
  status?: PlannerStatus
  page: number
  size: number
}

export interface PlannerAddDTO {
  /** 绑定的教师账号 ID（必填） */
  userId: string
  /** 姓名（必填） */
  name: string
  /** 服务对象（必填）：高考 / 考研 */
  serviceTarget: string
  position?: string
  province?: string
  listDesc?: string
  listTags?: string[]
  avatarUrl?: string
  workYears?: string
  servedCount?: string
  draftSla?: string
  certDesc?: string
  description?: string
  detailTags?: string[]
  services?: PlannerServiceItem[]
  email?: string
  phone?: string
  address?: string
  wechatQrcodeUrl?: string
  sortOrder?: number
}

export interface PlannerUpdateDTO extends PlannerAddDTO {}
