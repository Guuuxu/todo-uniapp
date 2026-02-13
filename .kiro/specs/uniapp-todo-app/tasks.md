# Implementation Plan

- [x] 1. 初始化项目结构和配置
  - 使用 UniApp CLI 创建 Vue3 + TypeScript 项目
  - 配置 Vite 构建工具
  - 安装依赖：Pinia、Axios、fast-check、Vitest
  - 创建目录结构：pages、components、api、stores、hooks、utils、types
  - 配置 pages.json 路由
  - 配置 TypeScript tsconfig.json
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 2. 实现类型定义
  - [x] 2.1 创建 types/user.ts
    - 定义 User、UserInfo、LoginRequest、LoginResponse 接口
    - _Requirements: 1.1, 1.2, 6.1_

  - [x] 2.2 创建 types/todo.ts
    - 定义 Todo、CreateTodoRequest、UpdateTodoRequest 接口
    - _Requirements: 2.1, 2.4_

  - [x] 2.3 创建 types/comment.ts
    - 定义 Comment、CreateCommentRequest 接口
    - _Requirements: 4.1_

  - [x] 2.4 创建 types/api.ts
    - 定义 ApiResponse 通用响应接口
    - _Requirements: 7.4_

- [x] 3. 实现工具函数
  - [x] 3.1 实现 utils/storage.ts
    - 实现 setToken、getToken、removeToken 方法
    - 实现 setUserInfo、getUserInfo、removeUserInfo 方法
    - _Requirements: 1.3, 10.1_

  - [ ]\* 3.2 编写 storage 的属性测试
    - **Property 3: Token storage round-trip**
    - **Validates: Requirements 1.3, 10.1**
  - [x] 3.3 实现 utils/format.ts
    - 实现 formatDate、formatTime、formatNumber 方法
    - _Requirements: 通用工具_

- [x] 4. 实现 API 请求层
  - [x] 4.1 实现 api/request.ts
    - 创建 Axios 实例，配置 baseURL 和 timeout
    - 实现请求拦截器：读取 token，添加 Authorization header
    - 实现响应拦截器：处理成功响应、401 错误、其他错误
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]\* 4.2 编写请求拦截器的属性测试
    - **Property 24: Requests include auth token**
    - **Validates: Requirements 7.1**
  - [ ]\* 4.3 编写响应拦截器的属性测试
    - **Property 25: 401 response clears token**
    - **Property 27: Successful responses return data**
    - **Property 28: Failed requests are handled uniformly**
    - **Validates: Requirements 7.2, 7.4, 7.5**
  - [x] 4.4 实现 api/user.ts
    - 实现 login、register、getUserInfo、updateUserInfo 方法
    - _Requirements: 1.1, 1.2, 6.1, 6.4_

  - [x] 4.5 实现 api/todo.ts
    - 实现 getTodoList、getTodoDetail、createTodo、updateTodo、deleteTodo 方法
    - 实现 toggleLike、getRanking 方法
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 3.1, 3.2, 5.1, 5.2, 5.3_

  - [x] 4.6 实现 api/comment.ts
    - 实现 getComments、createComment、deleteComment 方法
    - _Requirements: 4.1, 4.2, 4.4_

- [-] 5. 实现 Pinia Stores
  - [x] 5.1 实现 stores/user.ts
    - 定义 UserState：token、userInfo、isLoggedIn
    - 实现 login action：调用 API，保存 token 和用户信息
    - 实现 register action
    - 实现 logout action：清除 token，跳转登录页
    - 实现 fetchUserInfo、updateUserInfo actions
    - 实现 isAuthenticated getter
    - _Requirements: 1.1, 1.2, 1.3, 6.2, 6.4_

  - [ ]\* 5.2 编写用户认证的属性测试
    - **Property 1: Valid login returns token**
    - **Property 2: Valid registration creates user and returns token**
    - **Property 4: Empty credentials are rejected**
    - **Property 6: Logout clears token**
    - **Validates: Requirements 1.1, 1.2, 1.4, 6.2**
  - [x] 5.3 实现 stores/todo.ts
    - 定义 TodoState：todoList、currentTodo、rankingList、rankingType
    - 实现 fetchTodoList、fetchTodoDetail、createTodo、updateTodo、deleteTodo actions
    - 实现 toggleLike、fetchRanking actions
    - 实现 completedTodos、incompleteTodos getters
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 3.1, 3.2, 5.1, 5.2, 5.3_

  - [ ]\* 5.4 编写 Todo 管理的属性测试
    - **Property 9: Creating todo increases list length**
    - **Property 10: Todo list returns all user todos**
    - **Property 11: Updating todo preserves identity**
    - **Property 12: Deleting todo removes from list**
    - **Validates: Requirements 2.1, 2.2, 2.4, 2.5**
  - [ ]\* 5.5 编写点赞系统的属性测试
    - **Property 14: Like increases count by one**
    - **Property 15: Like then unlike is identity**
    - **Property 16: Like state is persisted**
    - **Validates: Requirements 3.1, 3.2, 3.4**
  - [x] 5.6 实现 stores/comment.ts
    - 定义 CommentState：comments（按 todoId 索引）
    - 实现 fetchComments、createComment、deleteComment actions
    - 实现 getCommentsByTodoId getter
    - _Requirements: 4.1, 4.2, 4.4_

  - [ ]\* 5.7 编写评论系统的属性测试
    - **Property 17: Creating comment increases list length**
    - **Property 18: Comment list returns all todo comments**
    - **Property 19: Empty comments are rejected**
    - **Property 20: Deleting comment removes from list**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [x] 6. 实现 Hooks
  - [x] 6.1 实现 hooks/useAuth.ts
    - 实现 checkAuth：检查是否已登录
    - 实现 requireAuth：要求登录，未登录则跳转
    - 实现 logout：调用 store 的 logout
    - 返回 isLoggedIn、userInfo 计算属性
    - _Requirements: 1.5, 6.2_

  - [ ]\* 6.2 编写 useAuth 的属性测试
    - **Property 5: Valid token grants access**
    - **Property 7: Token restoration on app restart**
    - **Property 8: Invalid token is cleared**
    - **Validates: Requirements 1.5, 10.2, 10.3, 10.4**

- [x] 7. 实现通用组件
  - [x] 7.1 实现 components/Empty.vue
    - 接收 message 和 icon props
    - 显示空状态提示
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 7.2 实现 components/TodoItem.vue
    - 接收 todo prop 和 showActions prop
    - 显示 todo 标题、内容、点赞数、评论数
    - 触发 delete 和 click 事件
    - _Requirements: 2.2_

  - [x] 7.3 实现 components/CommentItem.vue
    - 接收 comment prop 和 canDelete prop
    - 显示评论内容、用户信息、时间
    - 触发 delete 事件
    - _Requirements: 4.2_

- [x] 8. 实现登录注册页面
  - [x] 8.1 实现 pages/login/index.vue
    - 创建登录/注册表单
    - 实现表单验证（用户名、密码非空）
    - 实现登录/注册切换
    - 调用 userStore.login 或 userStore.register
    - 成功后跳转到首页
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ]\* 8.2 编写登录页面的单元测试
    - 测试表单验证
    - 测试登录/注册切换
    - 测试成功跳转

- [x] 9. 实现首页 Todo 列表
  - [x] 9.1 实现 pages/home/index.vue
    - 使用 useAuth 检查登录状态
    - 调用 todoStore.fetchTodoList 加载列表
    - 使用 TodoItem 组件显示列表
    - 实现创建 Todo 功能（输入框 + 按钮）
    - 实现删除 Todo 功能
    - 点击 Todo 跳转到详情页
    - 空列表显示 Empty 组件
    - _Requirements: 2.1, 2.2, 2.5, 8.1_

  - [ ]\* 9.2 编写首页的单元测试
    - 测试列表加载
    - 测试创建功能
    - 测试删除功能
    - 测试空状态显示

- [x] 10. 实现 Todo 详情页
  - [x] 10.1 实现 pages/todo-detail/index.vue
    - 从路由参数获取 todoId
    - 调用 todoStore.fetchTodoDetail 加载详情
    - 显示 Todo 完整信息
    - 实现点赞/取消点赞功能
    - 调用 commentStore.fetchComments 加载评论
    - 使用 CommentItem 组件显示评论列表
    - 实现发表评论功能（输入框 + 按钮）
    - 实现删除评论功能
    - 空评论列表显示 Empty 组件
    - _Requirements: 2.3, 3.1, 3.2, 3.4, 4.1, 4.2, 4.3, 4.4, 8.2_

  - [ ]\* 10.2 编写详情页的单元测试
    - 测试详情加载
    - 测试点赞功能
    - 测试评论功能
    - 测试空状态显示

- [x] 11. 实现排行榜页面
  - [x] 11.1 实现 pages/ranking/index.vue
    - 实现排序方式切换（按点赞数/完成数）
    - 调用 todoStore.fetchRanking 加载排行榜
    - 显示排行榜列表
    - 显示加载状态
    - 空列表显示 Empty 组件
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 8.3_

  - [ ]\* 11.2 编写排行榜的属性测试
    - **Property 21: Default ranking is sorted by likes**
    - **Property 22: Completion ranking is sorted correctly**
    - **Property 23: Like ranking is sorted correctly**
    - **Validates: Requirements 5.1, 5.2, 5.3**
  - [ ]\* 11.3 编写排行榜的单元测试
    - 测试排序切换
    - 测试加载状态
    - 测试空状态显示

- [x] 12. 实现个人中心页面
  - [x] 12.1 实现 pages/profile/index.vue
    - 调用 userStore.fetchUserInfo 加载用户信息
    - 显示用户基本信息（头像、用户名）
    - 显示统计数据（Todo 总数、完成数、获赞数）
    - 实现编辑个人信息功能
    - 实现退出登录功能
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]\* 12.2 编写个人中心的属性测试
    - **Property 13: User statistics are correctly calculated**
    - **Validates: Requirements 6.3**
  - [ ]\* 12.3 编写个人中心的单元测试
    - 测试信息加载
    - 测试编辑功能
    - 测试退出登录

- [x] 13. 实现应用初始化和路由守卫
  - [x] 13.1 配置 main.ts
    - 初始化 Pinia
    - 挂载应用
    - _Requirements: 9.3_

  - [x] 13.2 实现路由守卫
    - 在 App.vue 或路由配置中实现导航守卫
    - 检查登录状态，未登录跳转到登录页
    - 已登录且访问登录页则跳转到首页
    - _Requirements: 1.5, 10.2, 10.3_

  - [ ]\* 13.3 编写路由守卫的单元测试
    - 测试未登录访问保护页面
    - 测试已登录访问登录页
    - 测试 token 恢复

- [x] 14. 实现 UI 状态管理
  - [x] 14.1 完善空状态显示逻辑
    - 确保所有列表页面正确显示 Empty 组件
    - 确保有数据时隐藏 Empty 组件
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]\* 14.2 编写 UI 状态的属性测试
    - **Property 29: Non-empty data hides empty state**
    - **Validates: Requirements 8.4**

- [ ] 15. 配置测试环境
  - [x] 15.1 配置 Vitest
    - 创建 vitest.config.ts
    - 配置测试环境和覆盖率
    - _Requirements: 测试策略_

  - [x] 15.2 配置 fast-check
    - 安装 fast-check
    - 创建测试辅助函数和生成器
    - _Requirements: 测试策略_

  - [x] 15.3 添加测试脚本到 package.json
    - 添加 test、test:unit、test:property、test:coverage 脚本
    - _Requirements: 测试策略_

- [ ] 16. Checkpoint - 确保所有测试通过
  - 运行所有测试，确保通过
  - 如有问题，请询问用户

- [ ] 17. 优化和完善
  - [ ] 17.1 添加错误处理
    - 完善所有 API 调用的错误处理
    - 添加友好的错误提示
    - _Requirements: 7.5, 错误处理策略_
  - [ ] 17.2 添加加载状态
    - 为所有异步操作添加 loading 状态
    - 显示加载指示器
    - _Requirements: 5.4_
  - [ ] 17.3 性能优化
    - 实现列表虚拟滚动（如果需要）
    - 优化图片加载
    - 添加请求缓存
    - _Requirements: 性能考虑_
  - [ ]\* 17.4 编写集成测试
    - 测试完整的用户流程
    - 测试跨页面交互

- [ ] 18. Final Checkpoint - 确保所有测试通过
  - 运行所有测试，确保通过
  - 如有问题，请询问用户
