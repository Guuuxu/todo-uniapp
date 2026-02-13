/**
 * Test helper functions and generators for property-based testing with fast-check
 */

import * as fc from 'fast-check'
import type { UserInfo, LoginRequest } from '@/types/user'
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/types/todo'
import type { Comment, CreateCommentRequest } from '@/types/comment'

// ============ Primitive Generators ============

/**
 * Generate a non-empty string
 */
export const nonEmptyString = () => fc.string({ minLength: 1, maxLength: 100 })

/**
 * Generate a valid username (alphanumeric, 3-20 chars)
 */
export const username = () => fc.stringMatching(/^[a-zA-Z0-9_]{3,20}$/)

/**
 * Generate a valid password (6-50 chars)
 */
export const password = () => fc.string({ minLength: 6, maxLength: 50 })

/**
 * Generate a UUID-like string
 */
export const uuid = () => fc.uuid()

/**
 * Generate an ISO date string
 */
export const isoDateString = () => fc.date().map((d) => d.toISOString())

/**
 * Generate a token string
 */
export const token = () => fc.hexaString({ minLength: 32, maxLength: 64 })

// ============ User Generators ============

/**
 * Generate a UserInfo object
 */
export const userInfo = (): fc.Arbitrary<UserInfo> =>
  fc.record({
    id: uuid(),
    username: username(),
    avatar: fc.option(fc.webUrl(), { nil: undefined }),
    createdAt: isoDateString(),
  })

/**
 * Generate a LoginRequest object
 */
export const loginRequest = (): fc.Arbitrary<LoginRequest> =>
  fc.record({
    username: username(),
    password: password(),
  })

/**
 * Generate an invalid LoginRequest (empty credentials)
 */
export const invalidLoginRequest = (): fc.Arbitrary<LoginRequest> =>
  fc.record({
    username: fc.constantFrom('', '  ', '\t\n'),
    password: fc.constantFrom('', '  ', '\t\n'),
  })

// ============ Todo Generators ============

/**
 * Generate a Todo object
 */
export const todo = (): fc.Arbitrary<Todo> =>
  fc.record({
    id: uuid(),
    title: nonEmptyString(),
    content: nonEmptyString(),
    completed: fc.boolean(),
    likes: fc.nat({ max: 10000 }),
    isLiked: fc.boolean(),
    commentCount: fc.nat({ max: 1000 }),
    userId: uuid(),
    createdAt: isoDateString(),
    updatedAt: isoDateString(),
  })

/**
 * Generate a CreateTodoRequest object
 */
export const createTodoRequest = (): fc.Arbitrary<CreateTodoRequest> =>
  fc.record({
    title: nonEmptyString(),
    content: nonEmptyString(),
  })

/**
 * Generate an invalid CreateTodoRequest (empty or whitespace)
 */
export const invalidCreateTodoRequest = (): fc.Arbitrary<CreateTodoRequest> =>
  fc.record({
    title: fc.constantFrom('', '  ', '\t\n'),
    content: fc.constantFrom('', '  ', '\t\n'),
  })

/**
 * Generate an UpdateTodoRequest object
 */
export const updateTodoRequest = (): fc.Arbitrary<UpdateTodoRequest> =>
  fc.record({
    title: fc.option(nonEmptyString(), { nil: undefined }),
    content: fc.option(nonEmptyString(), { nil: undefined }),
    completed: fc.option(fc.boolean(), { nil: undefined }),
  })

/**
 * Generate a list of Todos
 */
export const todoList = (minLength = 0, maxLength = 20): fc.Arbitrary<Todo[]> =>
  fc.array(todo(), { minLength, maxLength })

// ============ Comment Generators ============

/**
 * Generate a Comment object
 */
export const comment = (): fc.Arbitrary<Comment> =>
  fc.record({
    id: uuid(),
    content: nonEmptyString(),
    todoId: uuid(),
    userId: uuid(),
    user: userInfo(),
    createdAt: isoDateString(),
  })

/**
 * Generate a CreateCommentRequest object
 */
export const createCommentRequest = (): fc.Arbitrary<CreateCommentRequest> =>
  fc.record({
    content: nonEmptyString(),
    todoId: uuid(),
  })

/**
 * Generate an invalid CreateCommentRequest (empty or whitespace)
 */
export const invalidCreateCommentRequest =
  (): fc.Arbitrary<CreateCommentRequest> =>
    fc.record({
      content: fc.constantFrom('', '  ', '\t\n'),
      todoId: uuid(),
    })

/**
 * Generate a list of Comments
 */
export const commentList = (
  minLength = 0,
  maxLength = 50,
): fc.Arbitrary<Comment[]> => fc.array(comment(), { minLength, maxLength })

// ============ Helper Functions ============

/**
 * Check if a string is empty or only whitespace
 */
export const isEmptyOrWhitespace = (str: string): boolean => {
  return str.trim().length === 0
}

/**
 * Sort todos by likes in descending order
 */
export const sortByLikes = (todos: Todo[]): Todo[] => {
  return [...todos].sort((a, b) => b.likes - a.likes)
}

/**
 * Sort todos by completion count (for ranking)
 */
export const sortByCompletion = (todos: Todo[]): Todo[] => {
  return [...todos].sort((a, b) => {
    const aCompleted = a.completed ? 1 : 0
    const bCompleted = b.completed ? 1 : 0
    return bCompleted - aCompleted
  })
}

/**
 * Filter completed todos
 */
export const filterCompleted = (todos: Todo[]): Todo[] => {
  return todos.filter((t) => t.completed)
}

/**
 * Filter incomplete todos
 */
export const filterIncomplete = (todos: Todo[]): Todo[] => {
  return todos.filter((t) => !t.completed)
}
