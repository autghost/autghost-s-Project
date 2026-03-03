# 听写助手 PWA

辅助小学生高效完成英语单词、短语的背诵与听写的渐进式网页应用。

## 技术栈

- **前端**: Vue 3 + TypeScript + Vite
- **状态管理**: Pinia
- **后端**: Supabase (PostgreSQL + Auth)
- **离线存储**: IndexedDB (Dexie.js)
- **图表**: Chart.js + vue-chartjs
- **PWA**: vite-plugin-pwa (Workbox)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，填入 Supabase 项目信息：

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 初始化数据库

在 Supabase Dashboard 的 SQL Editor 中执行 `supabase_schema.sql` 内的建表脚本。

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 构建生产版本

```bash
npm run build
```

## 部署到 Vercel

1. 将项目推送到 GitHub
2. 在 Vercel 中导入该仓库
3. 设置环境变量 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
4. 部署即可，`vercel.json` 已配置好 SPA 路由重写

## 项目结构

```
src/
  components/   通用 UI 组件
  views/        页面组件 (auth/ + main/)
  stores/       Pinia 状态管理
  services/     API 服务层
  router/       Vue Router 路由配置
  assets/       CSS 设计系统
```
