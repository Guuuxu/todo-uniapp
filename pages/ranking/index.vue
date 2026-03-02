<template>
  <view class="ranking-page">
    <!-- 排序方式切换 -->
    <view class="ranking-tabs">
      <view class="tab-item" :class="{ active: rankingType === 'likes' }" @click="switchRankingType('likes')">
        按点赞数
      </view>
      <view class="tab-item" :class="{ active: rankingType === 'completed' }" @click="switchRankingType('completed')">
        按完成数
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 排行榜列表 -->
    <view v-else-if="rankingList.length > 0" class="ranking-list">
      <view v-for="(todo, index) in rankingList" :key="todo.id" class="ranking-item">
        <view class="ranking-number">{{ index + 1 }}</view>
        <view class="ranking-content">
          <RankItem :todo="todo" :show-actions="false" :ranking-type="rankingType" @click="handleTodoClick" />
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <Empty v-else message="暂无排行榜数据" icon="📊" />
  </view>
</template>

<script setup lang="ts">
/**
 * 排行榜页面
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 8.3
 */

import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/hooks/useAuth'
import { useTodoStore } from '@/stores/todo'
import RankItem from '@/components/RankItem.vue'
import Empty from '@/components/Empty.vue'
import type { Todo } from '@/types/todo'

const { checkAuth } = useAuth()
const todoStore = useTodoStore()

// 加载状态
const loading = ref(false)

// 排行榜类型
const rankingType = computed(() => todoStore.rankingType)

// 排行榜列表
const rankingList = computed(() => todoStore.rankingList)

/**
 * 切换排序方式
 */
async function switchRankingType(type: 'likes' | 'completed') {
  if (rankingType.value === type) return

  loading.value = true
  try {
    await todoStore.fetchRanking(type)
  } catch (error: any) {
    // 未登录时加载失败不显示错误提示（可能是401未授权）
    if (checkAuth()) {
      uni.showToast({
        title: '加载失败',
        icon: 'none',
      })
    }
  } finally {
    loading.value = false
  }
}

/**
 * 点击 Todo 跳转到榜单详情页
 */
function handleTodoClick(id: string) {
  // 找到对应的 todo 获取 userId
  const todo = rankingList.value.find((t: Todo) => t.id === id)
  
  if (!todo) {
    return
  }

  // 检查 userId，可能是 userId 或 user_id
  const userId = (todo as any).userId || (todo as any).user_id
  
  if (!userId) {
    uni.showToast({
      title: '用户信息不存在',
      icon: 'none',
    })
    return
  }

  // 跳转到榜单详情页
  uni.navigateTo({
    url: `/pages/ranking/detail?userId=${userId}`,
  })
}

/**
 * 初始化加载排行榜
 */
onMounted(async () => {
  loading.value = true
  try {
    await todoStore.fetchRanking(rankingType.value)
  } catch (error: any) {
    // 未登录时加载失败不显示错误提示（可能是401未授权）
    if (checkAuth()) {
      uni.showToast({
        title: '加载失败',
        icon: 'none',
      })
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.ranking-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.ranking-tabs {
  display: flex;
  background: #fff;
  border-radius: 12rpx;
  padding: 8rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 28rpx;
  color: #666;
  border-radius: 8rpx;
  transition: all 0.3s;
}

.tab-item.active {
  background: #1890ff;
  color: #fff;
  font-weight: 600;
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

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.ranking-number {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  border-radius: 50%;
  flex-shrink: 0;
}

.ranking-item:nth-child(1) .ranking-number {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.ranking-item:nth-child(2) .ranking-number {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.ranking-item:nth-child(3) .ranking-number {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.ranking-content {
  flex: 1;
}
</style>
