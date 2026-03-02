/**
 * 用户相关 API
 */

import request from './request'
import type { LoginRequest, LoginResponse, UserInfo } from '@/types/user'
import type { Todo } from '@/types/todo'

/**
 * 用户登录
 */
export function login(data: LoginRequest): Promise<LoginResponse> {
  return request({
    url: '/auth/login',
    method: 'POST',
    data,
  })
}

/**
 * 用户注册
 */
export function register(data: LoginRequest): Promise<LoginResponse> {
  return request({
    url: '/auth/register',
    method: 'POST',
    data,
  })
}

/**
 * 获取用户信息
 */
export function getUserInfo(): Promise<UserInfo> {
  return request({
    url: '/users/me',
    method: 'GET',
  })
}

/**
 * 获取指定用户信息
 */
export function getUserById(id: string): Promise<UserInfo> {
  return request({
    url: `/users/${id}`,
    method: 'GET',
  })
}

/**
 * 获取指定用户的待办事项列表
 * @param userId - 用户 ID
 */
export function getUserTodos(userId: string): Promise<Todo[]> {
  return request({
    url: `/todos/user/${userId}`,
    method: 'GET',
  })
}

/**
 * 更新用户信息
 */
export function updateUserInfo(data: Partial<UserInfo>): Promise<UserInfo> {
  return request({
    url: '/users/update',
    method: 'PUT',
    data,
  })
}

/**
 * 微信登录
 */
export function wechatLogin(data: {
  code: string
  userInfo?: any
}): Promise<LoginResponse> {
  return request({
    url: '/auth/wechat',
    method: 'POST',
    data,
  })
}