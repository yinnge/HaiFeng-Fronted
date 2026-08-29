/**
 * 文件加载（初中资源/高中资源）相关类型
 * 对应后端: com.haifeng.admin.controller.fileload
 * 初中: /api/v1/admin/fileload/middle (targetAudience = middle_school)
 * 高中: /api/v1/admin/fileload/high   (targetAudience = high_school)
 */

/** 面向人群 */
export type FileTargetAudience = 'middle_school' | 'high_school' | 'college'

/** 学科固定选项 */
export const SUBJECT_OPTIONS = ['语文', '数学', '英语', '物理', '化学', '生物', '政治', '历史', '地理', '其他']

/** 初中适合人群 */
export const MIDDLE_STAGE_OPTIONS = ['初一', '初二', '初三']

/** 高中适合人群 */
export const HIGH_STAGE_OPTIONS = ['高一', '高二', '高三']

/** 大学适合人群（如有调整请告诉我） */
export const COLLEGE_STAGE_OPTIONS = ['大一', '大二', '大三', '大四']

/** 列表 VO */
export interface FileLoadListVO {
  id: string
  fileName: string
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
  /** 预签名下载 URL（动态生成） */
  fileUrl: string
  /** KKFileView 预览地址（可空） */
  filePreviewUrl: string | null
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
  subject: string
  applicableStage?: string
  /** 文档简介 */
  description?: string
  /** 标签（备考指南/就业辅导等） */
  tag?: string
  /** 乐观锁版本号，修改时必传 */
  version?: number
}
