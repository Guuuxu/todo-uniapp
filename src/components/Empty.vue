<template>
  <view class="empty-container">
    <view class="empty-icon">{{ icon }}</view>
    <view class="empty-message">{{ message }}</view>
  </view>
</template>

<script setup lang="ts">
/**
 * 空状态组件
 * Requirements: 8.1, 8.2, 8.3
 */

interface Props {
  message?: string
  icon?: string
}

withDefaults(defineProps<Props>(), {
  message: '暂无数据',
  icon: '📭',
})
</script>

<style scoped>
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  color: #999;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-message {
  font-size: 28rpx;
  text-align: center;
}
</style>
