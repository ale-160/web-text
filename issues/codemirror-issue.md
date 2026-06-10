## ⚠️ Chromium 149+ IME 回归：Windows 上首次 IME 合成输入丢失

### 情况说明

我们团队位于中国，无法注册谷歌账号直接向 Chromium Issue Tracker 反馈 Bug。团队技术能力有限，整个验证过程大量使用了 AI 辅助。本中文 Issue 为经过人工审查的权威版本。

恳请 CodeMirror 团队帮忙验证此问题，如果确认问题存在，帮忙向 Chromium 团队反馈。我们注意到 CodeMirror 团队（特别是维护者）过去曾直接向 Chromium 报告过 IME 相关 Bug（如 #351029417），在 Chromium 开发者中有良好的沟通渠道。

**English version (completed with the assistance of translation tools)：** https://github.com/ale-160/web-text/blob/master/issues/codemirror-issue-en.md
**详细技术分析报告：** https://github.com/ale-160/web-text/blob/master/docs/CHROME_IME_BUG_REPORT.md

---

### 环境信息

- `@codemirror/view`: 6.43.0
- `@codemirror/state`: 6.6.0
- `@codemirror/lang-markdown`: 6.5.0
- 浏览器：Google Chrome 149.0.7827.102（Chromium 149.0.7827.102）/ Microsoft Edge 149.0.4022.62（Chromium 149.0.7827.103）
- 操作系统：Windows 11
- 输入法：微软拼音、QQ 拼音

### 现象描述

在 Windows 桌面端 Chromium 149+ 中，CodeMirror 6 编辑器的**首次 IME 合成输入被静默丢弃**，用户需要再次输入相同内容才能写入。

**症状 A（微软拼音）：** 中文标点（。，：；！？“”‘’等）每个符号需要按两次。第一次按 → 无反应。第二次按 → 符号出现。

**症状 B（QQ 拼音）：** 所有 IME 输入（汉字和标点）都需要两次。第一次合成丢失，第二次成功。部分符号会移动输入光标，例如：【 】 ‘ ’。

### 期望行为

首次 IME 输入应当正常工作，如 Firefox、夸克浏览器、Electron 内置浏览器、Chromium 149.0.7827.54 中那样。

### 浏览器对比

| 浏览器                          | Chromium 版本    | 受影响？  |
|------------------------------|----------------|-------|
| Google Chrome 149.0.7827.102 | 149.0.7827.102 | **是** |
| Microsoft Edge 149.0.4022.62 | 149.0.7827.103 | **是** |
| Microsoft Edge 149.0.4022.52 | 149.0.7827.54  | 否     |
| Electron 内置浏览器               | 142.0.7444.235 | 否     |
| Firefox 150/151              | N/A            | 否     |
| 夸克浏览器                        | 144.0.7559.86  | 否     |

### 核心发现

1. **非 EditContext 问题。** `@codemirror/view@6.43.0` 中 EditContext 仅在 Android 启用（`browser.android` 检查，第 7094 行）。桌面 Chrome 使用传统 `contenteditable` 模式。

2. **非 React 或 @uiw/react-codemirror 问题。** 我们完全绕过了 React 包装层，直接使用 CodeMirror 6 原生 `EditorView` API — Bug 依然存在。

3. **首次 IME 输入：完全无事件派发。** 我们在 document 根节点添加事件监听验证：
   ```javascript
   document.addEventListener('compositionstart', () => console.log('[IME] compositionstart'), true);
   document.addEventListener('compositionend', () => console.log('[IME] compositionend'), true);
   document.addEventListener('beforeinput', (e) => console.log('[IME] beforeinput:', e.inputType, e.data), true);
   ```
   首次 IME 输入：**控制台零输出**。第二次：所有事件正常触发。

4. **推测为 Chromium 引擎回归。** Edge 149.0.4022.52（Chromium 149.0.7827.54）不受影响。升级到 Edge 149.0.4022.62（Chromium 149.0.7827.103）后出现 Bug。回归定位在 149.0.7827.54 到 149.0.7827.103 之间。

### 复现步骤

1. 在 Windows 上用 Chrome 149+ 打开任意 CodeMirror 6 编辑器（如我们的在线示例 https://web-text.ale160.com/ 或 CodeMirror 官网 https://codemirror.net/try/ ）
2. 点击编辑器聚焦
3. 切换到微软拼音
4. 按 `.` 键（句号）→ 无反应
5. 按 `,` 键（逗号）→ `，` 出现，但之前的句号丢失

源码仓库：https://github.com/ale-160/web-text.git

### 社区独立确认

此问题已在多个社区被独立报告或讨论：
- 洛谷（中国编程社区）：https://www.luogu.com.cn/discuss/1303381
- W3C 邮件列表：https://lists.w3.org/Archives/Public/public-webapps-github/2025Apr/0087.html
- CodeMirror 论坛：https://discuss.codemirror.net/t/chinese-ime-punctuation-input-loses-every-other-keypress-requires-2-presses-per-character/9741

