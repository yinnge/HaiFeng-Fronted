/**
 * 错误码常量 (与后端 ResultCode 对应)
 */
export const ErrorCode = {
  // HTTP 标准错误码
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,       // 未登录/Token 过期
  FORBIDDEN: 403,          // 无权限
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,  // 请求过于频繁
  SERVER_ERROR: 500,

  // 业务错误码 (从 1000 开始)
  USER_NOT_FOUND: 1001,
  PASSWORD_ERROR: 1002,
  MEMBER_EXPIRED: 1003,
  REQUIRE_PRO: 1004,       // 需要专业版及以上
  REQUIRE_VIP: 1005,       // 需要旗舰版
  TOTP_REQUIRED: 20001,    // TOTP 二次验证
} as const

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode]

/**
 * 错误码对应的提示信息
 */
export const ErrorMessage: Record<number, string> = {
  [ErrorCode.BAD_REQUEST]: '请求参数错误',
  [ErrorCode.UNAUTHORIZED]: '登录已过期，请重新登录',
  [ErrorCode.FORBIDDEN]: '没有访问权限',
  [ErrorCode.NOT_FOUND]: '请求的资源不存在',
  [ErrorCode.TOO_MANY_REQUESTS]: '请求过于频繁，请稍后再试',
  [ErrorCode.SERVER_ERROR]: '服务器内部错误',
  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.PASSWORD_ERROR]: '密码错误',
  [ErrorCode.MEMBER_EXPIRED]: '会员已过期',
  [ErrorCode.REQUIRE_PRO]: '该功能需要专业版及以上会员',
  [ErrorCode.REQUIRE_VIP]: '该功能需要VIP会员',
}
