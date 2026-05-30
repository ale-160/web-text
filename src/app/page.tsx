'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { Moon, Sun, Download, Copy, FileText, History, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DEFAULT_CONTENT = `# 欢迎使用 WebText ✏️

这是一个简洁优雅的在线 Markdown 编辑器，所有数据保存在浏览器本地存储中。

## 功能特性

- **实时预览** - 左侧编辑，右侧即时预览
- **代码高亮** - 支持多种编程语言的代码高亮
- **自动保存** - 内容自动保存到浏览器本地存储
- **暗色模式** - 点击右上角切换明暗主题
- **导出文件** - 支持导出为 Markdown 文件或复制到剪贴板

## 代码高亮示例

### JavaScript

\`\`\`javascript
// JavaScript 示例
function greet(name) {
  return \`Hello, \${name}!\`;
}

const message = greet('World');
console.log(message);
\`\`\`

### TypeScript

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

### Python

\`\`\`python
# Python 示例
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
\`\`\`

## 其他 Markdown 功能

> 引用文本示例

- 列表项 1
- 列表项 2
  - 嵌套列表项

1. 有序列表
2. 第二项

**粗体** 和 *斜体* 以及 ~~删除线~~

\`行内代码\`

---

开始编辑吧，你的内容会自动保存 👇
`;

interface HistoryEntry {
  id: string;
  content: string;
  timestamp: number;
}

export default function WebTextEditor() {
  const [content, setContent] = useState<string>(DEFAULT_CONTENT);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage
  useEffect(() => {
    const savedContent = localStorage.getItem('webtext-content');
    const savedTheme = localStorage.getItem('webtext-theme');
    const savedHistory = localStorage.getItem('webtext-history');
    
    if (savedContent) {
      setContent(savedContent);
    }
    
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark' | 'system');
    }
    
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    
    // Apply dark mode
    if (savedTheme === 'dark' || 
        (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Auto save to localStorage with history
  const saveToHistory = useCallback((newContent: string) => {
    setContent(newContent);
    localStorage.setItem('webtext-content', newContent);
    
    const newHistoryEntry: HistoryEntry = {
      id: Date.now().toString(),
      content: newContent,
      timestamp: Date.now(),
    };
    
    setHistory(prev => {
      const updated = [newHistoryEntry, ...prev.slice(0, 49)]; // Keep last 50
      localStorage.setItem('webtext-history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleContentChange = useCallback((newContent: string | undefined) => {
    const value = newContent || '';
    
    // Clear previous timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    
    // Auto save after 1 second debounce
    saveTimerRef.current = setTimeout(() => {
      saveToHistory(value);
    }, 1000);
  }, [saveToHistory]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('webtext-theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleExport = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webtext-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('文件已导出');
  }, [content]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('已复制到剪贴板');
    } catch {
      toast.error('复制失败');
    }
  }, [content]);

  const handleRestoreVersion = useCallback((version: HistoryEntry) => {
    setContent(version.content);
    setShowHistory(false);
    toast.success('已恢复到历史版本');
  }, []);

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <a href="https://ale160.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo-icon.ico" alt="Logo" className="w-8 h-8 rounded" />
            <span className="text-xl font-bold text-primary">WebText</span>
          </a>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="历史版本"
          >
            <History className="w-5 h-5" />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="复制"
          >
            <Copy className="w-5 h-5" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="导出"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="切换主题"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="全屏"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Editor */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        isFullscreen ? "h-screen fixed inset-0 z-50" : "p-4"
      )}>
        <div className="h-full">
          <MDEditor
            value={content}
            onChange={handleContentChange}
            preview="live"
            height="100%"
            data-color-mode={theme}
            previewOptions={{
              highlightEnable: true,
              showLineNumbers: true,
            }}
          />
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">历史版本</h3>
              <button onClick={() => setShowHistory(false)} className="p-2 rounded hover:bg-muted">
                ✕
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {history.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  暂无历史记录
                </div>
              ) : (
                history.map((version) => (
                  <div
                    key={version.id}
                    className="p-3 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handleRestoreVersion(version)}
                  >
                    <div className="text-sm text-muted-foreground">{formatTime(version.timestamp)}</div>
                    <div className="mt-1 text-sm truncate">{version.content.slice(0, 100)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
