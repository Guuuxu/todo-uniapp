/**
 * Todo 接口定义
 */

// Todo 对象
export interface Todo {
  id: string
  title: string
  content: string
  completed: boolean
  likes: number
  isLiked: boolean
  commentCount: number
  userId: string
  createdAt: string
  updatedAt: string
}

// 创建 Todo 请求
export interface CreateTodoRequest {
  title: string
  content: string
}

// 更新 Todo 请求
export interface UpdateTodoRequest {
  title?: string
  content?: string
  completed?: boolean
}
