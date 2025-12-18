# TechShare Admin

TechShare Admin 是 TechShare 平台的后台管理系统，专为管理员设计，用于维护平台内容、管理用户及系统设置。

## 🛠 技术栈

- **核心框架**: Vue 3
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **HTTP 客户端**: Axios (集成在 API 模块中)

## ✨ 主要功能

- **仪表盘**: 系统数据概览
- **用户管理**:
  - 用户列表查询
  - 用户信息编辑
  - 用户状态管理 (封禁/解封)
- **文章管理**:
  - 文章列表与筛选
  - 文章详情查看
  - **历史版本查看**: 查看文章的历史修改记录
  - 文章删除与恢复
- **分类管理**:
  - 文章分类的增删改查
- **标签管理**:
  - 系统标签管理
- **系统设置**: 平台基础配置

## 📂 项目结构

```
src/
├── api/             # API 接口封装
├── assets/          # 静态资源
├── components/      # 公共组件
├── layout/          # 布局组件 (Sidebar, Header)
├── router/          # 路由配置
├── store/           # Pinia 状态管理
├── utils/           # 工具函数
├── views/           # 页面视图
│   ├── article/     # 文章管理
│   ├── user/        # 用户管理
│   ├── category/    # 分类管理
│   ├── tag/         # 标签管理
│   └── ...
└── App.vue          # 根组件
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 运行开发服务器

```bash
npm run dev
```

### 3. 构建生产版本

```bash
npm run build
```

## 🔌 关联项目

- 后端服务: [TechShare Server](https://github.com/NKDShinKu/TechShareServer)
- 用户前台: [TechShare Hub](https://github.com/NKDShinKu/TechShareHub)
