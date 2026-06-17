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

### ✅ Chromium 中文输入法 Bug 已修复

之前报告的 Chromium 149.0.7827.103+ Windows 桌面端中文输入法首次输入丢失的问题，已在 **Chromium 149.0.7827.156** 中修复。

- **修复版本**：Google Chrome 149.0.7827.156 及以上
- **原因**：Chromium 引擎在 Windows 桌面端的 IME 合成事件派发回归
- **历史记录**：详见 [Chromium Issue #523134891](https://issues.chromium.org/issues/523134891)

## 开源协议

Apache License 2.0

## 支持与赞助 💖

如需支持本项目的持续开发，请前往统一赞赏页面：

👉 [https://ale160.com/sponsor](https://ale160.com/sponsor)


## 关于

由 [ale-160](http://ale160.com/) 开发维护。
