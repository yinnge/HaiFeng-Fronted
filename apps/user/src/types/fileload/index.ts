import type { BasePageQuery } from '@haifeng/shared'

/** 专栏文件分页查询参数（分页 size 受后端 BasePageQueryDTO 约束，必须落在 [10,100]） */
export interface FileLoadQueryDTO extends BasePageQuery {
  /** 学科筛选（可选） */
  subject?: string
  /** 适用阶段筛选（可选） */
  applicableStage?: string
}

/** 文件列表 VO（对应后端 FileLoadListVO） */
export interface FileLoadListVO {
  /** Long 序列化为字符串，防精度丢失 */
  id: string
  fileName: string
  fileType: string
  /** 字节数 */
  fileSize: number
  subject?: string
  applicableStage?: string
  createTime?: string
}

/** 文件详情 VO（对应后端 FileLoadDetailVO，含预览/下载 URL） */
export interface FileLoadDetailVO extends FileLoadListVO {
  /** KKFileView 在线预览地址（仅可预览类型返回） */
  previewUrl?: string
  /** OSS 预签名下载地址 */
  downloadUrl?: string
}

/** 专栏受众：初中 / 高中（对应后端 /fileload/middle 与 /fileload/high） */
export type FileLoadAudience = 'middle' | 'high'
