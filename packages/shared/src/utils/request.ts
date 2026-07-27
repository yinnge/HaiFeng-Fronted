import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './auth'
import { ErrorCode, ErrorMessage } from '../constants/errorCode'
import type { R } from '../types/api'

// 是否正在刷新 Token
let isRefreshing = false
// 等待刷新 Token 的请求队列
let requestsQueue: Array<(token: string) => void> = []

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
  })

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
      const { data } = response

      // 业务错误处理
      if (data.code !== ErrorCode.SUCCESS) {
        // 20001: TOTP 二次验证，不是错误，放行给调用方处理
        if (data.code === ErrorCode.TOTP_REQUIRED) {
          return response
        }

        const message = data.msg || ErrorMessage[data.code] || '请求失败'
        console.error(`[API Error] ${data.code}: ${message}`)
        return Promise.reject(new Error(message))
      }

      return response
    },
    async (error) => {
      const originalRequest = error.config

      // 401: Token 过期，尝试刷新
      if (error.response?.status === ErrorCode.UNAUTHORIZED && !originalRequest._retry) {
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
          } else {
            throw new Error('Refresh token failed')
          }
        } catch (refreshError) {
          // 刷新失败，清除 Token 并跳转登录页
          clearTokens()
          requestsQueue = []

          // 跳转到登录页 (需要根据应用类型调整路径)
          window.location.href = '/login'

          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
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
