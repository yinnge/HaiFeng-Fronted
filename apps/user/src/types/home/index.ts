/**
 * 首页站点信息类型定义
 */

/**
 * 社交媒体链接
 */
export interface ContactUrl {
  wechat: string      // 微信公众号二维码图片URL
  weibo: string       // 微博链接
  zhihu: string       // 知乎链接
  douyin: string      // 抖音链接
  bilibili: string    // B站链接
}

/**
 * 基础联系信息
 */
export interface BasicMessage {
  address: string          // 地址
  phone: string            // 咨询热线
  email: string            // 邮箱
  consultationTime: string // 咨询时间
}

/**
 * 站点信息VO
 */
export interface SiteInfoVO {
  siteIcp: string          // ICP备案号
  contactUrl: ContactUrl   // 社交媒体链接
  basicMessage: BasicMessage // 基础联系信息
}
