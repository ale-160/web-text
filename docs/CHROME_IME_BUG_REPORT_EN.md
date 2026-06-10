# Bug Report: First IME Composition Input Lost in Chromium 149+ on Windows

**Reporter:** Web-text project team
**Date:** 2026-06-10
**Affected Component:** Chromium engine Windows desktop IME composition event dispatch
**Severity:** High — causes abnormal Chinese/Japanese/Korean input in contenteditable-based editors
**Scope:** Chromium 149.0.7827.103+ on Windows desktop (including Google Chrome and Microsoft Edge); other browsers and older Chromium versions are unaffected

---

## 1. Summary

In Google Chrome (149+) on Windows desktop, when using an IME (Input Method Editor) to input content into a `contenteditable` element, **the first composition input is silently discarded**. The user must input the same content a second time for it to be successfully committed to the editor. With Microsoft Pinyin, Chinese punctuation (period, comma, colon, etc.) requires two presses per character; with QQ Pinyin, all Chinese input (both characters and punctuation) requires two attempts.

**This is a Chromium engine regression.** We confirmed through systematic cross-browser testing that Firefox, Quark Browser, and Electron (v39.2.7) built-in browser are unaffected. Notably, Microsoft Edge was also unaffected until it was upgraded to Chromium 149.0.7827.103, after which it exhibited the same bug — confirming the root cause lies in code changes introduced in Chromium 149.0.7827.103+.

We also confirmed this is **not** a React or `@uiw/react-codemirror` issue — we completely bypassed the React wrapper and used CodeMirror 6's native `EditorView` API directly, and the bug still persists.

## 2. Environment

| Item | Details |
|------|---------|
| OS | Windows 11 Version 25H2 (Build 26200.8457) |
| **Affected browser** | **Google Chrome 149.0.7827.102** (Chromium 149.0.7827.102) |
| **Also affected** | **Microsoft Edge 149.0.4022.62** (Chromium 149.0.7827.103) — appeared after upgrade from 149.0.4022.52 |
| Not affected | Firefox 150.0.3 / 151.0.4, Microsoft Edge 149.0.4022.52 (Chromium 149.0.7827.54), Quark Browser 144.0.7559.86, Electron (v39.2.7) built-in browser (Chromium 142.0.7444.235) |
| Editor framework | CodeMirror 6 (`@codemirror/view@6.43.0`) |
| React version | React 19 + Next.js 16 (issue persists without React) |
| IME tested | Microsoft Pinyin, QQ Pinyin |
| EditContext | **Not enabled** — CodeMirror 6 only enables EditContext on Android (`browser.android`); desktop Chrome uses the traditional contenteditable model |

### 2.1 Browser Version Details

**Google Chrome (affected):**
```
Google Chrome    149.0.7827.102 (Official Build) (64-bit)
Revision         112f665d98a2fe84b156c74fbea2aed742f16c15
OS               Windows 11 Version 25H2 (Build 26200.8457)
JavaScript       V8 14.9.207.27
```

**Microsoft Edge (unaffected, before upgrade):**
```
Microsoft Edge    149.0.4022.52 (Official Build) (64-bit)
Chromium version  149.0.7827.54
JavaScript        V8 14.9.20.6
```

**Microsoft Edge (affected, after upgrade to Chromium 149.0.7827.103):**
```
Microsoft Edge    149.0.4022.62 (Official Build) (64-bit)
Chromium version  149.0.7827.103
JavaScript        V8 14.9.20.8
```

**Mozilla Firefox (unaffected):**
```
150.0.3 (64-bit) → 151.0.4 (64-bit) — both versions unaffected
```

**Quark Browser (unaffected):**
```
Quark             144.0.7559.86 (Official Build) (64-bit)
Revision          0692bb4c7f582f78a657917cddc1fef727422efe
OS                Windows 11 Version 25H2 (Build 26200.8457)
JavaScript        V8 14.4.258.18
```

**Critical finding:** Microsoft Edge was unaffected at Chromium 149.0.7827.54 but became affected after upgrading to Chromium 149.0.7827.103. This precisely pinpoints the regression to changes introduced between Chromium 149.0.7827.54 and 149.0.7827.103.

## 3. Detailed Symptom Description

### 3.1 General Rule

All English characters and symbols input via direct keyboard (not through IME composition) work correctly. The issue is **exclusively tied to IME composition input**.

### 3.2 Symptom A: Chinese Punctuation Requires Double Input

Using **Microsoft Pinyin**:

1. Switch to Chinese input mode
2. Press the period key twice — only the second **period (。)** appears
3. Or: press period once (nothing appears), then press comma — the **comma (，)** appears, but the previous period is still missing

All Chinese punctuation marks require two presses: ，《》。、？；：""{}|·!￥……&()—— etc.

Other known issues:
- `【` or `'` moves the input cursor to the left
- `】` or `'` moves the input cursor to the right

**Note:** The two inputs do not need to be the same symbol. For example, if the first input is a comma (，) and the second is a period (。), the period will be successfully committed. The second IME composition always succeeds regardless of whether it matches the first. (See reproduction steps in 6.1 or 6.2)

### 3.3 Symptom B: QQ Pinyin — All IME Input Requires Double Input

Using **QQ Pinyin**:

1. Type `nihao` and select "你好" from the candidate list — **nothing appears** in the editor
2. Type `nibuhao` and select "你不好" — **"你不好"** appears, but the previous "你好" is still missing
3. Pattern: the first composition of a session is always lost, the second succeeds

### 3.4 Symptom C: Microsoft Pinyin — Chinese Characters Work, Punctuation Doesn't

Using **Microsoft Pinyin**:

- Chinese character input (e.g., typing `nihao` + space to get "你好") works on the **first attempt**
- Chinese **punctuation** (。，：etc.) requires **two attempts** (see Symptom A)

This asymmetry between Microsoft Pinyin and QQ Pinyin suggests the bug is triggered by specific IME event sequences that differ between input methods.

## 4. Cross-Browser Verification

We performed systematic testing across multiple browsers on the same Windows machine, same editor, same input methods:

| Browser | Version | Chromium Version | Chinese Punctuation (Microsoft Pinyin) | Chinese Characters (QQ Pinyin) | Status |
|---------|---------|------------------|---------------------------------------|-------------------------------|--------|
| **Google Chrome** | 149.0.7827.102 | 149.0.7827.102 | **FAIL** (double input) | **FAIL** (double input) | **BUG** |
| **Microsoft Edge** | 149.0.4022.62 | 149.0.7827.103 | **FAIL** (double input) | **FAIL** (double input) | **BUG** |
| Microsoft Edge | 149.0.4022.52 | 149.0.7827.54 | OK | OK | Not affected |
| Electron (v39.2.7) built-in browser | Electron 39.2.7 | 142.0.7444.235 | OK | OK | Not affected |
| Mozilla Firefox | 150.0.3 / 151.0.4 | N/A | OK | OK | Not affected |
| Quark Browser | 144.0.7559.86 | 144.0.7559.86 | OK | OK | Not affected |

**Key observations:**

1. The bug is more likely located in the **Chromium engine's IME integration logic**, rather than Google Chrome-specific code. In our testing, browsers using older Chromium versions did not exhibit the same behavior.
2. **Microsoft Edge became affected after upgrading from Chromium 149.0.7827.54 to 149.0.7827.103**, indicating the regression was likely introduced between these two versions.

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

### 5.2 Core Finding: No IME-Related Events Observed During First Abnormal Input

Neither the editor's internal listeners nor external listeners received any IME-related events (`compositionstart`, `beforeinput`, `input`, `compositionend`) during the first abnormal input.

This suggests that Chromium may be suppressing the first IME composition events, or failing to dispatch them correctly. On the second input attempt, all related events fire normally.

The exact root cause requires further investigation by the Chromium team.

**Verification method:** Execute the following code in Chrome DevTools Console, then try inputting Chinese punctuation:

```javascript
document.addEventListener('compositionstart', () => console.log('[IME] compositionstart'), true);
document.addEventListener('compositionend', () => console.log('[IME] compositionend'), true);
document.addEventListener('beforeinput', (e) => console.log('[IME] beforeinput:', e.inputType, e.data), true);
```

On the first input, there are **no logs at all** in the Console. On the second input, all events print normally.

### 5.3 Why Other Browsers Are Not Affected

- **Firefox**: Uses a different composition event model. IME events are dispatched correctly on the first attempt.
- **Edge (Chromium 149.0.7827.54)**: Uses an older Chromium version that does not contain the regression. After upgrading to Chromium 149.0.7827.103, Edge exhibits the same bug, confirming the regression is in the Chromium engine.
- **Electron (v39.2.7) built-in browser (Chromium 142.0.7444.235)**: Uses an older Chromium version that does not contain the regression.
- **Quark Browser**: Custom Chromium fork that has not picked up the regression.

### 5.4 EditContext Is Not the Cause

We verified that CodeMirror 6's `EditContext` API is **only enabled on Android** (`browser.android` check in `@codemirror/view@6.43.0`). Desktop Chrome uses the traditional `contenteditable` + `compositionstart/compositionend` event model. Therefore, this is not related to the previously reported Chromium Bug #351029417 (EditContext IME character bounds issue).

## 6. Steps to Reproduce

### 6.1 Minimal Reproduction

Steps to reproduce:

1. On Windows, open Google Chrome (149+)
   - Live demo: https://web-text.ale160.com/
   - Source code: https://github.com/ale-160/web-text
2. Click into the editor to focus it
3. Switch to a Chinese IME (Microsoft Pinyin or QQ Pinyin)
4. Try typing a Chinese period (。) — observe it does not appear
5. Type another character — observe the second character appears but the first is lost

### 6.2 Detailed Reproduction Steps

1. On Windows, open the [live demo](https://web-text.ale160.com/) or [local test](http://localhost:3000) in Chrome
2. Click the editor to focus

**Scenario 1: Chinese Punctuation (Microsoft Pinyin)**

1. Switch input method to Microsoft Pinyin
2. Press the `.` key (period) — expect `。` to appear
3. **Actual**: Nothing appears. The first input is silently lost.
4. Press the `,` key (comma) — expect `，` to appear
5. **Actual**: `，` appears, confirming the second input succeeds

**Scenario 2: Chinese Characters (QQ Pinyin)**

1. Switch input method to QQ Pinyin
2. Type `nihao` on the keyboard
3. Select "你好" from the candidate popup
4. **Actual**: Nothing appears. The first composition is lost.
5. Type `nihao` again and select "你好"
6. **Actual**: "你好" appears, confirming the second composition succeeds

## 7. Our Debugging and Fix Attempt History

We spent extensive time investigating this issue before identifying it as a Chromium engine regression. Below is a summary of our debugging process:

### Attempt 1: Composition Event Guard
Added `!update.composing` checks in `onChange` and `setTimeout(0)` in `handleCompositionEnd`. **Result**: No improvement.

### Attempt 2: Remove Manual Composition Listeners
Removed all manual `compositionstart/end` listeners, relying solely on CodeMirror's built-in `update.composing`. **Result**: No improvement.

### Attempt 3: Switch to @uiw/react-codemirror React Component
Rewrote the editor to use `@uiw/react-codemirror`'s `CodeMirror` React component instead of a custom `EditorView`. **Result**: No improvement.

### Attempt 4: Comprehensive Console Logging
Added detailed `onUpdate` and `onChange` logging to trace every transaction, annotation, and DOM change. **Result**: Discovered that `update.composing` returns `undefined` (not `false`) in this CodeMirror version, and that `@uiw/react-codemirror` has an internal `typingLatch` mechanism (200ms `TimeoutLatch`) with `ExternalChange` annotations.

### Attempt 5: Cross-Browser Testing
Systematically tested in Chrome, Firefox, Edge, Quark, and Electron (v39.2.7) built-in browser. **Result**: Initially identified that only Google Chrome exhibited the bug.

### Attempt 6: Composition Buffering Workaround
Implemented a buffering mechanism in `handleChange` that detects `viewUpdate.composing` state, buffers onChange calls during composition, and flushes after a 50ms delay post-composition. **Result**: No improvement — the first IME input never reaches the JavaScript event system at all.

### Attempt 7: Remove internalValue State
Removed the `internalValue` state and `useEffect` synchronization that was causing React re-render race conditions. **Result**: No improvement — the bug is not caused by React re-renders.

### Attempt 8: Bypass @uiw/react-codemirror Entirely
Completely removed the `@uiw/react-codemirror` React wrapper and used CodeMirror 6's native `EditorView` API directly, creating the editor in a single `useEffect([], [])` with no value prop synchronization. **Result**: No improvement — the bug persists even without any React value sync mechanism. This conclusively proves the issue is in Chromium's IME event handling, not in the application code.

### Attempt 9: Edge Upgrade Regression Test
Upgraded Microsoft Edge from Chromium 149.0.7827.54 to 149.0.7827.103. **Result**: Edge went from unaffected to affected, confirming the bug is a Chromium engine regression introduced between Chromium 149.0.7827.54 and 149.0.7827.103.

## 8. Community Independent Confirmations and Related Issues

### 8.1 Community Independent Confirmations

This issue has been independently reported or discussed in multiple communities:

- Luogu (Chinese programming community)
- CodeMirror official forum
- W3C mailing list

These independent reports indicate that the issue is not caused by a single user's environment, and has been repeatedly observed by users across different communities.

### 8.2 Potentially Related Issues

| Reference | Title | Status | Relevance |
|-----------|-------|--------|-----------|
| Chromium #351029417 | IME candidate window position incorrect with EditContext | Fixed (Sep 2024) | Same general area (IME + contenteditable), but different symptom. EditContext not involved in our case. |
| CodeMirror dev #1396 | Chinese input method abnormal in 6.28.2 | Fixed (6.28.3/6.28.4) | Related — Chrome IME handling in CodeMirror. Different symptom (candidate box position, not input loss). |
| CodeMirror dev #1688 | Text disappears after IME composition in brackets on Chrome | Closed | Related — Chrome `compositionend` synchronous timing causing DOM issues. |
| CodeMirror dev #1654 | IME composition problem in decoration | Fixed (6.39.7) | Related — Chrome DOM node reuse during composition. |
| CodeMirror dev #1472 | Characters offset during IME composition | Fixed | Related — EditContext composition text offset handling. |
| Chromium #379170477 | EditContext change-while-composition text offset | Open | Related — EditContext IME handling. |

## 9. Suggested Investigation Areas for Chromium Team

1. **First IME composition event suppression**: The most critical finding is that Chromium silently suppresses the first IME composition — no `compositionstart`, `beforeinput`, `input`, or `compositionend` events are dispatched for the first IME input. Investigate why Chromium's Windows IME integration fails to dispatch these events on the first composition.

2. **Regression between Chromium 149.0.7827.54 and 149.0.7827.103**: Microsoft Edge was unaffected at Chromium 149.0.7827.54 but became affected at 149.0.7827.103. Identify the exact commit that introduced the regression by bisecting between these two versions, focusing on IME-related changes.

## 10. Impact Assessment

This bug has been observed to **affect editors based on CodeMirror 6** (and potentially other contenteditable-based editors) when used in Chromium 149.0.7827.103+ on Windows desktop with Chinese/Japanese/Korean IME. Given that:

- Chrome has ~65% global browser market share
- CodeMirror 6 is used by thousands of web applications (documentation sites, note-taking apps, IDEs, CMS systems)
- This bug causes basic Chinese character/partial IME Chinese input to be unavailable
- This bug significantly impacts the Chinese input experience and causes partial input content loss
- The regression has spread to Microsoft Edge

For CodeMirror users who rely on IME input, this constitutes a **significant usability regression**.

## 11. Temporary Workaround

Until this bug is fixed in Chromium, there is no reliable application-level workaround. We have exhausted all approaches at the JavaScript/React level:

- **Composition event buffering**: Does not work because the first IME input never reaches JavaScript events at all.
- **Bypassing React wrapper**: Does not work because the bug is in Chromium's event dispatch, not in the application code.
- **Direct CodeMirror 6 API**: Does not work for the same reason.

The only viable workarounds are:

1. **Recommend users switch to a different browser** (Firefox, Quark) for Chinese input, or use an older Chromium version (before 149.0.7827.103).
2. **Monitor the CodeMirror Issue Tracker** for a Chromium-specific fix or workaround at the editor library level.
3. **File a Chromium bug report** (https://bugs.chromium.org/) to bring this to the Chromium team's attention.

## 12. References

- **Live demo**: https://web-text.ale160.com/
- **Reproduction project source code**: https://github.com/ale-160/web-text
- **Luogu announcement (Chinese community confirmation)**: https://www.luogu.com.cn/discuss/1303381
- **CodeMirror forum discussion (high community attention)**: https://discuss.codemirror.net/t/chinese-ime-punctuation-input-loses-every-other-keypress-requires-2-presses-per-character/9741
- **W3C official mailing list (root cause: Chrome error)**: https://lists.w3.org/Archives/Public/public-webapps-github/2025Apr/0087.html

For more precise details, see the [Chinese version](https://github.com/ale-160/web-text/blob/master/docs/CHROME_IME_BUG_REPORT.md) of this report .
