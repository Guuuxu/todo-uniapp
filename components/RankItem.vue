<template>
  <view class="todo-item" @click="handleClick">
    <view class="todo-header">
      <view class="todo-title">{{ todo.username }}</view>
      <view v-if="showActions" class="todo-actions">
        <button class="delete-btn" @click.stop="handleDelete">删除</button>
      </view>
    </view>
    <view class="todo-content">{{ todo.content }}</view>
    <view class="todo-footer">
      <view class="todo-stats">
        <view v-if="rankingType !== 'completed'" class="stat-item">
          <text class="stat-icon">👍</text>
          <text class="stat-text">{{ todo.total_likes || todo.like_count }}</text>
        </view>
        <view v-if="rankingType === 'completed'" class="stat-item">
          <text class="stat-icon">✅</text>
          <text class="stat-text">{{ todo.completed ? '已完成' : '进行中' }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-icon">💬</text>
          <text class="stat-text">{{ todo.total_comments }}</text>
        </view>
      </view>
      <view v-if="todo.completed && rankingType !== 'completed'" class="todo-status">✅ 已完成</view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * Todo 项组件
 * Requirements: 2.2
 */

import type { Todo } from '@/types/todo'

const props = defineProps<{
  todo: Todo
  showActions?: boolean
  rankingType?: 'likes' | 'completed'
}>()

// 解构 props 并设置默认值
const { showActions = true, rankingType } = props

const emit = defineEmits<{
  delete: []
  click: [id: string]
}>()

const handleClick = () => {
  emit('click', props.todo.id)
}

const handleDelete = () => {
  emit('delete')
}
</script>

<style scoped>
.todo-item {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.todo-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.todo-actions {
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

.todo-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16rpx;
}

.todo-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.todo-stats {
  display: flex;
  gap: 24rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.stat-icon {
  font-size: 28rpx;
}

.stat-text {
  font-size: 24rpx;
}

.todo-status {
  font-size: 24rpx;
  color: #52c41a;
}
</style>
