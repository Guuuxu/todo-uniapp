/**
 * 用户相关 API
 */

import request from './request'
import type { LoginRequest, LoginResponse, UserInfo } from '@/types/user'

/**
 * 用户登录
 */
export function login(data: LoginRequest): Promise<LoginResponse> {
  return request({
    url: '/user/login',
    method: 'POST',
    data,
  })
}

/**
 * 用户注册
 */
export function register(data: LoginRequest): Promise<LoginResponse> {
  return request({
    url: '/user/register',
    method: 'POST',
    data,
  })
}

/**
 * 获取用户信息
 */
export function getUserInfo(): Promise<UserInfo> {
  return request({
    url: '/user/info',
    method: 'GET',
  })
}

/**
 * 更新用户信息
 */
export function updateUserInfo(data: Partial<UserInfo>): Promise<UserInfo> {
  return request({
    url: '/user/info',
    method: 'PUT',
    data,
  })
}
