# UniApp Todo Application

基于 UniApp + Vue3 + TypeScript 的跨平台 Todo 应用

## 技术栈

- UniApp
- Vue 3
- TypeScript
- Vite
- Pinia (状态管理)
- Axios (网络请求)
- Vitest (单元测试)
- fast-check (属性测试)

## 项目结构

```
src/
├── pages/          # 页面
├── components/     # 组件
├── api/           # API 模块
├── stores/        # Pinia stores
├── hooks/         # 组合式函数
├── utils/         # 工具函数
├── types/         # TypeScript 类型定义
├── App.vue
├── main.ts
└── pages.json
```

## 安装依赖

```bash
npm install
```

## 开发

```bash
npm run dev
```

## 构建

```bash
npm run build
```

## 测试

```bash
# 运行所有测试
npm run test

# 运行单元测试
npm run test:unit

# 运行属性测试
npm run test:property

# 生成覆盖率报告
npm run test:coverage
```

## 功能特性

- 用户登录注册
- Todo 任务管理（创建、查看、编辑、删除）
- 评论功能
- 点赞功能
- 排行榜
- 个人中心
- Token 鉴权
