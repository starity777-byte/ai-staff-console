# AI 员工管理台

一个用于作品集展示的前端项目：管理"AI 员工"（基于不同大模型的智能体）及其任务。所有数据均为前端 Mock，无需后端。

## 技术栈

Vite 6 · Vue 3（`<script setup>`）· TypeScript · Ant Design Vue 4 · Vue Router 4 · Pinia · dayjs

## 功能

- **数据看板**：员工数 / 在线员工 / 进行中任务 / 完成率统计卡片，最近动态时间线，模型分布与任务状态占比
- **员工列表**：头像、名称、底层模型（Grok Build、Gemini 3.1 Pro、Claude Sonnet 4.6 等）、职位、技能、状态；关键词搜索 + 状态 / 模型筛选；抽屉表单新增 / 编辑（带校验）；气泡确认删除
- **任务管理**：负责人、优先级、进度条、状态；按状态筛选；弹窗表单新建任务（带校验）；删除任务
- 布局：可折叠侧边菜单 + 顶部栏（面包屑、通知、用户）

## 目录结构

```
src/
├── main.ts               # 入口：注册 Pinia、Router（Ant Design Vue 按需引入）
├── App.vue               # 全局中文 locale 与主题
├── layouts/BasicLayout.vue   # 侧边栏 + 顶栏布局
├── router/index.ts       # 路由配置（/dashboard /staff /tasks）
├── views/                # 页面
│   ├── Dashboard.vue     # 数据看板
│   ├── StaffList.vue     # 员工列表
│   └── TaskManage.vue    # 任务管理
├── components/           # 可复用组件
│   ├── StatCard.vue      # 统计卡片
│   ├── InitialsAvatar.vue    # 离线首字头像
│   ├── StaffFormDrawer.vue   # 员工新增/编辑抽屉
│   └── TaskFormModal.vue     # 新建任务弹窗
├── stores/               # Pinia 状态（staff.ts、task.ts）
├── mock/                 # Mock 数据（index.ts）与状态常量（constants.ts）
└── types/                # TypeScript 类型定义
```

## 运行

```bash
npm install
npm run dev        # 开发模式，默认 http://localhost:5173
npm run build      # 类型检查 + 生产构建，产物在 dist/
npm run preview    # 预览构建产物
npm run test       # Vitest 单元测试
```

> 注：业务数据由 Pinia 持久化到 localStorage。员工头像按姓名离线生成首字，不请求外部图片。

## 部署（GitHub Pages）

- 生产构建 `base` 为 `/ai-staff-console/`，路由使用 Hash 模式（`createWebHashHistory`），无需服务端回退配置。
- 推送到 `main` 分支后，`.github/workflows/deploy.yml` 自动执行 `npm ci` + `npm run build`（Node 20），并通过 `actions/deploy-pages` 发布 `dist`。
- 仓库 Settings → Pages 的 Source 需设为 “GitHub Actions”。
- 在线地址：https://starity777-byte.github.io/ai-staff-console/
