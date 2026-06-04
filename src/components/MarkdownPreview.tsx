'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';
import 'highlight.js/styles/github.css';

interface MarkdownPreviewProps {
  content: string;
  theme: 'light' | 'dark';
}

export function MarkdownPreview({ content, theme }: MarkdownPreviewProps) {
  return (
    <div className={`h-full w-full overflow-y-auto ${
      theme === 'dark' ? 'bg-gray-950' : 'bg-[#fdf6e3]'}`}>
      <div className={`max-w-none px-6 py-8 prose ${
        theme === 'dark' ? 'prose-invert' : ''}`}>
        <style>{`
          .prose {
            color: ${theme === 'dark' ? '#e5e7eb' : '#1f2937'};
            max-width: 100%;
          }
          .prose h1 {
            color: ${theme === 'dark' ? '#f3f4f6' : '#111827'};
            font-weight: 800;
            font-size: 2.25rem;
            margin-top: 0;
            margin-bottom: 1rem;
            border-bottom: 3px solid ${theme === 'dark' ? '#4b5563' : '#9ca3af'};
            padding-bottom: 0.75rem;
            line-height: 1.2;
          }
          .prose h2 {
            color: ${theme === 'dark' ? '#f3f4f6' : '#111827'};
            font-weight: 700;
            font-size: 1.875rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
            border-bottom: 2px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
            padding-bottom: 0.5rem;
            line-height: 1.3;
          }
          .prose h3 {
            color: ${theme === 'dark' ? '#f3f4f6' : '#111827'};
            font-weight: 700;
            font-size: 1.5rem;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            line-height: 1.4;
          }
          .prose h4 {
            color: ${theme === 'dark' ? '#f3f4f6' : '#111827'};
            font-weight: 600;
            font-size: 1.25rem;
            margin-top: 1.25rem;
            margin-bottom: 0.5rem;
          }
          .prose p {
            margin-top: 1em;
            margin-bottom: 1em;
            line-height: 1.8;
            color: ${theme === 'dark' ? '#d1d5db' : '#4b5563'};
          }
          .prose code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
            background-color: ${theme === 'dark' ? '#374151' : '#e5e7eb'};
            color: ${theme === 'dark' ? '#f472b6' : '#be185d'};
            padding: 0.25em 0.5em;
            border-radius: 0.375rem;
            font-size: 0.875em;
            border: 1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
          }
          .prose a {
            color: ${theme === 'dark' ? '#60a5fa' : '#2563eb'};
            text-decoration: underline;
            text-underline-offset: 3px;
            font-weight: 600;
            transition: color 0.2s ease;
          }
          .prose a:hover {
            color: ${theme === 'dark' ? '#93c5fd' : '#1d4ed8'};
          }
          .prose img {
            max-width: 100%;
            height: auto;
            border-radius: 0.75rem;
            margin: 2em auto;
            display: block;
            box-shadow: ${theme === 'dark' ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'};
          }
          .prose table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1.5em;
            margin-bottom: 1.5em;
            font-size: 0.875rem;
            overflow: hidden;
            border-radius: 0.5rem;
            box-shadow: ${theme === 'dark' ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' : '0 1px 3px -1px rgba(0, 0, 0, 0.1)'};
          }
          .prose th {
            background-color: ${theme === 'dark' ? '#374151' : '#e5e7eb'};
            color: ${theme === 'dark' ? '#f9fafb' : '#111827'};
            font-weight: 700;
            text-align: left;
            padding: 1rem 1.25rem;
            border-bottom: 3px solid ${theme === 'dark' ? '#4b5563' : '#9ca3af'};
          }
          .prose td {
            padding: 1rem 1.25rem;
            border-bottom: 1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
            color: ${theme === 'dark' ? '#d1d5db' : '#4b5563'};
          }
          .prose tr:last-child td {
            border-bottom: none;
          }
          .prose tr:hover td {
            background-color: ${theme === 'dark' ? '#4b5563' : '#f3f4f6'};
          }
          .prose blockquote {
            border-left: 5px solid ${theme === 'dark' ? '#3b82f6' : '#3b82f6'};
            background-color: ${theme === 'dark' ? '#374151' : '#eff6ff'};
            padding: 1.25rem 1.5rem;
            margin: 1.5em 0;
            color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
            font-style: italic;
            border-radius: 0 0.75rem 0.75rem 0;
            box-shadow: ${theme === 'dark' ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' : '0 2px 4px -1px rgba(0, 0, 0, 0.05)'};
          }
          .prose blockquote p {
            margin: 0;
            color: inherit;
          }
          .prose ul, .prose ol {
            margin-top: 1.25em;
            margin-bottom: 1.25em;
            padding-left: 1.75em;
          }
          .prose li {
            margin-top: 0.5em;
            margin-bottom: 0.5em;
            line-height: 1.8;
            color: ${theme === 'dark' ? '#d1d5db' : '#4b5563'};
          }
          .prose ul li {
            list-style-type: disc;
          }
          .prose ul li::marker {
            color: ${theme === 'dark' ? '#60a5fa' : '#2563eb'};
          }
          .prose ol li {
            list-style-type: decimal;
          }
          .prose ol li::marker {
            color: ${theme === 'dark' ? '#60a5fa' : '#2563eb'};
            font-weight: 600;
          }
          .prose strong {
            color: ${theme === 'dark' ? '#f9fafb' : '#111827'};
            font-weight: 700;
          }
          .prose em {
            color: inherit;
            font-style: italic;
          }
          .prose del {
            text-decoration: line-through;
            color: ${theme === 'dark' ? '#6b7280' : '#9ca3af'};
          }
          .prose hr {
            border: none;
            height: 4px;
            background: linear-gradient(90deg, 
              ${theme === 'dark' ? '#4b5563' : '#9ca3af'} 0%,
              ${theme === 'dark' ? '#6b7280' : '#6b7280'} 50%,
              ${theme === 'dark' ? '#4b5563' : '#9ca3af'} 100%
            );
            margin: 2.5em 0;
            border-radius: 4px;
          }
          .prose input[type="checkbox"] {
            width: 1.125rem;
            height: 1.125rem;
            margin-right: 0.75rem;
            accent-color: ${theme === 'dark' ? '#3b82f6' : '#3b82f6'};
            cursor: pointer;
          }
        `}</style>
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
