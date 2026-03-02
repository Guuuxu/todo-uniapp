<template>
  <view class="home-page">
    <!-- 创建 Todo 区域 -->
    <view class="create-section">
      <input
        v-model="newTodoTitle"
        class="todo-input"
        placeholder="输入 Todo 标题"
        :maxlength="50"
      />
      <textarea
        v-model="newTodoContent"
        class="todo-textarea"
        placeholder="输入 Todo 内容"
        :maxlength="500"
      />
      <button class="create-btn" @click="handleCreate">创建 Todo</button>
    </view>

    <!-- Todo 列表 -->
    <view class="todo-list">
      <view v-if="loading" class="loading">加载中...</view>
      <template v-else-if="todoStore.todoList.length > 0">
        <TodoItem
          v-for="todo in todoStore.todoList"
          :key="todo.id"
          :todo="todo"
          :show-actions="true"
          :can-complete="true"
          @click="handleTodoClick(todo.id)"
          @delete="handleDelete(todo.id)"
          @complete="handleComplete(todo.id, $event)"
        />
      </template>
      <Empty v-else message="暂无 Todo，快来创建一个吧！" icon="📝" />
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 首页 - Todo 列表
 * Requirements: 2.1, 2.2, 2.5, 8.1
 */

import { ref, onMounted } from 'vue'
import { useAuth } from '@/hooks/useAuth'
import { useTodoStore } from '@/stores/todo'
import TodoItem from '@/components/TodoItem.vue'
import Empty from '@/components/Empty.vue'

// 使用 hooks 和 stores
const { checkAuth } = useAuth()
const todoStore = useTodoStore()

// 状态
const loading = ref(false)
const newTodoTitle = ref('')
const newTodoContent = ref('')

/**
 * 加载 Todo 列表
 */
async function loadTodoList() {
  loading.value = true
  try {
    await todoStore.fetchTodoList()
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
 * 创建 Todo
 */
async function handleCreate() {
  if (!checkAuth()) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }

  // 验证输入
  if (!newTodoTitle.value.trim()) {
    uni.showToast({
      title: '请输入标题',
      icon: 'none',
    })
    return
  }

  if (!newTodoContent.value.trim()) {
    uni.showToast({
      title: '请输入内容',
      icon: 'none',
    })
    return
  }

  try {
    await todoStore.createTodo({
      title: newTodoTitle.value.trim(),
      content: newTodoContent.value.trim(),
    })

    // 清空输入
    newTodoTitle.value = ''
    newTodoContent.value = ''

    uni.showToast({
      title: '创建成功',
      icon: 'success',
    })
  } catch (error) {
    uni.showToast({
      title: '创建失败',
      icon: 'none',
    })
  }
}

/**
 * 删除 Todo
 */
async function handleDelete(id: string) {
  if (!checkAuth()) {
    uni.showToast({
      title: '请先登录',
      icon: 'none',
    })
    return
  }

  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个 Todo 吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await todoStore.deleteTodo(id)
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
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'none',
    })
  }
}

/**
 * 点击 Todo，跳转到详情页
 */
function handleTodoClick(id: string) {
  uni.navigateTo({
    url: `/pages/todo-detail/index?id=${id}`,
  })
}

// 页面加载时加载列表（未登录也可以查看）
onMounted(() => {
  loadTodoList()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
}

.create-section {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.todo-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
  box-sizing: border-box;
}

.todo-textarea {
  width: 100%;
  min-height: 160rpx;
  padding: 20rpx;
  font-size: 28rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
  box-sizing: border-box;
}

.create-btn {
  width: 100%;
  height: 80rpx;
  background: #1890ff;
  color: #fff;
  font-size: 28rpx;
  border: none;
  border-radius: 8rpx;
  line-height: 80rpx;
}

.todo-list {
  min-height: 200rpx;
}

.loading {
  text-align: center;
  padding: 80rpx 0;
  font-size: 28rpx;
  color: #999;
}
</style>
