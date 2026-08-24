import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import JSONBig from 'json-bigint'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './auth'
import { ErrorCode, ErrorMessage } from '../constants/errorCode'
import type { R } from '../types/api'

// axios 配置上的自定义标记：标记"已尝试过刷新"，防止 401 无限重试
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

// 使用 json-bigint 解析响应，避免雪花 ID 等大数字精度丢失
const jsonBigParser = JSONBig({ storeAsString: true })

// 是否正在刷新 Token
let isRefreshing = false
// 等待刷新 Token 的请求队列
let requestsQueue: Array<(token: string) => void> = []

// —— 会话过期统一处理 ——
// 各应用入口调用 setSessionExpiredHandler 注册"请重新登录"弹窗（用各自 UI 库实现）
let sessionExpiredHandler: (() => void) | null = null
// 短时间内只提示一次，避免并发 401 弹窗刷屏；时间窗过后可再次提示（如重新登录后再次过期）
let sessionExpiredShownAt = 0

/**
 * 注册"登录已过期"处理函数（各应用入口处调用一次）
 */
export function setSessionExpiredHandler(handler: () => void): void {
  sessionExpiredHandler = handler
}

/**
 * 会话过期：清除本地 token，并触发"请重新登录"。
 * 已注册弹窗 → 弹窗提示；未注册 → 回退直接跳转登录页（保持旧行为兜底）。
 */
function notifySessionExpired(): void {
  const now = Date.now()
  if (now - sessionExpiredShownAt < 5000) {
    return
  }
  sessionExpiredShownAt = now
  clearTokens()
  if (sessionExpiredHandler) {
    sessionExpiredHandler()
  } else {
    window.location.href = '/login'
  }
}

/**
 * 创建 Axios 实例
 */
const createRequest = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    transformResponse: [
      (data: string) => {
        try {
          return jsonBigParser.parse(data)
        } catch {
          return data
        }
      },
    ],
  })

  /**
   * 尝试刷新 Token 并重试原请求；刷新失败则触发全局"请重新登录"。
   * 同时供 HTTP 401（错误分支）与业务码 401（成功分支）复用。
   */
  const refreshAndRetry = (originalRequest: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    if (isRefreshing) {
      // 正在刷新，将请求加入队列
      return new Promise((resolve) => {
        requestsQueue.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(instance(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    return (async () => {
      try {
        const refreshToken = getRefreshToken()
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        // 从原始请求 URL 提取 prefix（/api/v1/admin 或 /api/v1/app）
        const originalUrl: string = originalRequest.url || ''
        const match = originalUrl.match(/^(\/api\/v1\/(admin|app))/)
        const prefix = match ? match[1] : '/api/v1/admin'

        const response = await axios.post<R<{ accessToken: string; refreshToken: string }>>(
          `${originalRequest.baseURL}${prefix}/auth/refresh`,
          { refreshToken }
        )

        if (response.data.code === ErrorCode.SUCCESS) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data
          setTokens(accessToken, newRefreshToken)

          // 执行队列中的请求
          requestsQueue.forEach((callback) => callback(accessToken))
          requestsQueue = []

          // 重试原请求
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return instance(originalRequest)
        }
        throw new Error('Refresh token failed')
      } catch (refreshError) {
        // 刷新失败：清除 Token 并触发"请重新登录"（弹窗或跳转登录页）
        requestsQueue = []
        notifySessionExpired()
        throw refreshError
      } finally {
        isRefreshing = false
      }
    })()
  }

  // 请求拦截器
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse<R>) => {
      const { data, config } = response

      // blob/arraybuffer 等二进制响应：跳过业务 code 检查，原样返回给调用方
      if (config.responseType === 'blob' || config.responseType === 'arraybuffer') {
        return response
      }

      // 业务错误处理
      if (Number(data.code) !== ErrorCode.SUCCESS) {
        // 20001: TOTP 二次验证，不是错误，放行给调用方处理
        if (Number(data.code) === ErrorCode.TOTP_REQUIRED) {
          data.code = ErrorCode.TOTP_REQUIRED
          return response
        }

        // 业务码 401（AuthAspect/@RequireLogin 抛 BusinessException 时后端返回 HTTP 200 + code 401）：
        // 与 HTTP 401 同等对待，先尝试刷新，刷新失败再触发"请重新登录"
        if (Number(data.code) === ErrorCode.UNAUTHORIZED && !config._retry) {
          return refreshAndRetry(config)
        }

        const message = data.msg || ErrorMessage[Number(data.code)] || '请求失败'
        console.error(`[API Error] ${data.code}: ${message}`)
        return Promise.reject(new Error(message))
      }

      // 归一化 code 为 number，下游无需处理字符串类型
      data.code = Number(data.code)
      return response
    },
    (error) => {
      const originalRequest = error.config

      // 401: Token 过期，尝试刷新
      if (error.response?.status === ErrorCode.UNAUTHORIZED && !originalRequest._retry) {
        return refreshAndRetry(originalRequest)
      }

      // 其他错误
      const message = error.response?.data?.msg || error.message || '网络错误'
      console.error(`[HTTP Error] ${error.response?.status}: ${message}`)

      return Promise.reject(new Error(message))
    }
  )

  return instance
}

// 默认导出一个实例 (baseURL 由各应用的环境变量配置)
export const request = createRequest(import.meta.env.VITE_API_BASE_URL || '')

// 导出创建函数，允许各应用自定义配置
export { createRequest }

// 默认导出，支持 import request from '...' 写法
export default request
