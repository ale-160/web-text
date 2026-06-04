'use client';

import React, { useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorView, keymap } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import { Prec } from '@codemirror/state';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: 'light' | 'dark';
}

export function MarkdownEditor({ value, onChange, theme }: MarkdownEditorProps) {
  const handleChange = useCallback((val: string) => {
    onChange(val);
  }, [onChange]);

  // 检测当前光标是否在表格内
  const isInTable = useCallback((content: string, cursorPos: number): boolean => {
    const lines = content.substring(0, cursorPos).split('\n');
    let inTable = false;

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.includes('|')) {
        inTable = true;
        break;
      }
      // 如果遇到空行或非表格行，且前面没有表格，则停止
      if (!inTable && line !== '') {
        break;
      }
    }
    return inTable;
  }, []);

  const insertBr = useCallback((view: EditorView) => {
    const state = view.state;
    const doc = state.doc.toString();
    const cursorPos = state.selection.main.head;

    if (isInTable(doc, cursorPos)) {
      // 在表格内，插入 <br/> 标签
      view.dispatch({
        changes: { from: cursorPos, to: cursorPos, insert: '<br/>' },
        selection: { anchor: cursorPos + 5 }
      });
      return true;
    }

    // 不在表格内，使用默认行为（换行）
    return false;
  }, [isInTable]);

  const extensions = [
    markdown({
      base: markdownLanguage,
      codeLanguages: languages
    }),
    EditorView.lineWrapping,
    Prec.high(keymap.of([
      {
        key: 'Enter',
        run: insertBr
      }
    ]))
  ];

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
