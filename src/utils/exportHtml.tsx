/**
 * Markdown → 完整 HTML 文档导出（客户端渲染，懒加载）
 */
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

const EXPORT_CSS = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; background: #fff; color: #1f2937; }
  .container { max-width: 800px; margin: 0 auto; padding: 48px 24px; line-height: 1.8; }
  h1, h2, h3, h4 { color: #111827; margin-top: 2em; }
  h1 { font-size: 2rem; border-bottom: 3px solid #9ca3af; padding-bottom: 0.6rem; }
  h2 { font-size: 1.6rem; border-bottom: 2px solid #d1d5db; padding-bottom: 0.4rem; }
  h3 { font-size: 1.3rem; }
  p { margin: 1em 0; }
  a { color: #2563eb; }
  img { max-width: 100%; border-radius: 8px; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; background: #e5e7eb; color: #be185d; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.875em; }
  pre { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 8px; overflow-x: auto; }
  pre code { background: none; color: inherit; padding: 0; font-size: 0.875rem; }
  table { border-collapse: collapse; width: 100%; margin: 1.5em 0; }
  th, td { border: 1px solid #d1d5db; padding: 0.6rem 0.8rem; text-align: left; }
  th { background: #e5e7eb; }
  blockquote { border-left: 5px solid #3b82f6; background: #eff6ff; padding: 1rem 1.5rem; margin: 1.5em 0; color: #6b7280; font-style: italic; }
  hr { border: none; height: 3px; background: #d1d5db; margin: 2em 0; }
  input[type='checkbox'] { width: 1.1em; height: 1.1em; margin-right: 0.5em; }
`;

export function renderMarkdownHtml(content: string, title: string): string {
  const body = renderToStaticMarkup(
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
    >
      {content}
    </ReactMarkdown>
  );

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title.replace(/</g, '&lt;')}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css" />
  <style>${EXPORT_CSS}</style>
</head>
<body>
  <div class="container">${body}</div>
</body>
</html>`;
}
