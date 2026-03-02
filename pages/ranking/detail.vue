<template>
  <view class="ranking-detail-page">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 用户信息头部 -->
    <view v-else-if="userInfo" class="user-header-card">
      <view class="user-header">
        <image
          v-if="userInfo.avatar"
          :src="userInfo.avatar"
          class="user-avatar"
          mode="aspectFill"
        />
        <view v-else class="avatar-placeholder">
          {{ userInfo.username.charAt(0).toUpperCase() }}
        </view>
        <view class="user-info">
          <text class="username">{{ userInfo.username }}</text>
          <view class="user-stats">
            <text class="stat-item">
              <text class="stat-icon">👍</text>
              <text class="stat-text">{{ totalLikes }}</text>
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 待办事项列表 -->
    <view v-if="!loading && userInfo" class="todos-section">
      <view class="section-title">待办事项</view>
      <view v-if="todosLoading" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>
      <view v-else-if="todoList.length > 0" class="todo-list">
        <TodoItem
          v-for="todo in todoList"
          :key="todo.id"
          :todo="todo"
          :show-actions="false"
          @click="handleTodoClick(todo.id)"
        />
      </view>
      <Empty v-else message="暂无待办事项" icon="📝" />
    </view>

    <!-- 错误状态 -->
    <view v-if="!loading && !userInfo" class="error-container">
      <Empty message="用户信息加载失败" icon="❌" />
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 榜单详情页面
 */

import { ref, computed, onMounted } from 'vue'
import * as userApi from '@/api/user'
import type { UserInfo } from '@/types/user'
import type { Todo } from '@/types/todo'
import TodoItem from '@/components/TodoItem.vue'
import Empty from '@/components/Empty.vue'

// 状态
const loading = ref(false)
const todosLoading = ref(false)
const userInfo = ref<UserInfo | null>(null)
const todoList = ref<Todo[]>([])
const userId = ref('')

// 计算属性：总点赞数
const totalLikes = computed(() => {
  return todoList.value.reduce((sum: number, todo: Todo) => {
    return sum + ((todo as any).like_count || todo.likes || 0)
  }, 0)
})

/**
 * 加载用户信息
 */
async function loadUserInfo() {
  if (!userId.value) {
    uni.showToast({
      title: '参数错误',
      icon: 'none',
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }

  loading.value = true
  try {
    const info = await userApi.getUserById(userId.value)
    userInfo.value = info
    // 加载用户信息成功后，加载待办事项列表
    await loadUserTodos()
  } catch (error: any) {
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

/**
 * 加载用户待办事项列表
 */
async function loadUserTodos() {
  if (!userId.value) return

  todosLoading.value = true
  try {
    const todos = await userApi.getUserTodos(userId.value)
    todoList.value = todos
  } catch (error: any) {
    uni.showToast({
      title: '加载待办事项失败',
      icon: 'none',
    })
  } finally {
    todosLoading.value = false
  }
}

/**
 * 点击 Todo 跳转到详情页
 */
function handleTodoClick(id: string) {
  uni.navigateTo({
    url: `/pages/todo-detail/index?id=${id}`,
  })
}

// 页面加载时获取路由参数并加载数据
onMounted(() => {
  // 获取路由参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options as any

  if (options.userId) {
    userId.value = options.userId
    loadUserInfo()
  } else {
    uni.showToast({
      title: '参数错误',
      icon: 'none',
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})
</script>

<style scoped>
.ranking-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.error-container {
  padding: 80rpx 24rpx;
}

.user-header-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.user-header {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  margin-right: 24rpx;
}

.avatar-placeholder {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 48rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 24rpx;
}

.username {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.user-stats {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stat-icon {
  font-size: 28rpx;
}

.stat-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.todos-section {
  background: #fff;
  border-radius: 12rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
</style>

