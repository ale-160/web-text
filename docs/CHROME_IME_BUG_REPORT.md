# Bug 报告：Chromium 149+ Windows 中文输入首次输入丢失

**报告人：** Web-text 项目组  
**日期：** 2026-06-10  
**影响组件：** Chromium 引擎 Windows 桌面端 IME 合成事件派发  
**严重程度：** 高 — 导致所有基于 contenteditable 的编辑器中文/日文/韩文输入异常  
**影响范围：** Chromium 149.0.7827.103 及以上版本的 Windows 桌面端（包括 Google Chrome 和 Microsoft Edge），其他浏览器及旧版 Chromium 不受影响

---

## 1. 问题概述

在 Windows 桌面端的 Google Chrome（149+）中，使用输入法（IME）向 `contenteditable` 元素输入内容时，**第一次合成输入会被静默丢弃**，用户必须再次输入相同内容才能成功写入编辑器。使用微软拼音时，中文标点（句号、逗号、冒号等）每次都需要按两次才能出一个；使用 QQ 拼音时，所有中文输入（包括汉字和标点）都需要按两次。

**这是 Chromium 引擎的回归 Bug。** 我们通过系统的跨浏览器对比测试确认：Firefox、夸克浏览器、Electron（v39.2.7）内置浏览器均不受影响。值得注意的是，Microsoft Edge 在升级到 Chromium 149.0.7827.103 之前也不受影响，升级之后出现了完全相同的问题——这证实根因在 Chromium 149.0.7827.103+ 引入的代码变更中。

我们也确认这**不是** React 或 `@uiw/react-codemirror` 的问题——我们完全绕过了 React 包装层，直接使用 CodeMirror 6 原生 `EditorView` API，Bug 依然存在。

## 2. 测试环境

| 项目 | 详情 |
|------|------|
| 操作系统 | Windows 11 Version 25H2 (Build 26200.8457) |
| **受影响浏览器** | **Google Chrome 149.0.7827.102**（Chromium 149.0.7827.102） |
| **同样受影响** | **Microsoft Edge 149.0.4022.62**（Chromium 149.0.7827.103）——从 149.0.4022.52 升级后出现 |
| 不受影响 | Firefox 150.0.3 / 151.0.4、Microsoft Edge 149.0.4022.52（Chromium 149.0.7827.54）、夸克浏览器 144.0.7559.86、Electron（v39.2.7）内置浏览器（Chromium 142.0.7444.235） |
| 编辑器框架 | CodeMirror 6（`@codemirror/view@6.43.0`） |
| React 版本 | React 19 + Next.js 16（去掉 React 后问题依旧） |
| 测试输入法 | 微软拼音、QQ 拼音 |
| EditContext | **未启用**——CodeMirror 6 仅在 Android 上启用 EditContext，桌面 Chrome 使用传统 contenteditable 模式 |

### 2.1 浏览器版本详情

**Google Chrome（受影响）：**
```
Google Chrome    149.0.7827.102 (正式版本) （64 位）
修订版本          112f665d98a2fe84b156c74fbea2aed742f16c15
操作系统          Windows 11 Version 25H2 (Build 26200.8457)
JavaScript       V8 14.9.207.27
```

**Microsoft Edge（不受影响，升级前）：**
```
Microsoft Edge    149.0.4022.52 (正式版本) (64 位)
Chromium 版本     149.0.7827.54
JavaScript        V8 14.9.20.6
```

**Microsoft Edge（受影响，升级到 Chromium 149.0.7827.103 后）：**
```
Microsoft Edge    149.0.4022.62 (正式版本) (64 位)
Chromium 版本     149.0.7827.103
JavaScript        V8 14.9.20.8
```

**Mozilla Firefox（不受影响）：**
```
150.0.3 (64 位) → 151.0.4 (64 位) — 均不受影响
```

**夸克浏览器（不受影响）：**
```
夸克              144.0.7559.86 (正式版本) （64 位）
修订版本          0692bb4c7f582f78a657917cddc1fef727422efe
操作系统          Windows 11 Version 25H2 (Build 26200.8457)
JavaScript        V8 14.4.258.18
```

**关键发现：** Microsoft Edge 在 Chromium 149.0.7827.54 时正常，升级到 Chromium 149.0.7827.103 后出现 Bug。这精确地将问题定位到 Chromium 149.0.7827.54 和 149.0.7827.103 之间引入的回归。

## 3. 详细症状描述

### 3.1 基本规律

所有通过键盘直接输入的英文字符和符号均正常。问题**仅出现在 IME 合成输入**时。

### 3.2 症状 A：中文标点需要输入两次

使用**微软拼音**：

1. 切换到中文输入模式
2. 连续按两次句号键——仅第二次**句号（。）出现**
3. 按句号键（。）——编辑器中**什么都没有出现**，再按逗号键（，）——**逗号（，）出现了**，但之前按的句号（。）仍然丢失

需要按两次中文标点，《》。、？；：“”｛｝|·！￥……&（）——等
其他已知问题：
 - 【 或 ‘ 会左移动输入光标
 - 】或 ’ 会右移动输入光标

**注意：** 两次输入不需要是同一个符号。例如第一次输入逗号（，），第二次输入句号（。），句号会成功写入。反过来也一样。第二次 IME 合成总是能成功，无论是否与第一次相同。（复现步骤见6.1或6.2）

### 3.3 症状 B：QQ 拼音——所有输入都需要两次

使用**QQ 拼音**：

1. 输入 `nihao`，从候选列表选择"你好"——编辑器中**什么都没有出现**
2. 输入 `nibuhao`，选择"你不好"——**"你不好"出现了**，但之前的"你好"仍然丢失
3. 规律：每次会话的第一次合成总是丢失，第二次成功

### 3.4 症状 C：微软拼音——汉字能输入，标点不行

使用**微软拼音**：

- 中文汉字输入（如输入 `nihao` + 空格得到"你好"）**第一次就能成功**
- 中文**标点**（。，：等）需要**输入两次**才能写入（见症状 A）

微软拼音和 QQ 拼音之间的这种差异表明，Bug 由不同输入法产生的特定 IME 事件序列触发。

## 4. 跨浏览器验证

我们在同一台 Windows 机器上，使用同一个编辑器、同一种输入法，对多个浏览器进行了系统测试：

| 浏览器 | 版本 | Chromium 版本 | 中文标点（微软拼音） | 中文汉字（QQ拼音） | 状态 |
|--------|------|---------------|---------------------|-------------------|------|
| **Google Chrome** | 149.0.7827.102 | 149.0.7827.102 | **失败**（需输入两次） | **失败**（需输入两次） | **存在 Bug** |
| **Microsoft Edge** | 149.0.4022.62 | 149.0.7827.103 | **失败**（需输入两次） | **失败**（需输入两次） | **存在 Bug** |
| Microsoft Edge | 149.0.4022.52 | 149.0.7827.54 | 正常 | 正常 | 不受影响 |
| Electron（v39.2.7）内置浏览器 | Electron 39.2.7 | 142.0.7444.235 | 正常 | 正常 | 不受影响 |
| Mozilla Firefox | 150.0.3 / 151.0.4 | N/A | 正常 | 正常 | 不受影响 |
| 夸克浏览器 | 144.0.7559.86 | 144.0.7559.86 | 正常 | 正常 | 不受影响 |

**关键结论：**

1. Bug **不是 Chromium 引擎的通用问题**——使用旧版 Chromium 的浏览器不受影响。
2. **Microsoft Edge 从 Chromium 149.0.7827.54 升级到 149.0.7827.103 后出现 Bug**，证明这是 Chromium 149.0.7827.103（或 .54 到 .103 之间）引入的回归。
3. Bug 在 **Chromium 引擎的 IME 集成层**，而非 Chrome 自身代码。Google Chrome 只是最先发布了受影响的 Chromium 版本。

## 5. 技术分析

### 5.1 已确认：不是 React 或 @uiw/react-codemirror 的问题

我们最初怀疑问题出在 `@uiw/react-codemirror` 的受控 `value` 属性同步机制上——当 React 的 `value` 属性变化时，它会派发 `ExternalChange` 事务。为了验证这个假设，我们完全绕过了 React 包装层，直接使用 CodeMirror 6 原生 `EditorView` API：

```typescript
// 直接使用 CodeMirror 6 API — 无 React 包装，无 value 属性同步
const view = new EditorView({
  state: EditorState.create({
    doc: value,
    extensions: [markdown(), EditorView.lineWrapping, updateListener],
  }),
  parent: container,
});
```

**结果：Bug 在 Chrome 中依然存在。** 这确认了问题不在 React 包装层或值同步机制，而在 Chrome 自身的 IME 事件处理中。

### 5.2 核心发现：首次 IME 合成没有任何事件派发

最关键的观察：当第一次 IME 合成输入丢失时，**没有任何事件被派发**——没有 `compositionstart`，没有 `beforeinput`，没有 `input`，没有 `compositionend`。Chrome 在浏览器层面静默丢弃了第一次 IME 合成。IME 文本由操作系统提交，但从未到达网页的事件系统。

第二次输入尝试时，所有事件正常触发（`compositionstart`、`beforeinput`、`input`、`compositionend`），文本成功写入。

这意味着之前假设的事件序列（compositionstart → beforeinput → compositionend → beforeinput(insertText)）对第一次输入**完全不适用**——因为第一次输入**根本没有事件触发**。这不是事件时序的竞态条件，而是对第一次 IME 合成事件序列的**完全抑制**。

**验证方法：** 在 Chrome DevTools Console 中执行以下代码，然后尝试输入中文标点：

```javascript
document.addEventListener('compositionstart', () => console.log('[IME] compositionstart'), true);
document.addEventListener('compositionend', () => console.log('[IME] compositionend'), true);
document.addEventListener('beforeinput', (e) => console.log('[IME] beforeinput:', e.inputType, e.data), true);
```

第一次输入时，Console 中**完全没有日志**。第二次输入时，所有事件正常打印。

### 5.3 为什么其他浏览器不受影响

- **Firefox**：使用不同的合成事件模型，IME 事件在第一次输入时正确派发。
- **Edge（Chromium 149.0.7827.54）**：使用未包含该回归的旧版 Chromium。升级到 149.0.7827.103 后出现相同 Bug，确认回归在 Chromium 引擎中。
- **Electron（v39.2.7）内置浏览器（Chromium 142.0.7444.235）**：使用未包含该回归的旧版 Chromium。
- **夸克浏览器**：自定义 Chromium 分支，未引入该回归。

### 5.4 EditContext 不是原因

我们确认 CodeMirror 6 的 `EditContext` API **仅在 Android 上启用**（`@codemirror/view@6.43.0` 中的 `browser.android` 检查）。桌面 Chrome 使用传统的 `contenteditable` + `compositionstart/compositionend` 事件模型。因此，这与之前报告的 Chromium Bug #351029417（EditContext IME 字符边界问题）无关。

## 6. 复现步骤

### 6.1 最简复现方式

任何 Chrome 中的 CodeMirror 6 编辑器实例都可以复现此问题。具体步骤：

1. 在 Windows 上用 Google Chrome（149+）[在线测试]( https://web-text.ale160.com/ )或本地部署（[GitHub地址](https://github.com/ale-160/web-text)）
2. 点击编辑器聚焦
3. 切换到中文输入法（微软拼音或 QQ 拼音）
4. 尝试输入中文句号（。）——观察它不会出现
5. 再输入一个字符——观察第二个字符出现了，但第一个丢失

### 6.2 详细复现步骤

1. 在 Windows 上用 Chrome 打开 [在线测试](https://web-text.ale160.com/) 或[本地测试](http://localhost:3000)
2. 点击编辑器聚焦

**场景 1：中文标点（微软拼音）**

1. 切换输入法为微软拼音
2. 按 `.` 键（句号）——期望 `。` 出现
3. **实际结果：** 什么都没有出现。第一次输入被静默丢弃。
4. 按 `,` 键（逗号）——期望 `，` 出现
5. **实际结果：** `，` 出现了，确认第二次输入成功

**场景 2：中文汉字（QQ 拼音）**
1. 切换输入法为 QQ 拼音
2. 键盘输入 `nihao`
3. 从候选弹窗中选择"你好"
4. **实际结果：** 编辑器中什么都没有出现。第一次合成丢失。
5. 再次输入 `nihao` 并选择"你好"
6. **实际结果：** "你好"出现了，确认第二次合成成功

## 7. 我们的排查历程

我们在确认这是 Chromium 引擎回归之前，花了大量时间排查。以下是排查过程摘要：

### 第 1 轮：合成事件守卫
在 `onChange` 中添加 `!update.composing` 检查，在 `handleCompositionEnd` 中添加 `setTimeout(0)`。**结果：** 无改善。

### 第 2 轮：移除手动合成事件监听
移除所有手动 `compositionstart/end` 监听器，仅依赖 CodeMirror 内置的 `update.composing`。**结果：** 无改善。

### 第 3 轮：切换到 @uiw/react-codemirror React 组件
将编辑器重写为使用 `@uiw/react-codemirror` 的 `CodeMirror` React 组件，替代自定义 `EditorView`。**结果：** 无改善。

### 第 4 轮：全面控制台日志
添加详细的 `onUpdate` 和 `onChange` 日志，追踪每个事务、注解和 DOM 变更。**结果：** 发现 `update.composing` 返回 `undefined`（而非 `false`），以及 `@uiw/react-codemirror` 内部的 `typingLatch` 机制（200ms 超时锁）和 `ExternalChange` 注解。

### 第 5 轮：跨浏览器测试
在 Chrome、Firefox、Edge、夸克浏览器和 Electron（v39.2.7）内置浏览器中系统测试。**结果：** 最初发现仅 Google Chrome 存在 Bug。

### 第 6 轮：合成缓冲绕过方案
在 `handleChange` 中实现缓冲机制，检测 `viewUpdate.composing` 状态，在合成期间缓冲 onChange 调用，合成结束后延迟 50ms 刷新。**结果：** 无改善——第一次 IME 输入根本没到达 JavaScript 事件系统。

### 第 7 轮：移除 internalValue 状态
移除导致 React 重渲染竞态条件的 `internalValue` 状态和 `useEffect` 同步。**结果：** 无改善——Bug 不是由 React 重渲染引起的。

### 第 8 轮：完全绕过 @uiw/react-codemirror
彻底移除 `@uiw/react-codemirror` React 包装层，直接使用 CodeMirror 6 原生 `EditorView` API，在单个 `useEffect([], [])` 中创建编辑器，无任何 value 属性同步。**结果：** 无改善——即使没有任何 React 值同步机制，Bug 依然存在。这最终证明问题在 Chromium 的 IME 事件处理中，而非应用代码。

### 第 9 轮：Edge 升级回归测试
将 Microsoft Edge 从 Chromium 149.0.7827.54 升级到 149.0.7827.103。**结果：** Edge 从不受影响变为受影响，确认这是 Chromium 引擎在 149.0.7827.54 到 149.0.7827.103 之间引入的回归。

## 8. 相关 Issue

| 编号 | 标题 | 状态 | 关联性 |
|------|------|------|--------|
| Chromium #351029417 | EditContext 下 IME 候选框位置错误 | 已修复（2024年9月） | 同属 IME + contenteditable 领域，但症状不同。本案未使用 EditContext。 |
| CodeMirror dev #1396 | 6.28.2 版本中文输入法异常 | 已修复（6.28.3/6.28.4） | 相关——Chrome 中 CodeMirror 的 IME 处理。症状不同（候选框位置跳动，非输入丢失）。 |
| CodeMirror dev #1688 | Chrome 中括号内 IME 合成后文字消失 | 已关闭 | 相关——Chrome `compositionend` 同步时序导致 DOM 问题。 |
| CodeMirror dev #1654 | 装饰节点中 IME 合成问题 | 已修复（6.39.7） | 相关——Chrome 在合成期间复用 DOM 节点。 |
| CodeMirror dev #1472 | IME 合成期间字符偏移 | 已修复 | 相关——EditContext 合成文本偏移处理。 |
| Chromium #379170477 | EditContext 合成期间文本变更偏移 | 开放 | 相关——EditContext IME 处理。 |

## 9. 建议 Chromium 团队调查的方向

1. **首次 IME 合成事件被抑制**：最关键的发现是 Chromium 静默抑制了第一次 IME 合成——第一次 IME 输入后，`compositionstart`、`beforeinput`、`input`、`compositionend` 均未被派发。请调查 Chromium 的 Windows IME 集成为何在首次合成时未能派发这些事件。

2. **Chromium 149.0.7827.54 到 149.0.7827.103 之间的回归**：Microsoft Edge 在 Chromium 149.0.7827.54 时正常，升级到 149.0.7827.103 后出现 Bug。建议在这两个版本之间进行二分查找，定位引入回归的具体提交，重点关注 IME 相关的变更。

## 10. 影响评估

此 Bug 影响**所有基于 CodeMirror 6 构建的网页编辑器**（以及可能的其他基于 contenteditable 的编辑器）在 Chromium 149.0.7827.103+ 的 Windows 桌面端使用中文/日文/韩文输入法时的正常使用。考虑到：

- Chrome 全球浏览器市场份额约 65%
- 中国用户是 Chrome 最大的用户群体（9 亿+）
- CodeMirror 6 被数千个 Web 应用使用（文档站点、笔记应用、IDE、CMS 系统等）
- 此 Bug 导致基本的中文文本输入完全不可用
- 回归已蔓延到 Microsoft Edge

这是一个对大量 Chromium 浏览器用户而言**严重的关键可用性回归**。

## 11. 临时解决方案

在 Chromium 修复此 Bug 之前，应用层面没有可靠的绕过方案。我们在 JavaScript/React 层面已穷尽所有方法：

- **合成事件缓冲**：无效，因为第一次 IME 输入根本没到达 JavaScript 事件。
- **绕过 React 包装层**：无效，因为 Bug 在 Chromium 的事件派发中，而非应用代码。
- **直接使用 CodeMirror 6 API**：同理无效。

目前可行的变通方案：

1. **建议用户切换到其他浏览器**（Firefox、夸克）进行中文输入，或使用旧版 Chromium（149.0.7827.103 之前）。
2. **关注 CodeMirror Issue Tracker**，等待编辑器库层面的 Chromium 专项修复或绕过方案。
3. **向 Chromium 提交 Bug 报告**（ https://bugs.chromium.org/ ） ，引起 Chromium 团队的关注。

## 12. 参考资料

- **在线测试**：https://web-text.ale160.com/
- **源码 & 本地部署**：https://github.com/ale-160/web-text
- **洛谷公告（中文社区确认）**：https://www.luogu.com.cn/discuss/1303381
- **CodeMirror 论坛讨论（高社区关注度）**：https://discuss.codemirror.net/t/chinese-ime-punctuation-input-loses-every-other-keypress-requires-2-presses-per-character/9741
- **W3C 官方邮件列表（根因：Chrome 错误）**：https://lists.w3.org/Archives/Public/public-webapps-github/2025Apr/0087.html

