'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Moon, Sun, Download, Copy, History, HelpCircle, Globe, Split, Edit, Eye, Maximize, Minimize, Code2, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { HistoryModal } from '@/components/ui/HistoryModal';
import { ExportModal } from '@/components/ui/ExportModal';
import { RenameModal } from '@/components/ui/RenameModal';
import { HelpModal } from '@/components/ui/HelpModal';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { MarkdownPreview } from '@/components/MarkdownPreview';
import { BrowserWarning } from '@/components/BrowserWarning';
import { getDefaultContent } from '@/data/defaultContent';
import { getStrings } from '@/data/i18n';
import {
  loadContent,
  saveContent,
  loadHistory,
  saveHistory,
  loadPinned,
  savePinned,
  HistoryEntry,
  renameHistoryEntry
} from '@/utils/storage';

type ViewMode = 'edit' | 'split' | 'preview';

export default function EditorPage() {
  const { t, toggleLanguage, language, isMounted: langMounted } = useLanguage();
  const { theme, toggleTheme, isMounted: themeMounted } = useTheme();
  const [content, setContent] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [pinned, setPinned] = useState<HistoryEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [currentRenameVersion, setCurrentRenameVersion] = useState<HistoryEntry | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      saveContent(newContent);

      const newHistoryEntry: HistoryEntry = {
        id: Date.now().toString(),
        content: newContent,
        timestamp: Date.now(),
      };

      setHistory(prev => {
        const filtered = prev.filter(item => item.content !== newContent);
        const updated = [newHistoryEntry, ...filtered].slice(0, 50);
        saveHistory(updated);
        return updated;
      });
    }, 2000);
  }, []);

  const handleExport = useCallback(() => {
    setShowExport(true);
  }, []);

  const doExport = useCallback((fileName: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t.exported);
  }, [content, t.exported]);

  const handleRename = useCallback((version: HistoryEntry) => {
    setCurrentRenameVersion(version);
    setShowRename(true);
  }, []);

  const doRename = useCallback((newName: string) => {
    if (currentRenameVersion) {
      const { history: updatedHistory, pinned: updatedPinned } = renameHistoryEntry(
        currentRenameVersion.id,
        newName,
        history,
        pinned
      );
      setHistory(updatedHistory);
      setPinned(updatedPinned);
      saveHistory(updatedHistory);
      savePinned(updatedPinned);
    }
  }, [currentRenameVersion, history, pinned]);

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
    const newLang = toggleLanguage();
    const newT = getStrings(newLang);
    toast.success(newT.languageSwitched);
  }, [toggleLanguage]);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    } else {
      if (document.exitFullscreen) {
        try {
          await document.exitFullscreen();
        } catch (err) {
          console.error('Error attempting to exit fullscreen:', err);
        }
      }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!langMounted || !themeMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4 w-1/3">
          <a href="https://ale160.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="https://ale160.com/images/logo-icon.ico" alt="Logo" className="w-8 h-8 rounded" />
            <span className="text-2xl font-bold text-primary">{t.appName}</span>
          </a>
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title={t.help}
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center w-1/3">
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <button
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'edit'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title={t.editMode}
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">{t.editMode}</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'split'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title={t.splitMode}
            >
              <Split className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">{t.splitMode}</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'preview'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title={t.previewMode}
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">{t.previewMode}</span>
            </button>
            <div className="w-px h-6 bg-border mx-1" />
            <button
              onClick={handleToggleFullscreen}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'edit' || viewMode === 'split' || viewMode === 'preview'
                  ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  : ''
              }`}
              title={t.fullscreen}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              <span className="text-sm font-medium hidden sm:inline">{t.fullscreen}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 w-1/3">
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

      <BrowserWarning />

      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === 'edit' && (
          <MarkdownEditor
            value={content}
            onChange={handleContentChange}
            theme={theme}
          />
        )}

        {viewMode === 'preview' && (
          <MarkdownPreview
            content={content}
            theme={theme}
          />
        )}

        {viewMode === 'split' && (
          <div className="flex h-full">
            <div className="flex-1 min-w-0 border-r border-border">
              <MarkdownEditor
                value={content}
                onChange={handleContentChange}
                theme={theme}
              />
            </div>
            <div className="flex-1 min-w-0">
              <MarkdownPreview
                content={content}
                theme={theme}
              />
            </div>
          </div>
        )}
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
        onRename={handleRename}
      />
      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        defaultName={`web-text-${new Date().toISOString().slice(0, 10)}`}
        onExport={doExport}
      />
      <RenameModal
        isOpen={showRename}
        onClose={() => setShowRename(false)}
        currentName={currentRenameVersion?.name}
        onRename={doRename}
      />
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <footer className="flex items-center justify-center gap-4 px-4 py-2 border-t border-border bg-card/50 text-xs text-muted-foreground">
        <a
          href="https://github.com/ale-160/web-text.git"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>{t.githubRepo}</span>
        </a>
        <span className="text-border">|</span>
        <a
          href="https://ale160.com/sponsor"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors text-pink-600 dark:text-pink-400"
        >
          <Heart className="w-3.5 h-3.5" />
          <span>{t.sponsor}</span>
        </a>
        <span className="text-border">|</span>
        <a
          href="https://ale160.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          {t.poweredBy}
        </a>
      </footer>
    </div>
  );
}
