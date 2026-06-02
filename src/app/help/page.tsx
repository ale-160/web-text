'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { getMarkdownExamples } from '@/data/markdownExamples';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

export default function HelpPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [selectedExample, setSelectedExample] = useState<ReturnType<typeof getMarkdownExamples>[0] | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const examples = getMarkdownExamples(language);
  
  const isDark = theme === 'dark';

  const handleCopy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      console.error('Copy failed');
    }
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`border-b ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} px-6 py-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t.back}</span>
            </button>
            <h1 className="text-2xl font-bold">{t.helpTitle}</h1>
          </div>
          <a
            href="https://ale160.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {t.poweredBy}
            <span className="text-primary font-semibold">
              {language === 'zh' ? '阿乐一百六' : 'ale160'}
            </span>
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'zh' ? '语法示例' : 'Syntax Examples'}
            </h2>
            {examples.map((example) => (
              <div
                key={example.id}
                onClick={() => setSelectedExample(example)}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedExample?.id === example.id
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                    : isDark 
                      ? 'border-gray-800 hover:border-gray-700 hover:bg-gray-850 bg-gray-900' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100 bg-white'
                }`}
              >
                <div className="mb-2">
                  <h3 className="text-lg font-semibold">{example.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {example.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 text-xs rounded ${
                          isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {example.description}
                </p>
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-8 h-fit">
            <div className={`border rounded-lg p-4 ${
              isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              <h3 className="text-lg font-semibold mb-4">
                {language === 'zh' ? '实时预览' : 'Live Preview'}
              </h3>
              
              {selectedExample ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`text-sm font-medium ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {language === 'zh' ? '示例' : 'Example'}
                      </h4>
                      <button
                        onClick={() => handleCopy(selectedExample.markdown, selectedExample.id)}
                        className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
                          isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                        }`}
                        title={language === 'zh' ? '复制示例' : 'Copy example'}
                      >
                        {copiedId === selectedExample.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className={`border rounded p-3 font-mono text-sm overflow-x-auto ${
                      isDark ? 'bg-gray-950 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}>
                      <pre className="whitespace-pre-wrap">{selectedExample.markdown}</pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={`text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {language === 'zh' ? '预览' : 'Preview'}
                    </h4>
                    <div className={`border rounded p-4 min-h-[200px] ${
                      isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'
                    }`}>
                      <div className={`prose max-w-none ${isDark ? 'prose-invert' : ''}`}>
                        <MDEditor.Markdown 
                          source={selectedExample.markdown}
                          data-color-mode={theme}
                          style={{ backgroundColor: 'transparent' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`text-center py-12 border rounded-lg ${
                  isDark ? 'text-gray-500 border-gray-800' : 'text-gray-400 border-gray-200'
                }`}>
                  <div>
                    <svg
                      className="w-16 h-16 mx-auto mb-4 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 12a9 9 0 11-18 0a9 9 0 0118 0z"
                      />
                    </svg>
                    <p>{language === 'zh' ? '点击左侧示例查看详情' : 'Click an example on the left to see details'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className={`border-t ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} px-6 py-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {t.poweredBy}
          </p>
          <a
            href="https://ale160.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm font-semibold hover:underline transition-colors ${
              isDark ? 'text-primary hover:text-blue-400' : 'text-primary hover:text-blue-600'
            }`}
          >
            {language === 'zh' ? '阿乐一百六' : 'ale160'}
          </a>
        </div>
      </footer>
    </div>
  );
}
