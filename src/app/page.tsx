'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { Moon, Sun, Download, Copy, History, HelpCircle, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { HistoryModal } from '@/components/ui/HistoryModal';
import { getDefaultContent } from '@/data/defaultContent';
import { getStrings } from '@/data/i18n';
import { getStructuredData } from '@/config/structuredData';
import {
  loadContent,
  saveContent,
  loadHistory,
  saveHistory,
  loadPinned,
  savePinned,
  HistoryEntry
} from '@/utils/storage';

export default function EditorPage() {
  const { t, toggleLanguage, language, isMounted: langMounted } = useLanguage();
  const { theme, toggleTheme, isMounted: themeMounted } = useTheme();
  const [content, setContent] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [pinned, setPinned] = useState<HistoryEntry[]>([]);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  
  // 获取结构化数据
  const structuredDataList = getStructuredData(language);

  useEffect(() => {
    if (langMounted && themeMounted) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }

      const savedContent = loadContent();
      const savedHistory = loadHistory();
      const savedPinned = loadPinned();

      if (savedContent) {
        setContent(savedContent);
      } else {
        setContent(getDefaultContent(t));
      }

      setHistory(savedHistory);
      setPinned(savedPinned);
    }
  }, [langMounted, themeMounted, t, language, theme]);

  const handleContentChange = useCallback((newContent: string | undefined) => {
    const value = newContent || '';
    setContent(value);

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      saveContent(value);

      const newHistoryEntry: HistoryEntry = {
        id: Date.now().toString(),
        content: value,
        timestamp: Date.now(),
      };

      setHistory(prev => {
        const filtered = prev.filter(item => item.content !== value);
        const updated = [newHistoryEntry, ...filtered].slice(0, 50);
        saveHistory(updated);
        return updated;
      });
    }, 2000);
  }, []);

  const handleExport = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `web-text-${new Date().toISOString().slice(0, 10)}.md`;
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
    saveContent(version.content);
    setShowHistory(false);
    toast.success(t.restored);
  }, [t.restored]);

  const handleTogglePin = useCallback((version: HistoryEntry) => {
    if (version.pinned) {
      setPinned(prev => {
        const updated = prev.filter(item => item.id !== version.id);
        savePinned(updated);
        return updated;
      });
      setHistory(prev => {
        const updated = prev.map(item =>
          item.id === version.id ? { ...item, pinned: false } : item
        );
        saveHistory(updated);
        return updated;
      });
    } else {
      const pinnedItem = { ...version, pinned: true };
      setPinned(prev => {
        const updated = [pinnedItem, ...prev.filter(item => item.id !== version.id)];
        savePinned(updated);
        return updated;
      });
      setHistory(prev => {
        const updated = prev.map(item =>
          item.id === version.id ? pinnedItem : item
        );
        saveHistory(updated);
        return updated;
      });
    }
  }, []);

  const handleDeleteVersion = useCallback((versionId: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== versionId);
      saveHistory(updated);
      return updated;
    });
    setPinned(prev => {
      const updated = prev.filter(item => item.id !== versionId);
      savePinned(updated);
      return updated;
    });
  }, []);

  const handleToggleLanguage = useCallback(() => {
    const prevLang = toggleLanguage();
    const prevT = getStrings(prevLang);
    toast.success(prevT.languageSwitched);
  }, [toggleLanguage]);

  if (!langMounted || !themeMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* 结构化数据 */}
      {structuredDataList.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      
      <div className="flex flex-col h-screen bg-background text-foreground">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <a href="https://ale160.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="https://ale160.com/images/logo-icon.ico" alt="Logo" className="w-8 h-8 rounded" />
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
            <History className="w-5 h-5" />
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
            onClick={handleToggleLanguage}
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

      <div className="flex-1 min-h-0" data-color-mode={theme}>
        <MDEditor
          value={content}
          onChange={handleContentChange}
          preview="live"
          height="100%"
          commands={[]}
          style={{ height: '100%', minHeight: '100%' }}
        />
      </div>

      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        pinned={pinned}
        currentContent={content}
        onRestore={handleRestoreVersion}
        onDelete={handleDeleteVersion}
        onTogglePin={handleTogglePin}
      />
      </div>
    </>
  );
}
