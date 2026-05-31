'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { 
  Moon, 
  Sun, 
  Download, 
  Copy, 
  History as HistoryIcon, 
  HelpCircle, 
  Globe,
  Trash2,
  Pin,
  PinOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';

interface HistoryEntry {
  id: string;
  content: string;
  timestamp: number;
  pinned?: boolean;
}

// 计算文本字节大小的辅助函数
const getTextSize = (text: string): number => {
  return new Blob([text]).size;
};

// 格式化大小显示
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function EditorPage() {
  const { t, toggleLanguage, language, isMounted: langMounted } = useLanguage();
  const { theme, toggleTheme, isMounted: themeMounted } = useTheme();
  const [content, setContent] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [pinnedHistory, setPinnedHistory] = useState<HistoryEntry[]>([]);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const getDefaultContent = useCallback(() => `# [${t.welcomeTitle}](https://ale160.com)

## ${t.featuresTitle}

${t.features.map(f => `- **${f}**`).join('\n')}

## ${t.codeHighlightTitle}

### ${t.javascript}

\`\`\`javascript
// JavaScript 示例
function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet('World');
console.log(message);
\`\`\`

### ${t.typescript}

\`\`\`typescript
// TypeScript 示例
interface User {
  id: number;
  name: string;
}

function getUser(id: number): User {
  return { id, name: 'John' };
}
\`\`\`

### ${t.python}

\`\`\`python
# Python 示例
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
\`\`\`

## ${t.otherMarkdownFeatures}

> ${t.blockquote}

- ${t.listItem} 1
- ${t.listItem} 2
  - ${t.listItem}

1. ${t.orderedList}
2. ${t.orderedList}

**粗体** 和 *斜体* 以及 ~~删除线~~

\`${t.inlineCode}\`

---

${t.startEditing} 👇
`, [t]);

  useEffect(() => {
    if (langMounted && themeMounted) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
      
      const savedContent = localStorage.getItem('webtext-content');
      const savedHistory = localStorage.getItem('webtext-history');
      const savedPinned = localStorage.getItem('webtext-pinned');
      
      if (savedContent) {
        setContent(savedContent);
      } else {
        setContent(getDefaultContent());
      }
      
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch {
          setHistory([]);
        }
      }
      
      if (savedPinned) {
        try {
          setPinnedHistory(JSON.parse(savedPinned));
        } catch {
          setPinnedHistory([]);
        }
      }
    }
  }, [langMounted, themeMounted, getDefaultContent, language]);

  const saveToHistory = useCallback((newContent: string) => {
    setContent(newContent);
    localStorage.setItem('webtext-content', newContent);
    
    const newHistoryEntry: HistoryEntry = {
      id: Date.now().toString(),
      content: newContent,
      timestamp: Date.now(),
    };
    
    setHistory(prev => {
      // 先过滤已有的重复（避免与固定版本重复）
      const filtered = prev.filter(item => item.content !== newContent);
      const updated = [newHistoryEntry, ...filtered].slice(0, 50); // 保持最近 50 个版本
      localStorage.setItem('webtext-history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleContentChange = useCallback((newContent: string | undefined) => {
    const value = newContent || '';
    setContent(value); // 立即更新状态，不等待
    
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    
    // 延迟保存，减少 localStorage 写入频率
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem('webtext-content', value);
      
      const newHistoryEntry: HistoryEntry = {
        id: Date.now().toString(),
        content: value,
        timestamp: Date.now(),
      };
      
      setHistory(prev => {
        const filtered = prev.filter(item => item.content !== value);
        const updated = [newHistoryEntry, ...filtered].slice(0, 50);
        localStorage.setItem('webtext-history', JSON.stringify(updated));
        return updated;
      });
    }, 2000);
  }, []);

  const handleExport = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webtext-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t.exported);
  }, [content, t.exported]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(t.copied);
    } catch {
      toast.error(t.copyFailed);
    }
  }, [content, t.copied, t.copyFailed]);

  const handleRestoreVersion = useCallback((version: HistoryEntry) => {
    setContent(version.content);
    setShowHistory(false);
    toast.success(t.restored);
  }, [t.restored]);

  const handleTogglePin = useCallback((version: HistoryEntry) => {
    if (version.pinned) {
      // 取消固定
      setPinnedHistory(prev => {
        const updated = prev.filter(item => item.id !== version.id);
        localStorage.setItem('webtext-pinned', JSON.stringify(updated));
        return updated;
      });
      setHistory(prev => {
        const updated = prev.map(item => 
          item.id === version.id ? { ...item, pinned: false } : item
        );
        localStorage.setItem('webtext-history', JSON.stringify(updated));
        return updated;
      });
    } else {
      // 固定
      const pinnedItem = { ...version, pinned: true };
      setPinnedHistory(prev => {
        const updated = [pinnedItem, ...prev.filter(item => item.id !== version.id)];
        localStorage.setItem('webtext-pinned', JSON.stringify(updated));
        return updated;
      });
      setHistory(prev => {
        const updated = prev.map(item => 
          item.id === version.id ? pinnedItem : item
        );
        localStorage.setItem('webtext-history', JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  const handleDeleteVersion = useCallback((versionId: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== versionId);
      localStorage.setItem('webtext-history', JSON.stringify(updated));
      return updated;
    });
    setPinnedHistory(prev => {
      const updated = prev.filter(item => item.id !== versionId);
      localStorage.setItem('webtext-pinned', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleToggleLanguageWithToast = useCallback(() => {
    toggleLanguage();
    toast.success(t.languageSwitched);
  }, [toggleLanguage, t.languageSwitched]);

  const formatTime = useCallback((timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return t.justNow;
    if (diff < 3600000) return `${Math.floor(diff / 60000)} ${t.minutesAgo}`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ${t.hoursAgo}`;
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US');
  }, [t.justNow, t.minutesAgo, t.hoursAgo, language]);

  // 计算存储使用情况
  const storageInfo = useMemo(() => {
    const contentSize = getTextSize(content);
    const historySize = history.reduce((acc, item) => acc + getTextSize(item.content), 0);
    const pinnedSize = pinnedHistory.reduce((acc, item) => acc + getTextSize(item.content), 0);
    return {
      totalSize: contentSize + historySize + pinnedSize,
      contentSize,
      historySize,
      pinnedSize,
    };
  }, [content, history, pinnedHistory]);

  if (!langMounted || !themeMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <a href="https://ale160.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo-icon.ico" alt="Logo" className="w-8 h-8 rounded" />
            <span className="text-xl font-bold text-primary">{t.appName}</span>
          </a>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/help')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title={t.help}
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title={t.history}
          >
            <HistoryIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title={t.copy}
          >
            <Copy className="w-5 h-5" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title={t.export}
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={handleToggleLanguageWithToast}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title={t.language}
          >
            <Globe className="w-5 h-5" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title={t.theme}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1">
        <MDEditor
          value={content}
          onChange={handleContentChange}
          preview="live"
          height="100%"
          data-color-mode={theme}
          commands={[]}
        />
      </div>

      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">{t.historyPanelTitle}</h3>
              <button onClick={() => setShowHistory(false)} className="p-2 rounded hover:bg-muted">
                ✕
              </button>
            </div>
            
            {/* 存储使用情况 */}
            <div className="p-4 border-b border-border bg-muted/30">
              <h4 className="text-sm font-medium mb-2">{t.storageUsage}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="bg-muted p-2 rounded">
                  <span className="text-muted-foreground">{t.totalSize}:</span>
                  <span className="ml-1 font-mono">{formatSize(storageInfo.totalSize)}</span>
                </div>
                <div className="bg-muted p-2 rounded">
                  <span className="text-muted-foreground">{t.contentSize}:</span>
                  <span className="ml-1 font-mono">{formatSize(storageInfo.contentSize)}</span>
                </div>
                <div className="bg-muted p-2 rounded">
                  <span className="text-muted-foreground">{t.historySize}:</span>
                  <span className="ml-1 font-mono">{formatSize(storageInfo.historySize)}</span>
                </div>
                <div className="bg-muted p-2 rounded">
                  <span className="text-muted-foreground">{t.pinnedSize}:</span>
                  <span className="ml-1 font-mono">{formatSize(storageInfo.pinnedSize)}</span>
                </div>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh]">
              {history.length === 0 && pinnedHistory.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {t.noHistory}
                </div>
              ) : (
                <div className="space-y-0">
                  {/* 固定版本 */}
                  {pinnedHistory.length > 0 && (
                    <>
                      <div className="px-4 py-2 bg-muted/30 text-xs font-medium text-muted-foreground sticky top-0">
                        {t.pinned} ({pinnedHistory.length})
                      </div>
                      {pinnedHistory.map(version => (
                        <div
                          key={version.id}
                          className="p-3 hover:bg-muted cursor-pointer transition-colors border-b border-border last:border-b-0"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1" onClick={() => handleRestoreVersion(version)}>
                              <div className="text-sm text-muted-foreground">{formatTime(version.timestamp)}</div>
                              <div className="mt-1 text-sm truncate">{version.content.slice(0, 80)}</div>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleTogglePin(version); }}
                                className="p-1.5 rounded hover:bg-muted/70"
                                title={t.unpin}
                              >
                                <PinOff className="w-4 h-4 text-yellow-600" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteVersion(version.id); }}
                                className="p-1.5 rounded hover:bg-muted/70"
                                title={t.delete}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  
                  {/* 普通版本 */}
                  {history.length > 0 && (
                    <>
                      <div className="px-4 py-2 bg-muted/20 text-xs font-medium text-muted-foreground sticky top-0">
                        {t.history} ({history.length})
                      </div>
                      {history.filter(item => !item.pinned).map(version => (
                        <div
                          key={version.id}
                          className="p-3 hover:bg-muted cursor-pointer transition-colors border-b border-border last:border-b-0"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1" onClick={() => handleRestoreVersion(version)}>
                              <div className="text-sm text-muted-foreground">{formatTime(version.timestamp)}</div>
                              <div className="mt-1 text-sm truncate">{version.content.slice(0, 80)}</div>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleTogglePin(version); }}
                                className="p-1.5 rounded hover:bg-muted/70"
                                title={t.pin}
                              >
                                <Pin className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteVersion(version.id); }}
                                className="p-1.5 rounded hover:bg-muted/70"
                                title={t.delete}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
