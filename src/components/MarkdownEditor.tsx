'use client';

import React, { useCallback, useState, useRef, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { LanguageDescription } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: 'light' | 'dark';
}

export function MarkdownEditor({ value, onChange, theme }: MarkdownEditorProps) {
  const [codeLanguages, setCodeLanguages] = useState<LanguageDescription[]>([]);
  const languagesLoadedRef = useRef(false);

  const handleChange = useCallback((val: string) => {
    onChange(val);
    // 当用户输入 ``` 时，动态加载语言数据并提供语言补全提示
    if (!languagesLoadedRef.current && val.includes('```')) {
      languagesLoadedRef.current = true;
      import('@codemirror/language-data').then(mod => {
        setCodeLanguages(mod.languages);
      });
    }
  }, [onChange]);

  const extensions = useMemo(() => [
    markdown({
      base: markdownLanguage,
      codeLanguages: codeLanguages
    }),
    EditorView.lineWrapping,
    EditorView.contentAttributes.of({ 'aria-label': 'Markdown Input' }),
  ], [codeLanguages]);

  return (
    <div className="h-full w-full">
      <CodeMirror
        value={value}
        height="100%"
        theme={theme === 'dark' ? oneDark : undefined}
        extensions={extensions}
        onChange={handleChange}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: false,
        }}
        style={{
          height: '100%',
          fontSize: '15px',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      />
    </div>
  );
}
