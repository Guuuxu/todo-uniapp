<template>
  <view class="todo-item" @click="handleClick">
    <view class="todo-header">
      <view class="todo-title" :class="{ completed: todo.completed }">{{ todo.title }}</view>
      <view v-if="showActions || canComplete" class="todo-actions">
        <button v-if="canComplete" :class="['complete-btn', todo.completed ? 'completed' : '']" @click.stop="handleComplete">
          {{ todo.completed ? '✅ 已完成' : '⭕ 未完成' }}
        </button>
        <button v-if="showActions" class="delete-btn" @click.stop="handleDelete">删除</button>
      </view>
    </view>
    <view class="todo-content">{{ todo.description }}</view>
    <view class="todo-footer">
      <view class="todo-stats">
        <view v-if="rankingType !== 'completed'" class="stat-item">
          <text class="stat-icon">👍</text>
          <text class="stat-text">{{ todo.like_count }}</text>
        </view>
        <view v-if="rankingType === 'completed'" class="stat-item">
          <text class="stat-icon">✅</text>
          <text class="stat-text">{{ todo.completed ? '已完成' : '进行中' }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-icon">💬</text>
          <text class="stat-text">{{ todo.comment_count }}</text>
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
  canComplete?: boolean
}>()

// 解构 props 并设置默认值
const { showActions = true, rankingType, canComplete = false } = props

const emit = defineEmits<{
  delete: []
  click: []
  complete: [completed: boolean]
}>()

const handleClick = () => {
  emit('click')
}

const handleDelete = () => {
  emit('delete')
}

const handleComplete = () => {
  emit('complete', !props.todo.completed)
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

.todo-title.completed {
  text-decoration: line-through;
  color: #999;
  opacity: 0.7;
}

.todo-actions {
  margin-left: 16rpx;
}

.complete-btn {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  background: #f0f0f0;
  color: #666;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  line-height: 1;
  margin-right: 8rpx;
}

.complete-btn.completed {
  background: #e6f7ff;
  color: #1890ff;
  border-color: #1890ff;
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
