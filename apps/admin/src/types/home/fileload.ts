/**
 * 文件加载（初中资源/高中资源）相关类型
 * 对应后端: com.haifeng.admin.controller.fileload
 * 初中: /api/v1/admin/fileload/middle (targetAudience = middle_school)
 * 高中: /api/v1/admin/fileload/high   (targetAudience = high_school)
 */

/** 面向人群 */
export type FileTargetAudience = 'middle_school' | 'high_school' | 'college' | 'civil_service' | 'postgrad_exam' | 'graduate' | 'teacher'

/** 考公资源固定适合人群（V69 预置枚举，面向人群唯一固定值） */
export const CIVIL_SERVICE_STAGE = '考公人'

/** 考研资源固定适合人群（V69 预置枚举，面向人群唯一固定值） */
export const POSTGRAD_EXAM_STAGE = '考研人'

/** 研究生资源固定适合人群（V69 预置枚举，面向人群唯一固定值） */
export const GRADUATE_STAGE = '研究生'

/** 存储方式：OSS-上传文件 / BAIDU-百度网盘链接 */
export type FileStorageType = 'OSS' | 'BAIDU'

/** 学科固定选项 */
export const SUBJECT_OPTIONS = ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理', '其他']

/**
 * 面向人群：展示名 ↔ 存储值。
 * 「中考真题 / 高考真题」是「中考资料 / 高考资料」的展示别名：存储值不变（库里仍是「资料」），
 * 仅前端展示「真题」，避免历史数据迁移。
 */
export const STAGE_LABEL_MAP: Record<string, string> = {
  '中考资料': '中考真题',
  '高考资料': '高考真题',
}

/** 存储值 → 展示名（未在映射表中的原样返回） */
export const stageLabel = (v?: string | null): string => (v ? (STAGE_LABEL_MAP[v] ?? v) : '')

/** 展示名 → 存储值（未在映射表中的原样返回） */
export const stageValue = (label?: string | null): string => {
  if (!label) return ''
  const hit = Object.entries(STAGE_LABEL_MAP).find(([, l]) => l === label)
  return hit ? hit[0] : label
}

export interface StageOption {
  label: string
  value: string
}

/** 初中适合人群（label 展示、value 存储） */
export const MIDDLE_STAGE_OPTIONS: StageOption[] = [
  { label: '初一', value: '初一' },
  { label: '初二', value: '初二' },
  { label: '初三', value: '初三' },
  { label: '中考真题', value: '中考资料' },
  { label: '中考政策解读', value: '中考政策解读' },
]

/** 高中适合人群（label 展示、value 存储） */
export const HIGH_STAGE_OPTIONS: StageOption[] = [
  { label: '高考真题', value: '高考资料' },
  { label: '高一', value: '高一' },
  { label: '高二', value: '高二' },
  { label: '高三', value: '高三' },
  { label: '教师', value: '教师' },
  { label: '高考政策解读', value: '高考政策解读' },
]

/** 大学适合人群（如有调整请告诉我） */
export const COLLEGE_STAGE_OPTIONS = ['大一', '大二', '大三', '大四']

/** 列表 VO */
export interface FileLoadListVO {
  id: string
  fileName: string
  /** 存储方式：OSS-对象存储 / BAIDU-百度网盘 */
  storageType?: FileStorageType | null
  /** 封面图URL（BAIDU 网盘资源可空） */
  coverUrl?: string | null
  fileType: string | null
  fileSize: number
  subject: string
  applicableStage: string | null
  description?: string | null
  tag?: string | null
  createBy: string | null
  createTime: string
}

/** 详情 VO */
export interface FileLoadDetailVO {
  id: string
  fileName: string
  /** 预签名下载 URL（动态生成，BAIDU 行恒为空） */
  fileUrl: string | null
  /** KKFileView 预览地址（BAIDU 行恒为空） */
  filePreviewUrl: string | null
  /** 存储方式：OSS-对象存储 / BAIDU-百度网盘 */
  storageType?: FileStorageType | null
  /** 百度网盘分享链接（BAIDU 行；管理端可见/可编辑） */
  netdiskUrl?: string | null
  /** 百度网盘提取码（BAIDU 行） */
  accessCode?: string | null
  /** 封面图URL（BAIDU 网盘资源可空） */
  coverUrl?: string | null
  fileType: string | null
  fileSize: number
  fileMd5: string | null
  bucketName: string | null
  targetAudience: string
  applicableStage: string | null
  subject: string
  description?: string | null
  tag?: string | null
  version: number
  createBy: string | null
  createTime: string
  updateBy: string | null
  updateTime: string
}

/** 分页查询 DTO */
export interface FileLoadQueryDTO {
  fileName?: string
  subject?: string
  applicableStage?: string
  /** 标签精准匹配 */
  tag?: string
  page: number
  size: number
}

/** 上传 / 修改 DTO（后端 FileLoadUploadDTO） */
export interface FileLoadUploadDTO {
  targetAudience: string
  /** 存储方式：OSS-上传文件（默认） / BAIDU-百度网盘链接；BAIDU 新增时必传 */
  storageType?: FileStorageType
  /** 资源名称：BAIDU 录入/改名时使用；OSS 上传时不传（取文件名） */
  fileName?: string
  /** 百度网盘分享链接（BAIDU 时必填） */
  netdiskUrl?: string
  /** 百度网盘提取码（BAIDU 时可空） */
  accessCode?: string
  /** 封面图URL（可空，默认封面由前端渲染） */
  coverUrl?: string
  subject: string
  applicableStage?: string
  /** 文档简介 */
  description?: string
  /** 模块（比如：英语选词填空/语文作文） */
  tag?: string
  /** 乐观锁版本号，修改时必传 */
  version?: number
}
