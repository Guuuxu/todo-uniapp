/**
 * Todo 相关 API
 */

import request from './request'
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/types/todo'
import type { UserInfo } from '@/types/user'

/**
 * 获取 Todo 列表
 */
export function getTodoList(): Promise<Todo[]> {
  return request({
    url: '/todos/list',
    method: 'GET',
  })
}

/**
 * 获取 Todo 详情
 */
export function getTodoDetail(id: string): Promise<Todo> {
  return request({
    url: `/todos/${id}`,
    method: 'GET',
  })
}

/**
 * 创建 Todo
 */
export function createTodo(data: CreateTodoRequest): Promise<Todo> {
  return request({
    url: '/todos',
    method: 'POST',
    data,
  })
}

/**
 * 更新 Todo
 */
export function updateTodo(id: string, data: UpdateTodoRequest): Promise<Todo> {
  return request({
    url: `/todos/${id}`,
    method: 'PUT',
    data,
  })
}

/**
 * 完成
 */
export function completeTodo(id: string): Promise<Todo> {
  return request({
    url: `/todos/${id}/complete`,
    method: 'POST',
  })
}

/**
 * 删除 Todo
 */
export function deleteTodo(id: string): Promise<void> {
  return request({
    url: `/todos/${id}`,
    method: 'DELETE',
  })
}

/**
 * 切换点赞状态
 */
export function toggleLike(
  id: string,
): Promise<{ likes: number; is_liked: boolean }> {
  return request({
    url: `/todos/${id}/like`,
    method: 'POST',
  })
}

/**
 * 取消点赞
 */
export function cancelLike(id: string): Promise<{ likes: number; is_liked: boolean }> {
  return request({
    url: `/todos/${id}/like`,
    method: 'DELETE',
  })
}
/**
 * 获取排行榜
 * @param type - 排序类型：'likes' 按点赞数，'completed' 按完成数
 */
export function getRanking(
  type: 'likes' | 'completed' = 'likes',
): Promise<Todo[]> {
  return request({
    url: '/rankings',
    method: 'GET',
    params: { type },
  })
}

/**
 * 获取指定用户的待办事项列表
 * @param userId - 用户 ID
 */
export function getUserTodos(userId: string): Promise<Todo[]> {
  return request({
    url: `/users/${userId}/todos`,
    method: 'GET',
  })
}

/**
 * 邀请监督
 * @param todoId - Todo ID
 * @param userId - 被邀请的用户ID（可选，如果不传则邀请当前用户）
 */
export function inviteWatch(todoId: string, userId?: string): Promise<void> {
  return request({
    url: `/todos/${todoId}/watch`,
    method: 'POST',
    data: userId ? { userId } : undefined,
  })
}

/**
 * 获取我监督的Todo列表
 */
export function getWatchingTodos() {
  console.log('[TODO_DEBUG] 请求路径: /todos/watching')
  return request({
    url: '/todos/watching',
    method: 'GET',
  })
}

/**
 * 查看Todo的监督人列表
 * @param todoId - Todo ID
 */
export function getTodoWatchers(todoId: string): Promise<UserInfo[]> {
  return request({
    url: `/todos/${todoId}/watchers`,
    method: 'GET',
  })
}
