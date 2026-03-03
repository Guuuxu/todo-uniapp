<template>
  <view class="todo-detail-page">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading">加载中...</view>

    <!-- Todo 详情 -->
    <view v-else-if="todoStore.currentTodo" class="detail-container">
      <!-- Todo 信息卡片 -->
      <view class="todo-card">
        <view class="todo-header">
          <text class="todo-title">{{ todoStore.currentTodo.title }}</text>
          <view class="todo-status">
            <text :class="[
              'status-badge',
              todoStore.currentTodo.is_completed ? 'completed' : 'pending',
            ]">
              {{ todoStore.currentTodo.is_completed ? '已完成' : '进行中' }}
            </text>
          </view>
        </view>
        <view class="todo-content">{{ todoStore.currentTodo.description }}</view>
        <view class="todo-meta">
          <view class="meta-item">
            <text class="meta-icon">📅</text>
            <text class="meta-text">{{ formattedDate }}</text>
          </view>
        </view>

        <!-- 操作按钮区域 -->
        <view class="todo-operations">
          <!-- 完成状态切换 -->
          <button v-if="canEdit" :class="[
            'operation-btn',
            'complete-btn',
            todoStore.currentTodo.is_completed ? 'completed' : '',
          ]" @click="handleToggleComplete">
            <text class="operation-icon">{{ todoStore.currentTodo.is_completed ? '✅' : '⭕' }}</text>
            <text class="operation-text">{{ todoStore.currentTodo.is_completed ? '已完成' : '标记完成' }}</text>
          </button>
          
          <!-- 邀请监督（只有创建者可以邀请） -->
          <button v-if="isOwner" class="operation-btn watch-btn" @click="showInviteModal = true">
            <text class="operation-icon">👁️</text>
            <text class="operation-text">邀请监督</text>
          </button>
        </view>

        <!-- 点赞和评论统计 -->
        <view class="todo-actions">
          <button :class="[
            'action-btn',
            'like-btn',
            todoStore.currentTodo.is_liked ? 'liked' : '',
          ]" @click="handleToggleLike">
            <text class="action-icon">{{
              todoStore.currentTodo.is_liked ? '❤️' : '🤍'
            }}</text>
            <text class="action-text">{{ todoStore.currentTodo.like_count }}</text>
          </button>
          <view class="action-btn comment-count">
            <text class="action-icon">💬</text>
            <text class="action-text">{{
              todoStore.currentTodo.comment_count
            }}</text>
          </view>
        </view>

        <!-- 监督人列表 -->
        <view v-if="watchers.length > 0" class="watchers-section">
          <view class="section-title">监督人 ({{ watchers.length }})</view>
          <view class="watchers-list">
            <view v-for="watcher in watchers" :key="watcher.id" class="watcher-item">
              <image
                v-if="watcher.avatar"
                :src="watcher.avatar"
                class="watcher-avatar"
                mode="aspectFill"
              />
              <view v-else class="watcher-avatar-placeholder">
                {{ watcher.username.charAt(0).toUpperCase() }}
              </view>
              <text class="watcher-name">{{ watcher.username }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 评论区域 -->
      <view class="comment-section">
        <view class="section-title">评论 ({{ commentList.length }})</view>

        <!-- 发表评论 -->
        <view class="comment-input-section">
          <textarea v-model="newCommentContent" class="comment-input" placeholder="写下你的评论..." :maxlength="500" />
          <button class="submit-btn" @click="handleCreateComment">发表</button>
        </view>

        <!-- 评论列表 -->
        <view class="comment-list">
          <template v-if="commentList.length > 0">
            <CommentItem v-for="comment in commentList" :key="comment.id" :comment="comment"
              :can-delete="canDeleteComment(comment)" @delete="handleDeleteComment(comment.id)" />
          </template>
          <Empty v-else message="暂无评论，快来抢沙发吧！" icon="💬" />
        </view>
      </view>
    </view>

      <!-- 错误状态 -->
      <view v-else class="error-container">
        <Empty message="Todo 不存在或已被删除" icon="❌" />
      </view>
    

    <!-- 邀请监督弹窗 -->
    <view v-if="showInviteModal" class="modal-overlay" @click="showInviteModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">邀请监督</text>
          <text class="modal-close" @click="showInviteModal = false">✕</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">用户名或ID</text>
            <input
              v-model="inviteUsername"
              class="form-input"
              placeholder="请输入要邀请的用户名或ID"
              :maxlength="50"
            />
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @click="showInviteModal = false">取消</button>
          <button class="modal-btn confirm-btn" @click="handleInviteWatch">确认邀请</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * Todo 详情页
 * Requirements: 2.3, 3.1, 3.2, 3.4, 4.1, 4.2, 4.3, 4.4, 8.2
 */

import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/hooks/useAuth'
import { useTodoStore } from '@/stores/todo'
import { useCommentStore } from '@/stores/comment'
import CommentItem from '@/components/CommentItem.vue'
import Empty from '@/components/Empty.vue'
import * as todoApi from '@/api/todo'
import type { UserInfo } from '@/types/user'
import { formatDate } from '@/utils/format'

// 使用 hooks 和 stores
const { checkAuth, userInfo } = useAuth()
const todoStore = useTodoStore()
const commentStore = useCommentStore()

// 状态
const loading = ref(false)
const todoId = ref('')
const newCommentContent = ref('')
const watchers = ref<UserInfo[]>([])
const watchersLoading = ref(false)
const isWatching = ref(false)
const showInviteModal = ref(false)
const inviteUsername = ref('')

// 计算属性
const commentList = computed(() => {
  return commentStore.getCommentsByTodoId(todoId.value)
})

const formattedDate = computed(() => {
  if (!todoStore.currentTodo || !todoStore.currentTodo.created_at) return ''
  return formatDate(todoStore.currentTodo.created_at, 'YYYY-MM-DD HH:mm')
})

// 获取 Todo 的创建者 ID（兼容 userId 和 user_id）
const getTodoUserId = (todo: any): string | undefined => {
  return todo?.user_id || todo?.user?.id
}

// 判断是否可以编辑（创建者或监督人）
const canEdit = computed(() => {
  if (!todoStore.currentTodo || !userInfo.value) return false
  const todoUserId = getTodoUserId(todoStore.currentTodo)
  // 是创建者
  if (todoUserId === userInfo.value.id) return true
  // 是监督人
  return watchers.value.some((w: UserInfo) => w.id === userInfo.value?.id)
})

// 判断是否是创建者（只有创建者可以邀请监督）
const isOwner = computed(() => {
  console.log(todoStore)
  if (!todoStore.currentTodo || !userInfo.value) {
    console.log('[TODO_DEBUG] isOwner: 缺少数据', {
      hasTodo: !!todoStore.currentTodo,
      hasUser: !!userInfo.value,
      todo: todoStore.currentTodo,
      user: userInfo.value
    })
    return false
  }
  const todoUserId = getTodoUserId(todoStore.currentTodo)
  const isOwnerResult = todoUserId === userInfo.value.id
  console.log('[TODO_DEBUG] isOwner: 判断结果', {
    todoUserId: todoUserId,
    currentUserId: userInfo.value.id,
    todo: todoStore.currentTodo,
    isOwner: isOwnerResult
  })
  return isOwnerResult
})

/**
 * 判断是否可以删除评论
 */
function canDeleteComment(comment: any): boolean {
  return userInfo.value?.id === comment.userId
}

/**
 * 加载 Todo 详情
 */
async function loadTodoDetail() {
  loading.value = true
  try {
    await todoStore.fetchTodoDetail(todoId.value)
    // 加载监督人列表
    await loadWatchers()
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
 * 加载监督人列表
 */
async function loadWatchers() {
  if (!todoId.value) return
  
  watchersLoading.value = true
  try {
    const watchersList = await todoApi.getTodoWatchers(todoId.value)
    watchers.value = watchersList
    // 检查当前用户是否是监督人
    if (userInfo.value) {
      isWatching.value = watchersList.some((w: UserInfo) => w.id === userInfo.value?.id)
    }
  } catch (error: any) {
    // 如果接口不存在或失败，静默处理
    console.log('[TODO_DEBUG] 加载监督人失败:', error)
  } finally {
    watchersLoading.value = false
  }
}

/**
 * 切换完成状态
 */
async function handleToggleComplete() {
  if (!checkAuth() || !todoStore.currentTodo) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }

  try {
    const newCompleted = !todoStore.currentTodo.is_completed
    await todoStore.completeTodo(todoId.value, { is_completed: newCompleted })
    uni.showToast({
      title: newCompleted ? '标记为已完成' : '标记为未完成',
      icon: 'success',
    })
    todoStore.currentTodo.is_completed = newCompleted
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'none',
    })
  }
}

/**
 * 邀请监督
 */
async function handleInviteWatch() {
  if (!checkAuth()) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }

  // 验证输入
  if (!inviteUsername.value.trim()) {
    uni.showToast({
      title: '请输入用户名或ID',
      icon: 'none',
    })
    return
  }

  try {
    // 如果输入的是用户名，需要先获取用户ID
    let userId = inviteUsername.value.trim()
    
    // 如果不是纯数字，尝试通过用户名获取用户ID
    if (isNaN(Number(userId))) {
      // 这里假设后端接口支持通过用户名获取用户信息
      // 如果后端不支持，可以提示用户输入ID
      uni.showToast({
        title: '请输入用户ID',
        icon: 'none',
      })
      return
    }

    // 调用邀请接口（需要传递用户ID）
    await todoApi.inviteWatch(todoId.value, userId)
    uni.showToast({
      title: '邀请监督成功',
      icon: 'success',
    })
    // 关闭弹窗
    showInviteModal.value = false
    inviteUsername.value = ''
    // 重新加载监督人列表
    await loadWatchers()
  } catch (error: any) {
    uni.showToast({
      title: error.message || '邀请失败',
      icon: 'none',
    })
  }
}

/**
 * 加载评论列表
 */
async function loadComments() {
  try {
    await commentStore.fetchComments(todoId.value)
  } catch (error) {
    uni.showToast({
      title: '评论加载失败',
      icon: 'none',
    })
  }
}

/**
 * 切换点赞状态
 */
async function handleToggleLike() {
  if (!checkAuth()) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }

  try {
    if (todoStore.currentTodo?.is_liked) {
      await todoStore.cancelLike(todoId.value)
      todoStore.currentTodo.like_count -= 1
    } else {
      await todoStore.toggleLike(todoId.value)
      todoStore.currentTodo.like_count += 1
    }
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'none',
    })
  }
}

/**
 * 发表评论
 */
async function handleCreateComment() {
  if (!checkAuth()) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }

  // 验证输入
  if (!newCommentContent.value.trim()) {
    uni.showToast({
      title: '请输入评论内容',
      icon: 'none',
    })
    return
  }

  try {
    await commentStore.createComment({
      content: newCommentContent.value.trim(),
      todoId: todoId.value,
    })

    // 清空输入
    newCommentContent.value = ''

    // 更新 Todo 的评论数
    if (todoStore.currentTodo) {
      todoStore.currentTodo.commentCount += 1
    }

    uni.showToast({
      title: '评论成功',
      icon: 'success',
    })
  } catch (error) {
    uni.showToast({
      title: '评论失败',
      icon: 'none',
    })
  }
}

/**
 * 删除评论
 */
async function handleDeleteComment(commentId: string) {
  if (!checkAuth()) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }

  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条评论吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await commentStore.deleteComment(commentId, todoId.value)

          // 更新 Todo 的评论数
          if (todoStore.currentTodo) {
            todoStore.currentTodo.commentCount -= 1
          }

          uni.showToast({
            title: '删除成功',
            icon: 'success',
          })
        } catch (error) {
          uni.showToast({
            title: '删除失败',
            icon: 'none',
          })
        }
      }
    },
  })
}

// 页面加载时获取路由参数并加载数据
onMounted(() => {
  // 获取路由参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options as any

  if (options.id) {
    todoId.value = options.id
    loadTodoDetail()
    loadComments()
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
.todo-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.loading {
  text-align: center;
  padding: 80rpx 0;
  font-size: 28rpx;
  color: #999;
}

.error-container {
  padding: 80rpx 24rpx;
}

.detail-container {
  padding: 24rpx;
}

/* Todo 卡片 */
.todo-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.todo-title {
  flex: 1;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  margin-right: 16rpx;
}

.todo-status {
  flex-shrink: 0;
}

.status-badge {
  display: inline-block;
  padding: 8rpx 16rpx;
  font-size: 24rpx;
  border-radius: 8rpx;
  line-height: 1;
}

.status-badge.completed {
  background: #e6f7ff;
  color: #1890ff;
}

.status-badge.pending {
  background: #fff7e6;
  color: #fa8c16;
}

.todo-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 24rpx;
  white-space: pre-wrap;
}

.todo-meta {
  display: flex;
  gap: 24rpx;
  margin-bottom: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.meta-icon {
  font-size: 28rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #999;
}

.todo-operations {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.operation-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 72rpx;
  background: #f7f7f7;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #666;
  line-height: 1;
}

.complete-btn.completed {
  background: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
}

.watch-btn {
  background: #fff1f0;
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.operation-icon {
  font-size: 32rpx;
}

.operation-text {
  font-size: 28rpx;
}

.watchers-section {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.watchers-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 16rpx;
}

.watcher-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 16rpx;
  background: #f7f7f7;
  border-radius: 8rpx;
}

.watcher-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 24rpx;
}

.watcher-avatar-placeholder {
  width: 48rpx;
  height: 48rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.watcher-name {
  font-size: 24rpx;
  color: #666;
}

.todo-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 72rpx;
  background: #f7f7f7;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #666;
  line-height: 1;
}

.like-btn {
  background: #fff;
  border: 1rpx solid #e0e0e0;
}

.like-btn.liked {
  background: #fff1f0;
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.comment-count {
  cursor: default;
}

/* 邀请监督弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 80%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 36rpx;
  color: #999;
  line-height: 1;
}

.modal-body {
  padding: 32rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  background: #f7f7f7;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
}

.modal-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
  line-height: 80rpx;
}

.cancel-btn {
  background: #f7f7f7;
  color: #666;
}

.confirm-btn {
  background: #ff4d4f;
  color: #fff;
}

.action-icon {
  font-size: 32rpx;
}

.action-text {
  font-size: 28rpx;
}

/* 评论区域 */
.comment-section {
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

.comment-input-section {
  margin-bottom: 32rpx;
}

.comment-input {
  width: 100%;
  min-height: 160rpx;
  padding: 20rpx;
  font-size: 28rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
  box-sizing: border-box;
  background: #fafafa;
}

.submit-btn {
  width: 100%;
  height: 72rpx;
  background: #1890ff;
  color: #fff;
  font-size: 28rpx;
  border: none;
  border-radius: 8rpx;
  line-height: 72rpx;
}

.comment-list {
  min-height: 100rpx;
}
</style>
