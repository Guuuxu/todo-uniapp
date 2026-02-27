/**
 * Todo 相关 API
 */

import request from './request'
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/types/todo'

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
