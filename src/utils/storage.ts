/**
 * 本地存储工具函数
 * 封装 UniApp 的 uni.storage API
 */

import type { UserInfo } from '@/types/user'

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'

/**
 * 保存 token
 */
export function setToken(token: string): void {
  uni.setStorageSync(TOKEN_KEY, token)
}

/**
 * 获取 token
 */
export function getToken(): string | null {
  return uni.getStorageSync(TOKEN_KEY) || null
}

/**
 * 删除 token
 */
export function removeToken(): void {
  uni.removeStorageSync(TOKEN_KEY)
}

/**
 * 保存用户信息
 */
export function setUserInfo(userInfo: UserInfo): void {
  uni.setStorageSync(USER_INFO_KEY, JSON.stringify(userInfo))
}

/**
 * 获取用户信息
 */
export function getUserInfo(): UserInfo | null {
  const userInfoStr = uni.getStorageSync(USER_INFO_KEY)
  if (!userInfoStr) {
    return null
  }
  try {
    return JSON.parse(userInfoStr) as UserInfo
  } catch (error) {
    console.error('Failed to parse user info:', error)
    return null
  }
}

/**
 * 删除用户信息
 */
export function removeUserInfo(): void {
  uni.removeStorageSync(USER_INFO_KEY)
}
