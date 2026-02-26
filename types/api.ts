/**
 * API 通用响应接口定义
 */

// 通用 API 响应
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// API 错误响应
export interface ApiError {
  code: number
  message: string
}
