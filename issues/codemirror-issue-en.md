## ⚠️ Chromium 149+ IME Regression: First composition input lost on Windows (contenteditable, not EditContext)

### A Note Before You Read

Our team is based in China and does not have access to a Google account to file bugs directly on the Chromium issue tracker. Our technical capabilities are also limited — much of the verification process was assisted by AI tools. This English Issue was drafted with the help of translation tools; the Chinese version is the reviewed and authoritative one.

We would be grateful if the CodeMirror team could help verify this issue and, if confirmed, escalate it to the Chromium team. We noticed the CodeMirror team (particularly the maintainer) has directly reported IME-related bugs to Chromium in the past (e.g., #351029417), and has good communication channels with Chromium developers.

**Chinese Version (中文版本):** https://github.com/ale-160/web-text/blob/main/issues/codemirror-issue.md
**Detailed technical analysis report (drafted with translation tools):** https://github.com/ale-160/web-text/blob/master/docs/CHROME_IME_BUG_REPORT_EN.md

---

### Environment

- `@codemirror/view`: 6.43.0
- `@codemirror/state`: 6.6.0
- `@codemirror/lang-markdown`: 6.5.0
- Browser: Google Chrome 149.0.7827.102 (Chromium 149.0.7827.102) / Microsoft Edge 149.0.4022.62 (Chromium 149.0.7827.103)
- OS: Windows 11
- IME: Microsoft Pinyin, QQ Pinyin

### What happened?

On Windows desktop with Chromium 149+, the **first IME composition input is silently discarded** in CodeMirror 6 editors. The user must type the same content a second time for it to be committed.

**Symptom A (Microsoft Pinyin):** Chinese punctuation (。，：；！？""'' etc.) requires two presses per character. First press → nothing. Second press → character appears.

**Symptom B (QQ Pinyin):** All IME input (both Chinese characters and punctuation) requires two attempts. First composition lost, second succeeds. Some symbols also move the input cursor, e.g. 【 】 ' '.

### What is expected?

First IME composition input should work correctly, as it does in Firefox, Quark Browser, Electron built-in browser, and Chromium 149.0.7827.54.

### Browser comparison table

| Browser | Chromium Version | Affected? |
|---------|-----------------|-----------|
| Google Chrome 149.0.7827.102 | 149.0.7827.102 | **YES** |
| Microsoft Edge 149.0.4022.62 | 149.0.7827.103 | **YES** |
| Microsoft Edge 149.0.4022.52 | 149.0.7827.54 | No |
| Electron built-in browser | 142.0.7444.235 | No |
| Firefox 150/151 | N/A | No |
| Quark Browser | 144.0.7559.86 | No |

### Key findings

1. **Not an EditContext issue.** EditContext is only enabled on Android in `@codemirror/view@6.43.0` (`browser.android` check at line 7094). Desktop Chrome uses traditional `contenteditable` mode.

2. **Not React or @uiw/react-codemirror.** We bypassed the React wrapper entirely and used CodeMirror 6's native `EditorView` API directly — the bug persists.

3. **First IME input: no events dispatched at all.** We verified by adding event listeners to document root:
   ```javascript
   document.addEventListener('compositionstart', () => console.log('[IME] compositionstart'), true);
   document.addEventListener('compositionend', () => console.log('[IME] compositionend'), true);
   document.addEventListener('beforeinput', (e) => console.log('[IME] beforeinput:', e.inputType, e.data), true);
   ```
   On the first IME input: **zero console output**. On the second: all events fire normally.

4. **Presumed to be a Chromium engine regression.** Edge 149.0.4022.52 (Chromium 149.0.7827.54) was unaffected. After upgrading to Edge 149.0.4022.62 (Chromium 149.0.7827.103), the bug appeared. The regression is between 149.0.7827.54 and 149.0.7827.103.

### Reproduction

1. Open any CodeMirror 6 editor in Chrome 149+ on Windows (e.g. our online demo https://web-text.ale160.com/ or CodeMirror official try page https://codemirror.net/try/)
2. Click to focus
3. Switch to Microsoft Pinyin
4. Press `.` (period) → nothing appears
5. Press `,` (comma) → `，` appears, but the period is still missing

Source code: https://github.com/ale-160/web-text.git

### Community confirmations

This has been independently reported in:
- Luogu (Chinese programming community): https://www.luogu.com.cn/discuss/1303381
- W3C mailing list: https://lists.w3.org/Archives/Public/public-webapps-github/2025Apr/0087.html
- CodeMirror forum: https://discuss.codemirror.net/t/chinese-ime-punctuation-input-loses-every-other-keypress-requires-2-presses-per-character/9741

