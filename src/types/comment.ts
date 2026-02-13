/**
 * 评论接口定义
 */

import type { UserInfo } from './user'

// 评论对象
export interface Comment {
  id: string
  content: string
  todoId: string
  userId: string
  user: UserInfo
  createdAt: string
}

// 创建评论请求
export interface CreateCommentRequest {
  content: string
  todoId: string
}
