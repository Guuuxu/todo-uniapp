/**
 * 评论相关 API
 */

import request from './request'
import type { Comment, CreateCommentRequest } from '@/types/comment'

/**
 * 获取评论列表
 */
export function getComments(todoId: string): Promise<Comment[]> {
  return request({
    url: `/comment/list/${todoId}`,
    method: 'GET',
  })
}

/**
 * 创建评论
 */
export function createComment(data: CreateCommentRequest): Promise<Comment> {
  return request({
    url: '/comment',
    method: 'POST',
    data,
  })
}

/**
 * 删除评论
 */
export function deleteComment(id: string): Promise<void> {
  return request({
    url: `/comment/${id}`,
    method: 'DELETE',
  })
}
