<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

onLaunch(() => {
  console.log('App Launch')

  // 初始化用户状态，从本地存储恢复 token
  const userStore = useUserStore()

  // 如果有 token，尝试恢复用户信息
  if (userStore.token && !userStore.userInfo) {
    // 如果有 token 但没有用户信息，尝试获取用户信息
    userStore.fetchUserInfo().catch(() => {
      // 如果获取失败，清除 token
      userStore.logout()
    })
  }
})

onShow(() => {
  console.log('App Show')

  // 实现路由守卫逻辑
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    const route = currentPage.route

    const userStore = useUserStore()
    const isAuthenticated = userStore.isAuthenticated

    // 定义需要登录的页面
    const protectedPages = [
      'pages/home/index',
      'pages/todo-detail/index',
      'pages/ranking/index',
      'pages/profile/index',
    ]

    // 检查当前页面是否需要登录
    const isProtectedPage = protectedPages.some((page) => route?.includes(page))

    // 未登录且访问受保护页面，跳转到登录页
    if (isProtectedPage && !isAuthenticated) {
      uni.reLaunch({
        url: '/pages/login/index',
      })
    }

    // 已登录且访问登录页，跳转到首页
    if (route?.includes('pages/login/index') && isAuthenticated) {
      uni.reLaunch({
        url: '/pages/home/index',
      })
    }
  }
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style>
/* 全局样式 */
page {
  background-color: #f8f8f8;
}
</style>
