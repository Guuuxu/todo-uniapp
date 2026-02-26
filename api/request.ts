/**
 * uni.request 请求封装
 * 配置请求和响应拦截器，兼容 axios 风格的 API
 */

import { getToken, removeToken, removeUserInfo } from '@/utils/storage'
import type { ApiResponse } from '@/types/api'

// uni-app 类型声明
declare const uni: any

const baseURL = 'http://localhost:3000/api'
const timeout = 10000

// 请求配置接口
interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  params?: any
  headers?: Record<string, string>
}

/**
 * 请求函数
 */
function request<T = any>(config: RequestConfig): Promise<T> {
  return new Promise((resolve, reject) => {
    // 请求拦截器：添加 token
    const token = getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    // 处理 URL：拼接 baseURL 和 params
    let url = baseURL + config.url
    if (config.params) {
      const params: string[] = []
      for (const key in config.params) {
        if (config.params.hasOwnProperty(key)) {
          params.push(
            `${encodeURIComponent(key)}=${encodeURIComponent(config.params[key])}`
          )
        }
      }
      if (params.length > 0) {
        url += (url.includes('?') ? '&' : '?') + params.join('&')
      }
    }

    // 发送请求
    uni.request({
      url,
      method: config.method || 'GET',
      data: config.data,
      header: headers,
      timeout,
      success: (res: any) => {
        // 响应拦截器：处理响应
        const statusCode = res.statusCode
        const responseData = res.data as ApiResponse<T>

        // HTTP 状态码错误处理
        if (statusCode >= 200 && statusCode < 300) {
          // 处理业务响应
          if (responseData.code === 0 || responseData.code === 200) {
            resolve(responseData.data as T)
          } else {
            // 业务错误
            const message = responseData.message || '请求失败'
            uni.showToast({
              title: message,
              icon: 'none',
            })
            reject(new Error(message))
          }
        } else if (statusCode === 401) {
          // 401 未授权：清除 token 和用户信息，跳转到登录页
          removeToken()
          removeUserInfo()
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
          })
          uni.reLaunch({
            url: '/pages/login/index',
          })
          reject(new Error('未授权，请重新登录'))
        } else {
          // 其他 HTTP 错误
          const message = responseData?.message || `请求失败 (${statusCode})`
          uni.showToast({
            title: message,
            icon: 'none',
          })
          reject(new Error(message))
        }
      },
      fail: (err: any) => {
        // 网络错误
        const message = err.errMsg || '网络错误'
        uni.showToast({
          title: message,
          icon: 'none',
        })
        reject(new Error(message))
      },
    })
  })
}

export default request
