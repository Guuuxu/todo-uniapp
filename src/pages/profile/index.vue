<template>
  <view class="profile-page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view v-if="loading" class="loading">加载中...</view>
      <template v-else-if="userInfo">
        <!-- 头像和用户名 -->
        <view class="user-header">
          <image
            v-if="userInfo.avatar"
            :src="userInfo.avatar"
            class="avatar"
            mode="aspectFill"
          />
          <view v-else class="avatar-placeholder">
            {{ userInfo.username.charAt(0).toUpperCase() }}
          </view>
          <view class="user-info">
            <text class="username">{{ userInfo.username }}</text>
            <text class="user-id">ID: {{ userInfo.id }}</text>
          </view>
        </view>

        <!-- 统计数据 -->
        <view class="stats-section">
          <view class="stat-item">
            <text class="stat-value">{{ statistics.totalTodos }}</text>
            <text class="stat-label">Todo 总数</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ statistics.completedTodos }}</text>
            <text class="stat-label">已完成</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ statistics.totalLikes }}</text>
            <text class="stat-label">获赞数</text>
          </view>
        </view>
      </template>
    </view>

    <!-- 编辑个人信息 -->
    <view v-if="!loading && userInfo" class="action-section">
      <view class="section-title">个人信息</view>
      <view class="form-item">
        <text class="form-label">用户名</text>
        <input
          v-model="editForm.username"
          class="form-input"
          placeholder="请输入用户名"
          :maxlength="20"
        />
      </view>
      <view class="form-item">
        <text class="form-label">头像 URL</text>
        <input
          v-model="editForm.avatar"
          class="form-input"
          placeholder="请输入头像 URL"
        />
      </view>
      <button class="edit-btn" @click="handleUpdate">保存修改</button>
    </view>

    <!-- 退出登录 -->
    <view v-if="!loading" class="logout-section">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 个人中心页面
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/hooks/useAuth'
import { useUserStore } from '@/stores/user'
import { useTodoStore } from '@/stores/todo'

// 使用 hooks 和 stores
const { requireAuth, logout } = useAuth()
const userStore = useUserStore()
const todoStore = useTodoStore()

// 状态
const loading = ref(false)
const editForm = ref({
  username: '',
  avatar: '',
})

// 计算属性：用户信息
const userInfo = computed(() => userStore.userInfo)

// 计算属性：统计数据
const statistics = computed(() => {
  const todos = todoStore.todoList
  const totalTodos = todos.length
  const completedTodos = todos.filter((todo) => todo.completed).length
  const totalLikes = todos.reduce((sum, todo) => sum + todo.likes, 0)

  return {
    totalTodos,
    completedTodos,
    totalLikes,
  }
})

/**
 * 加载用户信息和 Todo 列表
 */
async function loadData() {
  loading.value = true
  try {
    // 加载用户信息
    await userStore.fetchUserInfo()

    // 加载 Todo 列表以计算统计数据
    await todoStore.fetchTodoList()

    // 初始化编辑表单
    if (userInfo.value) {
      editForm.value.username = userInfo.value.username
      editForm.value.avatar = userInfo.value.avatar || ''
    }
  } catch (error) {
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

/**
 * 更新用户信息
 */
async function handleUpdate() {
  // 验证输入
  if (!editForm.value.username.trim()) {
    uni.showToast({
      title: '请输入用户名',
      icon: 'none',
    })
    return
  }

  try {
    await userStore.updateUserInfo({
      username: editForm.value.username.trim(),
      avatar: editForm.value.avatar.trim() || undefined,
    })

    uni.showToast({
      title: '更新成功',
      icon: 'success',
    })
  } catch (error) {
    uni.showToast({
      title: '更新失败',
      icon: 'none',
    })
  }
}

/**
 * 退出登录
 */
function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        logout()
      }
    },
  })
}

// 页面加载时检查登录状态并加载数据
onMounted(() => {
  if (requireAuth()) {
    loadData()
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
}

.user-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.loading {
  text-align: center;
  padding: 80rpx 0;
  font-size: 28rpx;
  color: #999;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}

.avatar {
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
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.user-id {
  font-size: 24rpx;
  color: #999;
}

.stats-section {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-top: 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: #e0e0e0;
}

.action-section {
  background: #fff;
  border-radius: 12rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  box-sizing: border-box;
}

.edit-btn {
  width: 100%;
  height: 80rpx;
  background: #1890ff;
  color: #fff;
  font-size: 28rpx;
  border: none;
  border-radius: 8rpx;
  line-height: 80rpx;
  margin-top: 8rpx;
}

.logout-section {
  background: #fff;
  border-radius: 12rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.logout-btn {
  width: 100%;
  height: 80rpx;
  background: #ff4d4f;
  color: #fff;
  font-size: 28rpx;
  border: none;
  border-radius: 8rpx;
  line-height: 80rpx;
}
</style>
