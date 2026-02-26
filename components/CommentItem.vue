<template>
  <view class="comment-item">
    <view class="comment-header">
      <view class="user-info">
        <view v-if="comment.avatar" class="user-avatar">
          <image :src="comment.avatar" mode="aspectFill" />
        </view>
        <view v-else class="user-avatar-placeholder">
          {{ comment.username.charAt(0).toUpperCase() }}
        </view>
        <view class="user-details">
          <view class="user-name">{{ comment.username }}</view>
          <view class="comment-time">{{ formattedTime }}</view>
        </view>
      </view>
      <view v-if="canDelete" class="comment-actions">
        <button class="delete-btn" @click="handleDelete">删除</button>
      </view>
    </view>
    <view class="comment-content">{{ comment.content }}</view>
  </view>
</template>

<script setup lang="ts">
/**
 * 评论项组件
 * Requirements: 4.2
 */

import { computed } from 'vue'
import type { Comment } from '@/types/comment'
import { formatDate, formatTime } from '@/utils/format'

const props = defineProps<{
  comment: Comment
  canDelete?: boolean
}>()

// 解构 props 并设置默认值
const { canDelete = false } = props

const emit = defineEmits<{
  delete: []
}>()

const formattedTime = computed(() => {
  const date = formatDate(props.comment.created_at, 'YYYY-MM-DD')
  const time = formatTime(props.comment.created_at, 'HH:mm')
  return `${date} ${time}`
})

const handleDelete = () => {
  emit('delete')
}
</script>

<style scoped>
.comment-item {
  background: #f7f7f7;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.user-avatar,
.user-avatar-placeholder {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  overflow: hidden;
}

.user-avatar image {
  width: 100%;
  height: 100%;
}

.user-avatar-placeholder {
  background: #1890ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 4rpx;
}

.comment-time {
  font-size: 24rpx;
  color: #999;
}

.comment-actions {
  margin-left: 16rpx;
}

.delete-btn {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  background: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  line-height: 1;
}

.comment-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}
</style>
