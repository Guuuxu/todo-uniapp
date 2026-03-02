<template>
  <view class="watching-page">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 我监督的Todo列表 -->
    <view v-else-if="todoList.length > 0" class="todo-list">
      <TodoItem
        v-for="todo in todoList"
        :key="todo.id"
        :todo="todo"
        :show-actions="false"
        :can-complete="true"
        @click="handleTodoClick(todo.id)"
        @complete="handleComplete(todo.id, $event)"
      />
    </view>

    <!-- 空状态 -->
    <Empty v-else message="暂无监督的Todo" icon="👁️" />
  </view>
</template>

<script setup lang="ts">
/**
 * 我监督的Todo页面
 */

import { ref, onMounted } from 'vue'
import { useAuth } from '@/hooks/useAuth'
import { useTodoStore } from '@/stores/todo'
import TodoItem from '@/components/TodoItem.vue'
import Empty from '@/components/Empty.vue'
import * as todoApi from '@/api/todo'

const { checkAuth } = useAuth()
const todoStore = useTodoStore()

// 状态
const loading = ref(false)
const todoList = ref<any[]>([])

/**
 * 加载我监督的Todo列表
 */
async function loadWatchingTodos() {
  if (!checkAuth()) {
    return
  }

  loading.value = true
  try {
    console.log('[TODO_DEBUG] 开始加载我监督的Todo列表')
    const todos = await todoApi.getWatchingTodos()
    console.log('[TODO_DEBUG] 获取到的Todo列表:', todos)
    todoList.value = todos
  } catch (error: any) {
    console.log('[TODO_DEBUG] 加载失败:', error)
    // 如果是404错误，可能是接口未实现，不显示错误提示，显示空状态
    if (error.message && error.message.includes('404') || error.message.includes('不存在')) {
      console.log('[TODO_DEBUG] 接口可能未实现，显示空状态')
      todoList.value = []
    } else {
      uni.showToast({
        title: error.message || '加载失败',
        icon: 'none',
      })
    }
  } finally {
    loading.value = false
  }
}

/**
 * 切换完成状态
 */
async function handleComplete(id: string, completed: boolean) {
  try {
    await todoStore.updateTodo(id, { completed })
    uni.showToast({
      title: completed ? '标记为已完成' : '标记为未完成',
      icon: 'success',
    })
    // 重新加载列表
    await loadWatchingTodos()
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'none',
    })
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

// 页面加载时加载数据
onMounted(() => {
  loadWatchingTodos()
})
</script>

<style scoped>
.watching-page {
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

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
</style>

