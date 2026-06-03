'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { getMarkdownExamples } from '@/data/markdownExamples';
import { MarkdownPreview } from '@/components/MarkdownPreview';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [selectedExample, setSelectedExample] = useState<ReturnType<typeof getMarkdownExamples>[0] | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const examples = getMarkdownExamples(language);

  const handleCopy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      console.error('Copy failed');
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg">{t.helpTitle}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-muted"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">
                {language === 'zh' ? '语法示例' : 'Syntax Examples'}
              </h2>
              {examples.map((example) => (
                <div
                  key={example.id}
                  onClick={() => setSelectedExample(example)}
                  className={`border border-border rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/30 ${
                    selectedExample?.id === example.id
                      ? 'border-primary bg-primary/10'
                      : ''
                  }`}
                >
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold">{example.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {example.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-xs rounded-md font-medium bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{example.description}</p>
                </div>
              ))}
            </div>

            <div className="lg:sticky lg:top-0 h-fit">
              <div className="border border-border rounded-xl p-6 shadow-sm bg-card">
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'zh' ? '实时预览' : 'Live Preview'}
                </h3>

                {selectedExample ? (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          {language === 'zh' ? '示例' : 'Example'}
                        </h4>
                        <button
                          onClick={() => handleCopy(selectedExample.markdown, selectedExample.id)}
                          className="p-2 rounded-lg transition-colors flex items-center gap-1 hover:bg-muted"
                          title={language === 'zh' ? '复制示例' : 'Copy example'}
                        >
                          {copiedId === selectedExample.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          <span className="text-sm">
                            {language === 'zh' ? '复制' : 'Copy'}
                          </span>
                        </button>
                      </div>
                      <div className="border border-border rounded-lg p-4 font-mono text-sm overflow-x-auto bg-muted/30">
                        <pre className="whitespace-pre-wrap">{selectedExample.markdown}</pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                        {language === 'zh' ? '预览' : 'Preview'}
                      </h4>
                      <div className="border border-border rounded-lg overflow-hidden">
                        <div className="max-h-100 overflow-y-auto">
                          <MarkdownPreview
                            content={selectedExample.markdown}
                            theme={theme}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border border-border rounded-lg text-muted-foreground">
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
        </div>
      </div>
    </div>
  );
};
