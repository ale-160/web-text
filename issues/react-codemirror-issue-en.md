## ⚠️ Heads Up: Chromium 149+ IME Regression Causing Chinese Input Issues (Not a Library Bug)

### A Note Before You Read

This is not a request for you to fix code — we want you to be aware and help communicate this to the community.

Our team's technical capabilities are limited — much of the verification process was assisted by AI tools. This English Issue was drafted with the help of translation tools; the Chinese version is the reviewed and authoritative one.

We kindly request the @uiw/react-codemirror team to help verify this issue. In parallel, we have also submitted an Issue to the CodeMirror official team requesting their help in verifying and escalating this to the Chromium team. If this issue is confirmed, you may want to post an announcement or pin this Issue for your users. Our verification process also documents alternative solutions, such as using browsers prior to certain Chromium versions.

**Chinese Version (中文版本):** https://github.com/ale-160/web-text/blob/master/issues/react-codemirror-issue.md
**Detailed technical analysis report (drafted with translation tools):** https://github.com/ale-160/web-text/blob/master/docs/CHROME_IME_BUG_REPORT_EN.md

---

### Issue Description

A Chromium engine regression (149.0.7827.103+) on Windows desktop causes the first IME composition input to be silently lost in all CodeMirror 6 editors. This also affects `@uiw/react-codemirror` users.

We have confirmed this is **not** a `@uiw/react-codemirror` issue — the bug persists even when:
- Completely bypassing `@uiw/react-codemirror` and using CodeMirror 6's native `EditorView` API
- Removing all controlled `value` prop synchronization
- Disabling the internal `typingLatch` mechanism

### Environment

| Package | Version |
|---------|---------|
| `@uiw/react-codemirror` | 4.25.10 |
| `@codemirror/view` | 6.43.0 |
| `@codemirror/state` | 6.6.0 |
| React | 19.2.4 |
| Next.js | 16.2.4 |
| Browser (affected) | Chrome 149.0.7827.102, Edge 149.0.4022.62 (Chromium 149.0.7827.103) |
| Browser (unaffected) | Microsoft Edge 149.0.4022.52 (Chromium 149.0.7827.54), Quark Browser (Chromium 144.0.7559.86), Firefox 150/151, Electron built-in browser (Chromium 142.0.7444.235) |
| OS | Windows 11 |
| IME | Microsoft Pinyin, QQ Pinyin |

### Symptoms

- **Microsoft Pinyin:** Chinese punctuation (。，：) requires two presses per character. First press → nothing. Second press → character appears.
- **QQ Pinyin:** All IME input (characters + punctuation) requires two attempts. First composition always lost, second succeeds. Some symbols also move the input cursor, e.g. 【 】 ' '.
- **Root cause:** Chromium 149.0.7827.103+ suppresses the first IME composition events entirely — no `compositionstart`, `beforeinput`, or `compositionend` events are dispatched.

### Browser Comparison

| Browser | Affected? |
|---------|-----------|
| Chrome 149.0.7827.102 | **YES** |
| Edge 149.0.4022.62 | **YES** |
| Edge 149.0.4022.52 (Chromium 149.0.7827.54) | No |
| Firefox 150/151 | No |
| Quark Browser | No |
| Electron built-in browser | No |

### Why This Matters to @uiw/react-codemirror

This is most likely a Chromium bug rather than a library issue, but users encountering the bug will likely:
1. Suspect the React wrapper or the editor configuration is at fault
2. Search `@uiw/react-codemirror` Issues for similar reports
3. Potentially file Issues here thinking it's a library problem

### Suggested Action

1. **Pin this issue** as a known upstream bug, so users who encounter it can immediately find the explanation
2. **Add documentation** (or a warning banner in the README) about the Chromium 149+ IME regression
3. **Monitor the Chromium tracker** for the fix so you can update your documentation when it's resolved

### Alternative Solutions (from our verification)

If you want to recommend temporary workarounds to your users:

- Use browsers with Chromium versions prior to 149.0.7827.54, or switch to Firefox or Quark Browser
- For Chrome or Edge users, avoid upgrading the browser version (disable auto-update, do not check version — checking version may trigger auto-update)

### Reproduction

Then open our online demo https://web-text.ale160.com/ or CodeMirror official try page https://codemirror.net/try/ on Windows with Chrome 149+, switch to Microsoft Pinyin, and try typing Chinese punctuation.

