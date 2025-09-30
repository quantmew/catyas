# Catyas - 数据库管理工具

<div align="center">
  <img src="https://img.shields.io/badge/Electron-26.0-blue.svg" alt="Electron">
  <img src="https://img.shields.io/badge/React-18.2-blue.svg" alt="React">
  <img src="https://img.shields.io/badge/Vite-4.4-blue.svg" alt="Vite">
  <img src="https://img.shields.io/badge/TypeScript-5.1-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/Ant%20Design-5.8-blue.svg" alt="Ant Design">
</div>

Catyas 是一个现代化的数据库管理工具，类似于 Navicat，支持多种数据库类型。使用 Electron + React + Vite 技术栈构建，提供直观的用户界面和强大的数据库管理功能。

## 🚀 支持的数据库

- **MySQL** / **MariaDB** - 最流行的开源关系型数据库
- **PostgreSQL** - 功能强大的开源对象关系型数据库
- **SQLite** - 轻量级的嵌入式数据库
- **MongoDB** - 流行的 NoSQL 文档数据库
- **Redis** - 高性能的内存数据存储
- **Oracle** - 企业级关系型数据库
- **SQL Server** - 微软的关系型数据库管理系统

## 🛠️ 技术栈

- **前端框架**: React 18.2 + TypeScript
- **桌面应用**: Electron 26.0
- **构建工具**: Vite 4.4
- **UI 库**: Ant Design 5.8
- **状态管理**: Zustand
- **路由**: React Router DOM
- **数据请求**: React Query
- **国际化**: react-i18next

## 📦 安装与运行

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

当前仓库已完成最小可运行脚手架（Electron 主进程 + 预加载 + React + Vite 渲染进程）。首次运行前请安装依赖：

```bash
npm install
```

启动开发（自动拉起 Vite + TypeScript 监听编译 + Electron）：

```bash
npm run dev
```

若你更倾向于手动起服务，也可分开运行：

```bash
# 终端 A：编译主进程（监视）
npm run build:main -- --watch

# 终端 B：启动 Vite（渲染进程）
npm run vite

# 终端 C：启动 Electron（依赖上面两者就绪）
npm run electron
```

### 构建应用

```bash
# 构建前端和后端
npm run build

# 打包成可执行文件
npm run dist
```

### 其他命令

```bash
# 类型检查
npm run type-check

# 代码规范检查
npm run lint

# 修复代码规范问题
npm run lint:fix
```

## 🎯 主要功能

### 🔌 连接管理
- 支持多种数据库类型
- 安全的连接配置
- 连接状态管理
- SSL/TLS 加密支持

### 📊 数据浏览
- 数据库和表的树形结构导航
- 表数据的分页浏览
- 数据类型的智能显示
- 实时数据刷新

### 💻 SQL 编辑器
- 语法高亮的 SQL 编辑器
- 查询结果的表格显示
- 执行时间统计
- 查询历史记录

### 🛠️ 管理工具
- 表结构设计
- 数据导入导出
- 索引管理
- 用户权限管理

### 🌍 国际化支持
- 多语言界面（中文、英文、日文）
- 实时语言切换
- 自动语言检测
- 本地化存储设置

## 📁 项目结构（当前脚手架）

```
catyas/
├── src/
│   ├── main/                      # Electron 主进程 + 预加载
│   │   ├── database/DatabaseManager.ts  # 连接管理（当前为演示桩）
│   │   ├── preload/index.ts       # 预加载，暴露 window.catyas API
│   │   ├── ipc.ts                 # IPC 常量与类型
│   │   └── main.ts                # 主进程入口
│   └── renderer/                  # React 渲染进程（Vite）
│       ├── ui/App.tsx
│       ├── ui/components/{Topbar,Sidebar,DataTable,SQLEditor,StatusBar}.tsx
│       ├── ui/styles.css
│       └── main.tsx
├── index.html                     # Vite 入口
├── scripts/dev.js                 # 一键本地开发脚本
├── tsconfig.json
├── tsconfig.main.json
├── vite.config.ts
└── package.json
```

## 🔧 配置说明

### Vite 配置

项目使用 Vite 作为构建工具，配置文件位于 `vite.config.ts`。主要配置包括：

- React 插件支持
- 路径别名设置
- 开发服务器配置
- 构建输出配置

### TypeScript 配置

项目使用 TypeScript，配置文件包括：

- `tsconfig.json` - 渲染进程配置
- `tsconfig.main.json` - 主进程配置
- `tsconfig.node.json` - 构建工具配置

### Electron 配置

Electron 配置在 `package.json` 的 `build` 字段中，支持：

- Windows (NSIS 安装包)
- macOS (DMG 安装包)
- Linux (AppImage)

### 当前状态与后续计划

- 当前 UI 为轻量原型（Topbar / 连接树 / 表格结果 / SQL 编辑器 / 状态栏），布局参考 Navicat（见仓库中的 navicat*.png）。
- `DatabaseManager` 暂为演示桩：提供示例库与表、以及虚拟的查询结果，便于先行开发界面与交互。
- 后续可按数据库类型逐步接入驱动（MySQL、PostgreSQL、Oracle、SQLite、SQL Server、MariaDB、MongoDB、Redis），并将操作下沉到主进程，通过 `preload` 安全暴露给渲染进程。
- UI 库（Ant Design）与状态管理（Zustand）、查询库（React Query）、国际化（i18n）等可在后续阶段按需加入。

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 开发规范

- 使用 TypeScript 进行类型安全的开发
- 遵循 ESLint 代码规范
- 组件使用函数式组件 + Hooks
- 状态管理使用 Zustand
- UI 组件基于 Ant Design

## 📄 许可证

本项目使用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🐛 问题反馈

如果您发现了 bug 或有功能建议，请在 [Issues](https://github.com/your-username/catyas/issues) 页面提交。

## 🎉 致谢

- [Electron](https://electronjs.org/) - 跨平台桌面应用开发框架
- [React](https://reactjs.org/) - 用户界面库
- [Vite](https://vitejs.dev/) - 快速的构建工具
- [Ant Design](https://ant.design/) - 企业级 UI 设计语言
- [Navicat](https://www.navicat.com/) - 界面设计灵感来源
