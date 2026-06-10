# web-text

[English](README_EN.md) | 中文

一个简洁优雅的在线 Markdown 编辑器，所有数据保存在浏览器本地，无需担心隐私问题。

在线体验：[https://web-text.ale160.com/](https://web-text.ale160.com/)

个人主站：[http://ale160.com/](http://ale160.com/)

## 功能特性

- **实时预览** — 左侧编辑，右侧即时渲染
- **代码高亮** — 支持多种编程语言的语法高亮
- **自动保存** — 内容自动保存到浏览器本地存储
- **历史版本** — 自动保存最近 50 个版本，随时回退
- **暗色模式** — 支持亮色和暗色主题切换
- **导出功能** — 支持导出为 `.md` 文件或复制到剪贴板
- **多语言** — 支持中文和英文界面
- **全屏模式** — 沉浸式编辑体验

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- CodeMirror 6
- shadcn/ui

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/ale-160/web-text.git
cd web-text

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看效果。

## 已知问题

### Chromium 149.0.7827.103+ 中文输入法 Bug

在 Windows 桌面端，Chromium 149.0.7827.103 及以上版本（包括 Google Chrome 和 Microsoft Edge）存在一个严重的 IME（输入法）回归 Bug：

- **症状**：首次使用中文输入法输入时，内容会被静默丢弃，需要输入两次才能成功写入
- **影响范围**：所有基于 `contenteditable` 的网页编辑器，包括 CodeMirror 6
- **不受影响**：Firefox、夸克浏览器、Electron 内置浏览器、Chromium 149.0.7827.54 及更早版本

**临时解决方案**：
- 使用 Chrome 或 Edge 的用户，**请勿升级浏览器版本**（浏览器会自动检查更新，建议关闭自动更新）
- 可切换到 Firefox 或夸克浏览器进行中文输入

Bug 报告，详见 `docs/CHROME_IME_BUG_REPORT.md`。

## 开源协议

Apache License 2.0

## 关于

由 [ale-160](http://ale160.com/) 开发维护。
