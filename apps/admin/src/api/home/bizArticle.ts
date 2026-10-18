import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  BizArticleListVO,
  BizArticleDetailVO,
  BizArticleQueryDTO,
  BizArticleAddDTO,
  BizArticleUpdateDTO,
} from '@/types/home/bizArticle'

/** 热点资讯接口前缀 */
const PREFIX = '/api/v1/admin/fileload/article'

/** 分页查询热点资讯列表 */
export const getBizArticlePage = (params: BizArticleQueryDTO) => {
  return request.get<R<PageResult<BizArticleListVO>>>(`${PREFIX}/list`, { params })
}

/** 获取热点资讯详情（含富文本正文） */
export const getBizArticleDetail = (id: string) => {
  return request.get<R<BizArticleDetailVO>>(`${PREFIX}/${id}`)
}

/** 新增热点资讯 */
export const addBizArticle = (data: BizArticleAddDTO) => {
  return request.post<R<number>>(`${PREFIX}/add`, data)
}

/** 修改热点资讯 */
export const updateBizArticle = (id: string, data: BizArticleUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

/** 删除热点资讯 */
export const deleteBizArticle = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

/** 获取指定模块下的专栏名列表（去重），用于新增/修改时下拉选择，支持手填新专栏 */
export const getBizArticleColumns = (moduleName: string) => {
  return request.get<R<string[]>>(`${PREFIX}/columns`, { params: { moduleName } })
}
