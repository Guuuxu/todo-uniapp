/**
 * 认证相关的 Hook
 * 提供登录状态检查、权限验证、登出等功能
 */

import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

export function useAuth() {
  const userStore = useUserStore()

  // 计算属性：是否已登录
  const isLoggedIn = computed(() => userStore.isAuthenticated)

  // 计算属性：用户信息
  const userInfo = computed(() => userStore.userInfo)

  /**
   * 检查是否已登录
   * @returns 是否已登录
   */
  function checkAuth(): boolean {
    return userStore.isAuthenticated
  }

  /**
   * 要求登录，未登录则跳转到登录页
   * @returns 是否已登录
   */
  function requireAuth(): boolean {
    if (!userStore.isAuthenticated) {
      uni.reLaunch({
        url: '/pages/login/index',
      })
      return false
    }
    return true
  }

  /**
   * 登出
   * 调用 store 的 logout 方法，清除 token 并跳转到登录页
   */
  function logout(): void {
    userStore.logout()
  }

  return {
    isLoggedIn,
    userInfo,
    checkAuth,
    requireAuth,
    logout,
  }
}
