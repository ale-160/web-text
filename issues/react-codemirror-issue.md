## ⚠️ 提醒：Chromium 149+ IME 回归导致中文输入异常（非本库问题）

### 情况说明

这不是要求你们修复代码，而是希望你们知悉并帮助向社区传达信息。

我们团队技术能力有限，整个验证过程大量使用了 AI 辅助。本中文 Issue 为经过人工审查的权威版本。

我们恳请 @uiw/react-codemirror 团队帮忙验证此问题。同时，我们也已向 CodeMirror 官方提交了 Issue，请求他们帮忙验证并向 Chromium 团队反馈。如果此问题被证实，建议你们可以发个公告或 Pin 住此 Issue，方便遇到同样问题的用户查阅。我们的验证过程中也提供了替代性解决方案，例如使用某些版本之前的浏览器或换用其他浏览器。

**English version (completed with the assistance of translation tools)：** https://github.com/ale-160/web-text/blob/main/issues/react-codemirror-issue-en.md
**详细技术分析报告（中文）：** https://github.com/ale-160/web-text/blob/master/docs/CHROME_IME_BUG_REPORT.md

---

### 问题描述

Chromium 引擎在 Windows 桌面端的回归 Bug（149.0.7827.103+），导致所有 CodeMirror 6 编辑器中首次 IME 合成输入被静默丢弃。这也影响了 `@uiw/react-codemirror` 用户。

我们已确认这**不是** `@uiw/react-codemirror` 的问题 — 即使以下操作后 Bug 依然存在：
- 完全绕过 `@uiw/react-codemirror`，直接使用 CodeMirror 6 原生 `EditorView` API
- 移除所有受控 `value` prop 同步
- 禁用内部 `typingLatch` 机制

### 环境信息

| 包名                      | 版本                                                                                                                                            |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| `@uiw/react-codemirror` | 4.25.10                                                                                                                                       |
| `@codemirror/view`      | 6.43.0                                                                                                                                        |
| `@codemirror/state`     | 6.6.0                                                                                                                                         |
| React                   | 19.2.4                                                                                                                                        |
| Next.js                 | 16.2.4                                                                                                                                        |
| 浏览器（受影响）                | Chrome 149.0.7827.102， Edge 149.0.4022.62（Chromium 149.0.7827.103）                                                                            |
| 浏览器（不受影响）               | Microsoft Edge 149.0.4022.52（Chromium 149.0.7827.54）, 夸克浏览器（Chromium 144.0.7559.86）， Firefox 150/151， Electron 内置浏览器（Chromium 142.0.7444.235） |
| 操作系统                    | Windows 11                                                                                                                                    |
| 输入法                     | 微软拼音、QQ 拼音                                                                                                                                    |

### 症状

- **微软拼音：** 中文标点（。，：）每个符号需要按两次。第一次按 → 无反应。第二次按 → 符号出现。
- **QQ 拼音：** 所有 IME 输入（汉字和标点）都需要两次。第一次合成总是丢失，第二次成功。部分符号会移动输入光标，例如：【 】 ‘ ’。
- **根因：** Chromium 149.0.7827.103+ 完全抑制了第一次 IME 合成事件 — 无 `compositionstart`、`beforeinput`、`compositionend` 事件派发。

### 浏览器对比

| 浏览器 | 受影响？ |
|--------|---------|
| Chrome 149.0.7827.102 | **是** |
| Edge 149.0.4022.62 | **是** |
| Edge 149.0.4022.52（Chromium 149.0.7827.54） | 否 |
| Firefox 150/151 | 否 |
| 夸克浏览器 | 否 |
| Electron 内置浏览器 | 否 |

### 对 @uiw/react-codemirror 的影响

这大概率是 Chromium Bug，而非库本身的问题，但遇到此问题的用户可能会：
1. 怀疑 React 包装层或编辑器配置有问题
2. 在 `@uiw/react-codemirror` Issues 中搜索类似报告
3. 可能在此处提交 Issue，误以为是库的问题

### 建议操作

1. **Pin 住此 Issue**，作为已知上游 Bug，让遇到问题的用户能立即找到解释
2. **在 README 中添加说明**（或警告横幅），告知 Chromium 149+ IME 回归
3. **关注 Chromium 修复进度**，以便修复后及时更新文档

### 替代性解决方案

如需向用户推荐临时绕过方案：

- 使用 Chromium 149.0.7827.54 之前的浏览器版本，或换用 Firefox、夸克浏览器
- 正在使用 Chrome 或 Edge 的用户，避免升级浏览器版本（关闭自动更新，不要查看版本，查看版本会自动更新）

### 复现步骤
在 Windows 上用 Chrome 149+ 打开 我们的在线示例 https://web-text.ale160.com/ 或 CodeMirror 官网 https://codemirror.net/try/ ，切换到微软拼音，尝试输入中文标点。
