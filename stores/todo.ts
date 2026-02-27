/**
 * Todo 状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/types/todo'
import * as todoApi from '@/api/todo'

export const useTodoStore = defineStore('todo', () => {
  // State
  const todoList = ref<Todo[]>([])
  const currentTodo = ref<Todo | null>(null)
  const rankingList = ref<Todo[]>([])
  const rankingType = ref<'likes' | 'completed'>('likes')

  // Getters
  const completedTodos = computed(() => {
    return todoList.value.filter((todo) => todo.completed)
  })

  const incompleteTodos = computed(() => {
    return todoList.value.filter((todo) => !todo.completed)
  })

  // Actions
  /**
   * 获取 Todo 列表
   */
  async function fetchTodoList(): Promise<void> {
    const list = await todoApi.getTodoList()
    todoList.value = list
  }

  /**
   * 获取 Todo 详情
   */
  async function fetchTodoDetail(id: string): Promise<void> {
    const todo = await todoApi.getTodoDetail(id)
    currentTodo.value = todo
  }

  /**
   * 创建 Todo
   */
  async function createTodo(data: CreateTodoRequest): Promise<Todo> {
    const newTodo = await todoApi.createTodo(data)
    todoList.value.unshift(newTodo)
    return newTodo
  }

  /**
   * 更新 Todo
   */
  async function updateTodo(
    id: string,
    data: UpdateTodoRequest,
  ): Promise<void> {
    const updatedTodo = await todoApi.updateTodo(id, data)

    // 更新列表中的 todo
    const index = todoList.value.findIndex((todo) => todo.id === id)
    if (index !== -1) {
      todoList.value[index] = updatedTodo
    }

    // 更新当前 todo
    if (currentTodo.value?.id === id) {
      currentTodo.value = updatedTodo
    }
  }

  /**
   * 删除 Todo
   */
  async function deleteTodo(id: string): Promise<void> {
    await todoApi.deleteTodo(id)

    // 从列表中移除
    const index = todoList.value.findIndex((todo) => todo.id === id)
    if (index !== -1) {
      todoList.value.splice(index, 1)
    }

    // 清除当前 todo
    if (currentTodo.value?.id === id) {
      currentTodo.value = null
    }
  }

  /**
   * 切换点赞状态
   */
  async function toggleLike(id: string): Promise<void> {
    const result = await todoApi.toggleLike(id)

    // 更新列表中的 todo
    const todoInList = todoList.value.find((todo) => todo.id === id)
    if (todoInList) {
      todoInList.likes = result.likes
      todoInList.is_liked = result.is_liked
      // 同时更新 like_count 字段（前端使用的字段名）
      ;(todoInList as any).like_count = result.likes
    }

    // 更新当前 todo
    if (currentTodo.value?.id === id) {
      currentTodo.value.likes = result.likes
      currentTodo.value.is_liked = result.is_liked
      // 同时更新 like_count 字段（前端使用的字段名）
      ;(currentTodo.value as any).like_count = result.likes
    }
  }

  /**
   * 取消点赞
   */
  async function cancelLike(id: string): Promise<void> {
    const result = await todoApi.cancelLike(id)

    // 更新列表中的 todo
    const todoInList = todoList.value.find((todo) => todo.id === id)
    if (todoInList) {
      todoInList.likes = result.likes
      todoInList.is_liked = result.is_liked
      // 同时更新 like_count 字段（前端使用的字段名）
      ;(todoInList as any).like_count = result.likes
    }

    // 更新当前 todo
    if (currentTodo.value?.id === id) {
      currentTodo.value.likes = result.likes
      currentTodo.value.is_liked = result.is_liked
      // 同时更新 like_count 字段（前端使用的字段名）
      ;(currentTodo.value as any).like_count = result.likes
    }
  }

  /**
   * 获取排行榜
   */
  async function fetchRanking(
    type: 'likes' | 'completed' = 'likes',
  ): Promise<void> {
    rankingType.value = type
    const list = await todoApi.getRanking(type)
    rankingList.value = list
  }

  return {
    // State
    todoList,
    currentTodo,
    rankingList,
    rankingType,
    // Getters
    completedTodos,
    incompleteTodos,
    // Actions
    fetchTodoList,
    fetchTodoDetail,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleLike,
    cancelLike,
    fetchRanking,
  }
})
