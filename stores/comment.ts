/**
 * 评论状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Comment, CreateCommentRequest } from '@/types/comment'
import * as commentApi from '@/api/comment'

export const useCommentStore = defineStore('comment', () => {
  // State - 按 todoId 索引的评论列表
  const comments = ref<Record<string, Comment[]>>({})

  // Getters
  /**
   * 根据 todoId 获取评论列表
   */
  const getCommentsByTodoId = computed(() => {
    return (todoId: string): Comment[] => {
      return comments.value[todoId] || []
    }
  })

  // Actions
  /**
   * 获取评论列表
   */
  async function fetchComments(todoId: string): Promise<void> {
    const list = await commentApi.getComments(todoId)
    comments.value[todoId] = list
  }

  /**
   * 创建评论
   */
  async function createComment(data: CreateCommentRequest): Promise<Comment> {
    const newComment = await commentApi.createComment(data)

    // 添加到对应 todoId 的评论列表
    const todoId = data.todoId
    if (!comments.value[todoId]) {
      comments.value[todoId] = []
    }
    comments.value[todoId].unshift(newComment)

    return newComment
  }

  /**
   * 删除评论
   */
  async function deleteComment(id: string, todoId: string): Promise<void> {
    await commentApi.deleteComment(id)

    // 从对应 todoId 的评论列表中移除
    if (comments.value[todoId]) {
      const index = comments.value[todoId].findIndex(
        (comment) => comment.id === id,
      )
      if (index !== -1) {
        comments.value[todoId].splice(index, 1)
      }
    }
  }

  return {
    // State
    comments,
    // Getters
    getCommentsByTodoId,
    // Actions
    fetchComments,
    createComment,
    deleteComment,
  }
})
