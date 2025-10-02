# 开发模式说明

## 可用的开发模式

### 1. 纯 Web 预览模式（推荐用于 UI 开发）
```bash
npm run dev:web
```
- 🌐 在浏览器中预览界面（http://localhost:5173）
- ⚡ 不启动 Electron，速度更快
- 🎨 适合纯界面开发和调试
- 📝 使用模拟数据（mock data）
- 🔄 支持热重载（HMR）

**特点：**
- 不需要 Electron 运行环境
- 可以使用浏览器开发者工具
- 界面调试更快速
- 模拟数据库连接和表结构

### 2. Electron 开发模式（用于完整功能测试）
```bash
npm run dev
```
或
```bash
npm run dev:electron
```
- 🖥️ 在 Electron 窗口中运行
- 🔌 支持真实数据库连接
- 📡 支持 IPC 通信
- 🗄️ 可以连接真实的 MySQL/PostgreSQL 等数据库

**特点：**
- 完整的 Electron 功能
- 真实的数据库连接
- 文件系统访问
- 原生菜单和窗口控制

### 3. 普通 Vite 开发模式
```bash
npm run dev
```
- 默认启动 Vite 开发服务器
- 同时启动 Electron（如果配置了 vite-plugin-electron）

## 构建模式

### Web 构建
```bash
npm run build:web
```
构建纯 Web 版本，可以部署到服务器

### Electron 构建
```bash
npm run build
```
构建 Electron 应用程序（Windows/Mac/Linux）

## 清理构建文件
```bash
npm run clean
```
或在 Windows 上：
```bash
clean.bat
```

## 模式对比

| 功能 | Web 模式 | Electron 模式 |
|------|---------|--------------|
| 启动速度 | ⚡ 快 | 🐢 慢 |
| 数据库连接 | ❌ 模拟 | ✅ 真实 |
| UI 开发 | ✅ 推荐 | ⚠️ 可用 |
| 功能测试 | ❌ 有限 | ✅ 完整 |
| 热重载 | ✅ 支持 | ✅ 支持 |
| 浏览器工具 | ✅ 完整 | ⚠️ 有限 |

## 推荐工作流程

1. **UI 开发阶段**：使用 `npm run dev:web`
   - 快速迭代界面
   - 使用浏览器开发工具
   - 不需要真实数据库

2. **功能测试阶段**：使用 `npm run dev:electron`
   - 测试数据库连接
   - 测试 IPC 通信
   - 测试完整功能

3. **发布前测试**：使用 `npm run build`
   - 构建生产版本
   - 完整测试

## 注意事项

- Web 模式下不会显示自定义标题栏（Titlebar）
- Web 模式下数据库操作使用模拟数据
- Electron 模式需要安装所有依赖（包括 electron）
- 首次运行 Electron 模式可能需要下载 Electron 二进制文件
