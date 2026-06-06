import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { SiteInfoVO } from '@/types/home'

const PREFIX = '/api/v1/app/home'

/**
 * 获取站点信息（公开接口，无需登录）
 */
export const getSiteInfo = () =>
  request.get<R<SiteInfoVO>>(`${PREFIX}/site-info`)
