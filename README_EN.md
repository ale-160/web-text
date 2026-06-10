# web-text

English | [中文](README.md)

A simple and elegant online Markdown editor. All data is saved locally in your browser, no privacy concerns.

Live demo: [https://web-text.ale160.com/](https://web-text.ale160.com/)

Personal website: [http://ale160.com/](http://ale160.com/)

## Features

- **Real-time Preview** — Edit on the left, see the rendered result on the right
- **Syntax Highlighting** — Support for multiple programming languages
- **Auto-save** — Content automatically saved to browser local storage
- **History** — Auto-saves last 50 versions, restore anytime
- **Dark Mode** — Toggle light and dark themes
- **Export** — Export as `.md` file or copy to clipboard
- **Multi-language** — Supports Chinese and English interfaces
- **Fullscreen** — Immersive editing experience

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- CodeMirror 6
- shadcn/ui

## Local Development

```bash
# Clone the repository
git clone https://github.com/ale-160/web-text.git
cd web-text

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Known Issues

### Chromium 149.0.7827.103+ Chinese IME Bug

On Windows desktop, Chromium 149.0.7827.103 and above (including Google Chrome and Microsoft Edge) has a severe IME (Input Method Editor) regression bug:

- **Symptom**: The first IME composition input is silently lost; you need to type twice for it to be committed
- **Scope**: All `contenteditable`-based web editors, including CodeMirror 6
- **Not affected**: Firefox, Quark Browser, Electron built-in browser, Chromium 149.0.7827.54 and earlier

**Workarounds**:
- If using Chrome or Edge, **do not upgrade your browser** (browsers auto-check for updates; consider disabling auto-update)
- Switch to Firefox or Quark Browser for Chinese input

Bug report. See `docs/CHROME_IME_BUG_REPORT_EN.md` for details.

## License

Apache License 2.0

## About

Developed and maintained by [ale-160](http://ale160.com/).
