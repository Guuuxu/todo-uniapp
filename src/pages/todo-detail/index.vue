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
            <text
              :class="[
                'status-badge',
                todoStore.currentTodo.completed ? 'completed' : 'pending',
              ]"
            >
              {{ todoStore.currentTodo.completed ? '已完成' : '进行中' }}
            </text>
          </view>
        </view>
        <view class="todo-content">{{ todoStore.currentTodo.content }}</view>
        <view class="todo-meta">
          <view class="meta-item">
            <text class="meta-icon">📅</text>
            <text class="meta-text">{{ formattedDate }}</text>
          </view>
        </view>

        <!-- 点赞和评论统计 -->
        <view class="todo-actions">
          <button
            :class="[
              'action-btn',
              'like-btn',
              todoStore.currentTodo.isLiked ? 'liked' : '',
            ]"
            @click="handleToggleLike"
          >
            <text class="action-icon">{{
              todoStore.currentTodo.isLiked ? '❤️' : '🤍'
            }}</text>
            <text class="action-text">{{ todoStore.currentTodo.likes }}</text>
          </button>
          <view class="action-btn comment-count">
            <text class="action-icon">💬</text>
            <text class="action-text">{{
              todoStore.currentTodo.commentCount
            }}</text>
          </view>
        </view>
      </view>

      <!-- 评论区域 -->
      <view class="comment-section">
        <view class="section-title">评论 ({{ commentList.length }})</view>

        <!-- 发表评论 -->
        <view class="comment-input-section">
          <textarea
            v-model="newCommentContent"
            class="comment-input"
            placeholder="写下你的评论..."
            :maxlength="500"
          />
          <button class="submit-btn" @click="handleCreateComment">发表</button>
        </view>

        <!-- 评论列表 -->
        <view class="comment-list">
          <template v-if="commentList.length > 0">
            <CommentItem
              v-for="comment in commentList"
              :key="comment.id"
              :comment="comment"
              :can-delete="canDeleteComment(comment)"
              @delete="handleDeleteComment(comment.id)"
            />
          </template>
          <Empty v-else message="暂无评论，快来抢沙发吧！" icon="💬" />
        </view>
      </view>
    </view>

    <!-- 错误状态 -->
    <view v-else class="error-container">
      <Empty message="Todo 不存在或已被删除" icon="❌" />
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
import { formatDate } from '@/utils/format'

// 使用 hooks 和 stores
const { requireAuth, userInfo } = useAuth()
const todoStore = useTodoStore()
const commentStore = useCommentStore()

// 状态
const loading = ref(false)
const todoId = ref('')
const newCommentContent = ref('')

// 计算属性
const commentList = computed(() => {
  return commentStore.getCommentsByTodoId(todoId.value)
})

const formattedDate = computed(() => {
  if (!todoStore.currentTodo) return ''
  return formatDate(todoStore.currentTodo.createdAt, 'YYYY-MM-DD HH:mm')
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
  try {
    await todoStore.toggleLike(todoId.value)
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
  if (requireAuth()) {
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

.todo-actions {
  display: flex;
  gap: 16rpx;
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
