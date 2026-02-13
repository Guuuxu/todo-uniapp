/**
 * Axios 请求封装
 * 配置请求和响应拦截器
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from 'axios'
import { getToken, removeToken, removeUserInfo } from '@/utils/storage'
import type { ApiResponse } from '@/types/api'

// 创建 Axios 实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 读取 token 并添加到 Authorization header
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 处理成功响应，返回 data 字段
    const { data } = response
    if (data.code === 0 || data.code === 200) {
      return data.data
    }
    // 其他状态码视为错误
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  (error: AxiosError<ApiResponse>) => {
    // 处理 401 错误：清除 token 和用户信息，跳转到登录页
    if (error.response?.status === 401) {
      removeToken()
      removeUserInfo()
      uni.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none',
      })
      uni.reLaunch({
        url: '/pages/login/index',
      })
      return Promise.reject(new Error('未授权，请重新登录'))
    }

    // 处理其他错误
    const message = error.response?.data?.message || error.message || '网络错误'
    uni.showToast({
      title: message,
      icon: 'none',
    })
    return Promise.reject(error)
  },
)

export default request
