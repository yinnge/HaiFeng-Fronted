import type { BasePageQuery } from '@haifeng/shared'

/** 专栏文件分页查询参数（分页 size 受后端 BasePageQueryDTO 约束，必须落在 [10,100]） */
export interface FileLoadQueryDTO extends BasePageQuery {
  /** 学科筛选（可选） */
  subject?: string
  /** 适用阶段筛选（可选） */
  applicableStage?: string
  /** 标签筛选（可选） */
  tag?: string
  /** 独立搜索关键词（可选）：命中文件名或简介，与学科/阶段/标签筛选 AND 叠加 */
  keyword?: string
  /**
   * 收藏过滤（可选）：仅返回命中的文件 id，与其它筛选 AND 叠加（对应后端 FileLoadPageQueryDTO.ids）。
   * 逗号分隔的 id 字符串（Spring 自动拆分绑定 List<Long>）；
   * 空字符串表示"无收藏"→ 后端直接返回空页。
   */
  ids?: string
}

/** 文件列表 VO（对应后端 FileLoadListVO） */
export interface FileLoadListVO {
  /** Long 序列化为字符串，防精度丢失 */
  id: string
  fileName: string
  /** 存储方式：OSS-对象存储 / BAIDU-百度网盘 */
  storageType?: 'OSS' | 'BAIDU'
  /** 封面图URL（BAIDU 网盘资源可空，为空前端渲染默认网盘封面） */
  coverUrl?: string
  fileType: string
  /** 字节数 */
  fileSize: number
  subject?: string
  applicableStage?: string
  /** 文档简介（后端 t_file_info.description） */
  description?: string
  /** 标签（后端 t_file_info.tag，单值：备考指南/就业辅导等） */
  tag?: string
  createTime?: string
}

/** 文件详情 VO（对应后端 FileLoadDetailVO，含预览/下载 URL） */
export interface FileLoadDetailVO extends FileLoadListVO {
  /** KKFileView 在线预览地址（仅可预览类型返回；BAIDU 行恒为空） */
  previewUrl?: string
  /** OSS 预签名下载地址（BAIDU 行恒为空） */
  downloadUrl?: string
}

/** 百度网盘取码信息（对应后端 NetdiskInfoVO，仅 VIP 可获取） */
export interface NetdiskInfoVO {
  /** 百度网盘分享链接 */
  netdiskUrl: string
  /** 提取码（可空，无提取码时前端不展示） */
  accessCode?: string | null
}

/**
 * 专栏受众（值即后端接口路径前缀）：
 * middle=初中 / high=高中 / college=大学 /
 * civil-service=考公（固定面向人群：考公人）/ postgrad-exam=考研（固定：考研人）/ graduate=研究生（固定：研究生）
 */
export type FileLoadAudience =
  | 'middle'
  | 'high'
  | 'college'
  | 'civil-service'
  | 'postgrad-exam'
  | 'graduate'
