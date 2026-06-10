# Chrome Bug Report: Chinese IME Composition Input Lost on First Attempt in contenteditable

**Reporter:** Web-text project team
**Date:** 2026-06-10
**Affected Component:** Google Chrome desktop IME composition event dispatch on Windows
**Severity:** High — breaks Chinese/Japanese/Korean input for contenteditable-based editors
**Scope:** Affects Chromium 149.0.7827.103+ on Windows desktop (including Google Chrome and Microsoft Edge) — other browsers and older Chromium versions are unaffected

---

## 1. Summary

In Google Chrome (149+) on Windows, the first IME (Input Method Editor) composition input is silently lost when typing into a `contenteditable` element managed by CodeMirror 6. The user must type the same input a second time for it to be committed to the editor. This affects Chinese punctuation for Microsoft Pinyin, and both punctuation and full Chinese character input for other IMEs like QQ Pinyin, impacting hundreds of millions of Chinese users globally.

**This is a Chromium engine regression.** We have confirmed through systematic cross-browser testing that Firefox, Quark Browser, and Electron (v39.2.7) built-in browser are unaffected. Notably, Microsoft Edge was also unaffected until it updated to Chromium 149.0.7827.103, after which it exhibited the same bug — confirming the root cause is in Chromium 149.0.7827.103+.

We also confirmed this is **not** a React or `@uiw/react-codemirror` issue — we bypassed the React wrapper entirely and used CodeMirror 6's native `EditorView` API directly, and the bug still persists in Chrome.

## 2. Environment

| Item | Details |
|------|---------|
| OS | Windows 11 Version 25H2 (Build 26200.8457) |
| **Affected browser** | **Google Chrome 149.0.7827.102** (Chromium 149.0.7827.102) |
| **Also affected** | **Microsoft Edge 149.0.4022.62** (Chromium 149.0.7827.103) — after upgrade from 149.0.4022.52 |
| Not affected | Firefox 150.0.3 / 151.0.4, Microsoft Edge 149.0.4022.52 (Chromium 149.0.7827.54), Quark Browser 6.8.6.856, Electron (v39.2.7) built-in browser (Chromium 142.0.7444.235) |
| Editor framework | CodeMirror 6 (`@codemirror/view@6.43.0`) |
| React version | React 19 with Next.js 16 (issue persists without React) |
| IME tested | Microsoft Pinyin (微软拼音), QQ Pinyin (QQ拼音) |
| EditContext | **Not in use** — CodeMirror 6 only enables EditContext on Android (`browser.android`), not desktop Chrome |

### 2.1 Browser Version Details

**Google Chrome (affected):**
```
Google Chrome    149.0.7827.102 (正式版本) （64 位） (cohort: 149.0.7827.102 Rollout)
修订版本          112f665d98a2fe84b156c74fbea2aed742f16c15-refs/branch-heads/7827@{#2560}
操作系统          Windows 11 Version 25H2 (Build 26200.8457)
JavaScript       V8 14.9.207.27
用户代理          Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
```

**Microsoft Edge (unaffected, before upgrade):**
```
Microsoft Edge    149.0.4022.52 (正式版本) (64 位)
修订              ebf9b65f6b0d1b9609ca9b578ef4a30e51e17fe8
Chromium 版本     149.0.7827.54
操作系统          Windows 11 Version 25H2 (Build 26200.8457)
JavaScript        V8 14.9.20.6
用户代理          Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
```

**Microsoft Edge (affected, after upgrade to Chromium 149.0.7827.103):**
```
Microsoft Edge    149.0.4022.62 (正式版本) (64 位)
修订              068a180137b01f28d261b1343e49c85b6348d4f5
Chromium 版本     149.0.7827.103
操作系统          Windows 11 Version 25H2 (Build 26200.8457)
JavaScript        V8 14.9.20.8
用户代理          Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0
```

**Mozilla Firefox (unaffected):**
```
150.0.3 (64 位) → 151.0.4 (64 位) — both versions unaffected
```

**Quark Browser (unaffected):**
```
夸克              144.0.7559.86 (正式版本) （64 位）
修订版本          0692bb4c7f582f78a657917cddc1fef727422efe
操作系统          Windows 11 Version 25H2 (Build 26200.8457)
JavaScript        V8 14.4.258.18
```

**Critical finding:** Microsoft Edge was unaffected at Chromium 149.0.7827.54 but became affected after upgrading to Chromium 149.0.7827.103. This pinpoints the bug to a regression introduced between Chromium 149.0.7827.54 and 149.0.7827.103.

## 3. Detailed Symptom Description

### 3.1 General Rule

All English characters and symbols input via direct keyboard (not through IME composition) work correctly. The issue is **exclusively tied to IME composition input**.

### 3.2 Symptom A: Chinese Punctuation Requires Double Input

Using **Microsoft Pinyin**:

1. Switch to Chinese input mode
2. Press the period key (。) — **nothing appears** in the editor
3. Press the comma key (,) — the **comma (，)** appears, but the previously typed period (。) is still missing
4. Press the period key again — the **period (。)** now appears

In other words: each punctuation mark requires two attempts. The first attempt is silently discarded; the second attempt commits the character. This applies to all Chinese punctuation: 。，：；！？""''【】、《》（）

**Note:** The two inputs do not need to be the same symbol. For example, if the first input is a comma (，) and the second is a period (。), the period will be successfully committed. Conversely, if the first input is a period (。) and the second is a comma (，), the comma will succeed. The second IME composition always succeeds regardless of whether it matches the first. (Tested at https://web-text.ale160.com/)

### 3.3 Symptom B: QQ Pinyin — All IME Input Requires Double Input

Using **QQ Pinyin**:

1. Type `nihao` and select "你好" from the candidate list — **nothing appears** in the editor
2. Type `nibuhao` and select "你不好" — **"你不好"** appears, but the previous "你好" is still missing
3. The pattern reverses: the first composition of a session is always lost, the second succeeds

### 3.4 Symptom C: Microsoft Pinyin — Chinese Characters Work, Punctuation Doesn't

Using **Microsoft Pinyin**:

- Chinese character input (e.g., typing `nihao` + space to get "你好") works on the **first attempt**
- Chinese **punctuation** (。，：etc.) requires **two attempts** (see Symptom A)

This asymmetry between Microsoft Pinyin and QQ Pinyin suggests the bug is triggered by specific IME event sequences that differ between input methods.

## 4. Cross-Browser Verification

We performed systematic testing across multiple browsers on the same Windows machine, same editor, same input methods:

| Browser | Version | Chromium | Chinese Punctuation (微软拼音) | Chinese Characters (QQ拼音) | Status |
|---------|---------|----------|-------------------------------|----------------------------|--------|
| **Google Chrome** | 149.0.7827.102 | 149.0.7827.102 | **FAIL** (double input) | **FAIL** (double input) | **BUG** |
| **Microsoft Edge** | 149.0.4022.62 | 149.0.7827.103 | **FAIL** (double input) | **FAIL** (double input) | **BUG** |
| Microsoft Edge | 149.0.4022.52 | 149.0.7827.54 | OK | OK | Not affected |
| Electron (v39.2.7) built-in browser | Electron 39.2.7 | 142.0.7444.235 | OK | OK | Not affected |
| Mozilla Firefox | 150.0.3 / 151.0.4 | N/A | OK | OK | Not affected |
| Quark Browser | 144.0.7559.86 | 144.0.7559.86 | OK | OK | Not affected |

**Key observations:**

1. The bug is **not engine-wide** — other Chromium-based browsers with older versions do not exhibit the bug.
2. **Microsoft Edge became affected after upgrading from Chromium 149.0.7827.54 to 149.0.7827.103**, proving the bug is a regression in Chromium 149.0.7827.103 (or between .54 and .103).
3. The bug is in the **Chromium engine's IME integration**, not in Chrome-specific code as initially suspected. Google Chrome simply shipped the affected Chromium version first.

## 5. Technical Analysis

### 5.1 Confirmed: Not a React or @uiw/react-codemirror Issue

We initially suspected the issue was caused by `@uiw/react-codemirror`'s controlled `value` prop synchronization mechanism, which dispatches `ExternalChange` transactions when the React `value` prop changes. To test this hypothesis, we completely bypassed the React wrapper and used CodeMirror 6's native `EditorView` API directly:

```typescript
// Direct CodeMirror 6 API — no React wrapper, no value prop sync
const view = new EditorView({
  state: EditorState.create({
    doc: value,
    extensions: [markdown(), EditorView.lineWrapping, updateListener],
  }),
  parent: container,
});
```

**Result: The bug still persists in Chrome.** This confirms the issue is not in the React wrapper or the value synchronization mechanism, but in Chrome's own IME event handling.

### 5.2 First IME Composition Has No Events At All

A critical observation: when the first IME composition input is lost, **no events are dispatched at all** — not `compositionstart`, not `beforeinput`, not `input`, not `compositionend`. Chrome silently discards the first IME composition at the browser level. The IME text is committed by the OS but never reaches the web page's event system.

On the second input attempt, all events fire normally (`compositionstart`, `beforeinput`, `input`, `compositionend`), and the text is successfully committed.

This means the previously hypothesized event sequence (compositionstart → beforeinput → compositionend → beforeinput(insertText)) does **not** apply to the first input — because **no events fire at all** for the first input. The bug is not a race condition in event timing; it is a complete suppression of the first IME composition event sequence.

### 5.3 Why Other Browsers Are Not Affected

- **Firefox**: Uses a different composition event model. IME events are dispatched correctly on the first attempt.
- **Edge (Chromium 149.0.7827.54)**: Uses an older Chromium version that does not contain the regression. After upgrading to Chromium 149.0.7827.103, Edge exhibits the same bug, confirming the regression is in the Chromium engine.
- **Electron (v39.2.7) built-in browser (Chromium 142.0.7444.235)**: Uses an older Chromium version that does not contain the regression.
- **Quark Browser**: Custom Chromium fork that has not picked up the regression.

### 5.4 EditContext Is Not the Cause

We verified that CodeMirror 6's `EditContext` API is **only enabled on Android** (`browser.android` check in `@codemirror/view@6.43.0`). Desktop Chrome uses the traditional `contenteditable` + `compositionstart/compositionend` event model. Therefore, this is not related to the previously reported Chromium Bug #351029417 (EditContext IME character bounds issue).

### 5.5 CodeMirror's Own compositionend Handling

In `@codemirror/view@6.43.0`, the `compositionend` handler for non-Android desktop browsers:

```javascript
observers.compositionend = view => {
    if (view.observer.editContext) return;
    view.inputState.composing = -1;
    view.inputState.compositionEndedAt = Date.now();
    view.inputState.compositionPendingKey = true;
    view.inputState.compositionPendingChange = view.observer.pendingRecords().length > 0;
    view.inputState.compositionFirstChange = null;
    if (browser.chrome && browser.android) {
        view.observer.flushSoon(); // Android only
    } else if (view.inputState.compositionPendingChange) {
        Promise.resolve().then(() => view.observer.flush());
    } else {
        setTimeout(() => {
            if (view.inputState.composing < 0 && view.docView.hasComposition)
                view.update([]);
        }, 50);
    }
};
```

For desktop Chrome, the code falls into the `else` branch, using a 50ms `setTimeout` to clear the composition view. However, since the first IME composition produces **no events at all**, this handler is never invoked for the first input, and the issue cannot be mitigated at the CodeMirror level.

## 6. Steps to Reproduce

### 6.1 Minimal Reproduction Setup

Any CodeMirror 6 editor instance in Chrome on Windows will reproduce this. For a concrete example:

1. Open https://web-text.ale160.com/ (our test environment) in Google Chrome (149+) on Windows
2. Click into the editor to focus it
3. Switch to a Chinese IME (Microsoft Pinyin or QQ Pinyin)
4. Try typing a Chinese period (。) — observe it does not appear
5. Type another character — observe the second character appears but the first is lost

### 6.2 Our Specific Reproduction Environment

Our project is a Next.js 16 + React 19 web application with a Markdown editor built on:

```
@codemirror/view@6.43.0
@codemirror/state@6.5.2
@codemirror/lang-markdown@6.3.2
```

We tested with both `@uiw/react-codemirror@4.25.10` (React wrapper) and direct CodeMirror 6 `EditorView` API — the bug persists in both cases.

### 6.3 Detailed Reproduction Steps

**Scenario 1: Chinese Punctuation (Microsoft Pinyin)**

1. Open https://web-text.ale160.com/ (our test environment) in Chrome on Windows
2. Switch to edit mode
3. Click the editor to focus
4. Switch input method to Microsoft Pinyin (微软拼音)
5. Press the `.` key (period) — expect `。` to appear
6. **Actual**: Nothing appears. The first input is silently lost.
7. Press the `,` key (comma) — expect `，` to appear
8. **Actual**: `，` appears, confirming the second input succeeds

**Scenario 2: Chinese Characters (QQ Pinyin)**

1. Open https://web-text.ale160.com/ (our test environment) in Chrome on Windows
2. Switch to edit mode
3. Click the editor to focus
4. Switch input method to QQ Pinyin (QQ拼音)
5. Type `nihao` on the keyboard
6. Select "你好" from the candidate popup
7. **Actual**: Nothing appears in the editor. The first composition is lost.
8. Type `nihao` again and select "你好"
9. **Actual**: "你好" appears, confirming the second composition succeeds

## 7. Our Debugging and Fix Attempt History

We spent extensive time investigating this issue before identifying it as a Chromium engine regression. Here is a summary of our debugging journey:

### Attempt 1: Composition Event Guard
Added `!update.composing` checks in `onChange` and `setTimeout(0)` in `handleCompositionEnd`. **Result**: No improvement.

### Attempt 2: Remove Manual Composition Listeners
Removed all manual `compositionstart/end` listeners, relying solely on CodeMirror's built-in `update.composing`. **Result**: No improvement.

### Attempt 3: Switch to @uiw/react-codemirror React Component
Rewrote the editor to use `@uiw/react-codemirror`'s `CodeMirror` React component instead of a custom `EditorView`. **Result**: No improvement.

### Attempt 4: Comprehensive Console Logging
Added detailed `onUpdate` and `onChange` logging to trace every transaction, annotation, and DOM change. **Result**: Discovered that `update.composing` returns `undefined` (not `false`) in this CodeMirror version, and that `@uiw/react-codemirror` has an internal `typingLatch` mechanism (200ms `TimeoutLatch`) with `ExternalChange` annotations.

### Attempt 5: Cross-Browser Testing
Systematically tested in Chrome, Firefox, Edge, Quark, and Electron (v39.2.7) built-in browser. **Result**: Identified that **only Google Chrome** exhibits the bug, initially suggesting a browser-specific issue.

### Attempt 6: Composition Buffering Workaround
Implemented a buffering mechanism in `handleChange` that detects `viewUpdate.composing` state, buffers onChange calls during composition, and flushes after a 50ms delay post-composition. **Result**: No improvement — the first IME input never reaches the JavaScript event system at all.

### Attempt 7: Remove internalValue State, Stabilize handleChange
Removed the `internalValue` state and `useEffect` synchronization that was causing React re-render race conditions. Made `handleChange` stable with empty dependency array. **Result**: No improvement — the bug is not caused by React re-renders.

### Attempt 8: Bypass @uiw/react-codemirror Entirely
Completely removed the `@uiw/react-codemirror` React wrapper and used CodeMirror 6's native `EditorView` API directly, creating the editor in a single `useEffect([], [])` with no value prop synchronization. **Result**: No improvement — the bug persists even without any React value sync mechanism. This conclusively proves the issue is in Chromium's IME event handling, not in the application code.

### Attempt 9: Edge Upgrade Regression Test
Upgraded Microsoft Edge from Chromium 149.0.7827.54 to 149.0.7827.103. **Result**: Edge went from unaffected to affected, confirming the bug is a Chromium engine regression introduced between Chromium 149.0.7827.54 and 149.0.7827.103.

## 8. Related Issues

| Reference | Title | Status | Relevance |
|-----------|-------|--------|-----------|
| Chromium #351029417 | IME candidate window position incorrect with EditContext | Fixed (Sep 2024) | Same general area (IME + contenteditable), but different symptom. EditContext not involved in our case. |
| CodeMirror dev #1396 | Chinese input method abnormal in 6.28.2 | Fixed (6.28.3/6.28.4) | Related — Chrome IME handling in CodeMirror. Different symptom (candidate box position, not input loss). |
| CodeMirror dev #1688 | Text disappears after IME composition in brackets on Chrome | Closed | Related — Chrome `compositionend` synchronous timing causing DOM issues. |
| CodeMirror dev #1654 | IME composition problem in decoration | Fixed (6.39.7) | Related — Chrome DOM node reuse during composition. |
| CodeMirror dev #1472 | Characters offset during IME composition | Fixed | Related — EditContext composition text offset handling. |
| Chromium #379170477 | EditContext change-while-composition text offset | Open | Related — EditContext IME handling. |

## 9. Suggested Investigation Areas for Chromium Team

1. **First IME composition event suppression**: The most critical finding is that Chromium silently suppresses the first IME composition — no `compositionstart`, `beforeinput`, `input`, or `compositionend` events are dispatched for the first IME input after editor focus. Investigate why Chromium's Windows IME integration fails to dispatch these events on the first composition.

2. **Regression between Chromium 149.0.7827.54 and 149.0.7827.103**: Microsoft Edge was unaffected at Chromium 149.0.7827.54 but became affected at 149.0.7827.103. Identify the exact commit that introduced the regression by bisecting between these two versions, focusing on IME-related changes.

## 10. Impact Assessment

This bug affects **all web-based editors** built on CodeMirror 6 (and potentially other contenteditable-based editors) when used in Chromium 149.0.7827.103+ on Windows with Chinese/Japanese/Korean IME. Given that:

- Chrome has ~65% global browser market share
- Chinese users represent Chrome's largest user base (900M+)
- CodeMirror 6 is used by thousands of web applications (documentation sites, note-taking apps, IDEs, CMS systems)
- The bug makes basic Chinese text input fundamentally broken
- The regression has now spread to Microsoft Edge as well

This constitutes a **critical usability regression** for a significant portion of Chromium-based browser users.

## 11. Temporary Workaround for Developers

Until this bug is fixed in Chromium, there is no reliable application-level workaround. We have exhausted all approaches at the JavaScript/React level:

- **Composition event buffering**: Does not work because the first IME input never reaches JavaScript events at all.
- **Bypassing React wrapper**: Does not work because the bug is in Chromium's event dispatch, not in the application code.
- **Direct CodeMirror 6 API**: Does not work for the same reason.

The only viable workarounds are:

1. **Recommend users switch to a different browser** (Firefox, Quark) for CJK input, or use an older Chromium version (before 149.0.7827.103).
2. **Monitor the CodeMirror issue tracker** for a Chromium-specific fix or workaround at the editor library level.
3. **File a Chromium bug report** at https://bugs.chromium.org/ to bring this to the Chromium team's attention.

## 12. References

- **Test application**: https://web-text.ale160.com/
- **洛谷公告 (Luogu announcement — Chinese community confirmation)**: https://www.luogu.com.cn/discuss/1303381
- **CodeMirror forum discussion (high community attention)**: https://discuss.codemirror.net/t/chinese-ime-punctuation-input-loses-every-other-keypress-requires-2-presses-per-character/9741
- **W3C official mailing list (root cause: Chrome error)**: https://lists.w3.org/Archives/Public/public-webapps-github/2025Apr/0087.html
