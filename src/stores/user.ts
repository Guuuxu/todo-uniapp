/**
 * 用户状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, LoginRequest } from '@/types/user'
import * as userApi from '@/api/user'
import {
  setToken as saveToken,
  getToken as loadToken,
  removeToken as clearToken,
  setUserInfo as saveUserInfo,
  getUserInfo as loadUserInfo,
  removeUserInfo as clearUserInfo,
} from '@/utils/storage'

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string | null>(loadToken())
  const userInfo = ref<UserInfo | null>(loadUserInfo())
  const isLoggedIn = ref<boolean>(!!token.value)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!userInfo.value)

  // Actions
  /**
   * 用户登录
   */
  async function login(data: LoginRequest): Promise<void> {
    const response = await userApi.login(data)
    token.value = response.token
    userInfo.value = response.user
    isLoggedIn.value = true

    // 保存到本地存储
    saveToken(response.token)
    saveUserInfo(response.user)
  }

  /**
   * 用户注册
   */
  async function register(data: LoginRequest): Promise<void> {
    const response = await userApi.register(data)
    token.value = response.token
    userInfo.value = response.user
    isLoggedIn.value = true

    // 保存到本地存储
    saveToken(response.token)
    saveUserInfo(response.user)
  }

  /**
   * 用户登出
   */
  function logout(): void {
    token.value = null
    userInfo.value = null
    isLoggedIn.value = false

    // 清除本地存储
    clearToken()
    clearUserInfo()

    // 跳转到登录页
    uni.reLaunch({
      url: '/pages/login/index',
    })
  }

  /**
   * 获取用户信息
   */
  async function fetchUserInfo(): Promise<void> {
    const info = await userApi.getUserInfo()
    userInfo.value = info
    saveUserInfo(info)
  }

  /**
   * 更新用户信息
   */
  async function updateUserInfo(data: Partial<UserInfo>): Promise<void> {
    const updatedInfo = await userApi.updateUserInfo(data)
    userInfo.value = updatedInfo
    saveUserInfo(updatedInfo)
  }

  return {
    // State
    token,
    userInfo,
    isLoggedIn,
    // Getters
    isAuthenticated,
    // Actions
    login,
    register,
    logout,
    fetchUserInfo,
    updateUserInfo,
  }
})
