/**
 * 用户接口定义
 */

// 用户信息
export interface UserInfo {
  id: string
  username: string
  avatar?: string
  createdAt: string
}

// 完整用户对象
export interface User extends UserInfo {
  token: string
}

// 登录请求
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应
export interface LoginResponse {
  token: string
  user: UserInfo
}
