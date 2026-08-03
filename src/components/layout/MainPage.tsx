'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Moon, Sun, Download, Copy, History, HelpCircle, Globe, Split, Edit, Eye, Maximize, Minimize, Heart, Menu, X, Focus, FileText, FolderUp, PanelLeftClose, PanelLeftOpen, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';
import { HistoryModal } from '@/components/ui/HistoryModal';
import { ExportModal } from '@/components/ui/ExportModal';
import { RenameModal } from '@/components/ui/RenameModal';
import { HelpModal } from '@/components/ui/HelpModal';
import { DocSidebar } from '@/components/layout/DocSidebar';
import { getDefaultContent } from '@/data/defaultContent';
import { getStrings } from '@/data/i18n';
import {
  Doc,
  HistoryEntry,
  uid,
  loadDocs,
  saveDoc,
  deleteDocWithHistory,
  loadHistory,
  saveHistory,
  migrateLegacyStorage,
  exportBackup,
  importBackup,
  renameHistoryEntry,
} from '@/utils/storage';

// 懒加载编辑器和预览组件，减少首屏 JS 体积
const MarkdownEditor = dynamic(
  () => import('@/components/MarkdownEditor').then(mod => ({ default: mod.MarkdownEditor })),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

const MarkdownPreview = dynamic(
  () => import('@/components/MarkdownPreview').then(mod => ({ default: mod.MarkdownPreview })),
  { ssr: false, loading: () => <PreviewSkeleton /> }
);

function EditorSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-background">
      <div className="animate-pulse text-muted-foreground text-sm">Loading editor...</div>
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-[#fdf6e3] dark:bg-gray-950">
      <div className="animate-pulse text-muted-foreground text-sm">Loading preview...</div>
    </div>
  );
}

type ViewMode = 'edit' | 'split' | 'preview';

// 视图切换 + 全屏控件（主界面与专注模式共用）
function ViewControls({
  viewMode,
  onChange,
  isFullscreen,
  onToggleFullscreen,
}: {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  const { t } = useLanguage();

  const modeBtn = (mode: ViewMode, label: string, Icon: LucideIcon) => (
    <button
      key={mode}
      onClick={() => onChange(mode)}
      className={`flex items-center justify-center min-w-12 min-h-12 sm:min-w-0 sm:min-h-0 gap-2 px-2 sm:px-3 py-2 rounded-md transition-colors ${
        viewMode === mode
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
      title={label}
      aria-label={label}
      aria-pressed={viewMode === mode}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="flex items-center gap-1 border border-border rounded-lg p-1">
      {modeBtn('edit', t.editMode, Edit)}
      {modeBtn('split', t.splitMode, Split)}
      {modeBtn('preview', t.previewMode, Eye)}
      <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
      <button
        onClick={onToggleFullscreen}
        className="hidden sm:flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
        title={t.fullscreen}
        aria-label={t.fullscreen}
      >
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        <span className="text-sm font-medium hidden sm:inline">{t.fullscreen}</span>
      </button>
    </div>
  );
}

interface MainPageProps {
  lang: 'en' | 'zh';
}

const HISTORY_LIMIT = 50;

// 字数统计：中文按字、英文按词
const countText = (text: string): { chars: number; words: number } => {
  const chars = text.length;
  const cjk = (text.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || []).length;
  const latin = (text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || []).length;
  return { chars, words: cjk + latin };
};

const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

export default function MainPage({ lang }: MainPageProps) {
  // 动态设置 <html lang> 属性
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }, [lang]);

  const { t, toggleLanguage, isMounted: langMounted } = useLanguage(lang);
  const { theme, toggleTheme, isMounted: themeMounted } = useTheme();
  const [content, setContent] = useState('');
  const [docs, setDocs] = useState<Doc[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileDocs, setShowMobileDocs] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [search, setSearch] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Doc | HistoryEntry | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef('');
  const currentDocRef = useRef<Doc | null>(null);
  const initializedRef = useRef(false);

  const currentDoc = docs.find(d => d.id === currentDocId) ?? null;
  const pinned = history.filter(item => item.pinned);

  // 初始化：迁移旧数据 → 加载文档 → 恢复上次状态
  useEffect(() => {
    if (!langMounted || !themeMounted || initializedRef.current) return;
    initializedRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const migratedId = await migrateLegacyStorage(t.untitled);
        let loadedDocs = await loadDocs();
        let targetId = migratedId ?? loadedDocs[0]?.id ?? null;

        if (!targetId) {
          const now = Date.now();
          const doc: Doc = {
            id: uid(),
            name: t.untitled,
            content: getDefaultContent(t),
            createdAt: now,
            updatedAt: now,
          };
          await saveDoc(doc);
          loadedDocs = [doc];
          targetId = doc.id;
        }

        if (cancelled) return;
        setDocs(loadedDocs);
        setCurrentDocId(targetId);
        const doc = loadedDocs.find(d => d.id === targetId) ?? loadedDocs[0];
        if (doc) {
          contentRef.current = doc.content;
          currentDocRef.current = doc;
          setContent(doc.content);
        }
        setHistory(await loadHistory(targetId));
      } catch (err) {
        console.error('初始化失败:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [langMounted, themeMounted]);

  // 侧边栏折叠状态持久化
  useEffect(() => {
    try {
      setSidebarCollapsed(localStorage.getItem('web-text-sidebar-collapsed') === '1');
    } catch {
      // ignore
    }
  }, [langMounted, themeMounted]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('web-text-sidebar-collapsed', next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // 立即保存当前文档（清空防抖定时器，写文档 + 写历史）
  const flushSave = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    const doc = currentDocRef.current;
    if (!doc) return;
    const newContent = contentRef.current;
    const updatedAt = Date.now();
    await saveDoc({ ...doc, content: newContent, updatedAt });
    setDocs(prev => prev.map(d => (d.id === doc.id ? { ...d, content: newContent, updatedAt } : d)));
    const entry: HistoryEntry = {
      id: uid(),
      docId: doc.id,
      content: newContent,
      timestamp: updatedAt,
    };
    setHistory(prev => {
      const filtered = prev.filter(item => item.content !== newContent);
      const updated = [entry, ...filtered].slice(0, HISTORY_LIMIT);
      void saveHistory(doc.id, updated);
      return updated;
    });
  }, []);

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      contentRef.current = newContent;
      if (!currentDocId) return;

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = setTimeout(() => {
        void flushSave();
      }, 1500);
    },
    [currentDocId, flushSave]
  );

  // 切换文档
  const handleSelectDoc = useCallback(
    async (docId: string) => {
      if (docId === currentDocId) return;
      await flushSave();
      const doc = docs.find(d => d.id === docId);
      if (!doc) return;
      currentDocRef.current = doc;
      contentRef.current = doc.content;
      setCurrentDocId(docId);
      setContent(doc.content);
      setHistory(await loadHistory(docId));
      setShowMobileDocs(false);
    },
    [currentDocId, docs, flushSave]
  );

  // 新建文档
  const handleNewDoc = useCallback(async () => {
    await flushSave();
    const now = Date.now();
    const doc: Doc = {
      id: uid(),
      name: t.untitled,
      content: getDefaultContent(t),
      createdAt: now,
      updatedAt: now,
    };
    await saveDoc(doc);
    currentDocRef.current = doc;
    contentRef.current = doc.content;
    setDocs(prev => [doc, ...prev]);
    setCurrentDocId(doc.id);
    setContent(doc.content);
    setHistory([]);
    setSearch('');
  }, [flushSave, t]);

  // 删除文档（连带历史）
  const handleDeleteDoc = useCallback(
    async (doc: Doc) => {
      if (!window.confirm(t.deleteDocConfirm.replace('{name}', doc.name))) return;
      await deleteDocWithHistory(doc.id);
      const remaining = docs.filter(d => d.id !== doc.id);
      setDocs(remaining);
      toast.success(t.deleteDoc);

      if (doc.id === currentDocId) {
        // 清空当前引用，防止 flushSave 把已删除文档写回
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
          saveTimerRef.current = null;
        }
        currentDocRef.current = null;
        contentRef.current = '';
        const next = remaining[0] ?? null;
        if (next) {
          currentDocRef.current = next;
          contentRef.current = next.content;
          setCurrentDocId(next.id);
          setContent(next.content);
          setHistory(await loadHistory(next.id));
        } else {
          // 全部删光：自动新建一个空文档
          await handleNewDoc();
        }
      }
    },
    [docs, currentDocId, t, handleNewDoc]
  );

  // 重命名文档 / 历史版本
  const handleRename = useCallback((target: Doc | HistoryEntry) => {
    setRenameTarget(target);
    setShowRename(true);
  }, []);

  const doRename = useCallback(
    (newName: string) => {
      if (!renameTarget || !newName.trim()) return;
      const target = renameTarget;
      setRenameTarget(null);

      if ('docId' in target) {
        // 历史版本重命名
        const { history: updatedHistory, pinned: updatedPinned } = renameHistoryEntry(
          target.id,
          newName,
          history,
          pinned
        );
        const merged = updatedHistory.map(item => ({
          ...item,
          pinned: updatedPinned.some(p => p.id === item.id) ? true : item.pinned,
        }));
        setHistory(merged);
        void saveHistory(target.docId, merged);
      } else {
        // 文档重命名
        const doc = target as Doc;
        const updated = { ...doc, name: newName };
        currentDocRef.current = updated;
        setDocs(prev => prev.map(d => (d.id === doc.id ? updated : d)));
        void saveDoc(updated);
      }
    },
    [renameTarget, history, pinned]
  );

  const handleExport = useCallback(() => {
    setShowExport(true);
  }, []);

  const doExport = useCallback(
    (fileName: string) => {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      downloadBlob(blob, fileName.endsWith('.md') ? fileName : `${fileName}.md`);
      toast.success(t.exported);
    },
    [content, t.exported]
  );

  const handleExportHtml = useCallback(
    async (fileName: string) => {
      const { renderMarkdownHtml } = await import('@/utils/exportHtml');
      const html = renderMarkdownHtml(content, fileName);
      downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), `${fileName}.html`);
      toast.success(t.exportHtmlSuccess);
    },
    [content, t.exportHtmlSuccess]
  );

  const handleExportBackup = useCallback(async () => {
    await flushSave();
    const data = await exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `web-text-backup-${new Date().toISOString().slice(0, 10)}.json`);
    toast.success(t.backupSuccess);
  }, [flushSave, t.backupSuccess]);

  const handleImportBackup = useCallback(() => {
    if (!window.confirm(t.importBackupConfirm)) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      void (async () => {
        try {
          const data = JSON.parse(await file.text());
          if (!data || data.format !== 'web-text-backup') {
            throw new Error('bad format');
          }
          await importBackup(data);
          const loadedDocs = await loadDocs();
          setDocs(loadedDocs);
          const target = loadedDocs[0] ?? null;
          if (target) {
            currentDocRef.current = target;
            contentRef.current = target.content;
            setCurrentDocId(target.id);
            setContent(target.content);
            setHistory(await loadHistory(target.id));
          }
          toast.success(t.importBackupSuccess);
        } catch {
          toast.error(t.importBackupFailed);
        }
      })();
    };
    input.click();
  }, [t]);

  // 导入 .md 文件 → 新建文档
  const handleImportFiles = useCallback(
    (files: FileList | File[]) => {
      const mdFiles = Array.from(files).filter(f =>
        /\.(md|markdown|txt)$/i.test(f.name)
      );
      if (mdFiles.length === 0) {
        toast.error(t.importBackupFailed);
        return;
      }
      mdFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          void (async () => {
            await flushSave();
            const now = Date.now();
            const doc: Doc = {
              id: uid(),
              name: file.name.replace(/\.(md|markdown|txt)$/i, ''),
              content: String(reader.result ?? ''),
              createdAt: now,
              updatedAt: now,
            };
            await saveDoc(doc);
            currentDocRef.current = doc;
            contentRef.current = doc.content;
            setDocs(prev => [doc, ...prev]);
            setCurrentDocId(doc.id);
            setContent(doc.content);
            setHistory([]);
            toast.success(`${t.importMdSuccess}: ${doc.name}`);
          })();
        };
        reader.readAsText(file);
      });
    },
    [flushSave, t]
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(t.copied);
    } catch {
      toast.error(t.copyFailed);
    }
  }, [content, t.copied, t.copyFailed]);

  const handleRestoreVersion = useCallback(
    (version: HistoryEntry) => {
      setContent(version.content);
      contentRef.current = version.content;
      if (currentDocRef.current) {
        const doc = currentDocRef.current;
        const updated = { ...doc, content: version.content, updatedAt: Date.now() };
        currentDocRef.current = updated;
        setDocs(prev => prev.map(d => (d.id === doc.id ? updated : d)));
        void saveDoc(updated);
      }
      setShowHistory(false);
      toast.success(t.restored);
    },
    [t.restored]
  );

  const handleTogglePin = useCallback(
    (version: HistoryEntry) => {
      const updated = history.map(item =>
        item.id === version.id ? { ...item, pinned: !item.pinned } : item
      );
      setHistory(updated);
      void saveHistory(version.docId, updated);
    },
    [history]
  );

  const handleDeleteVersion = useCallback(
    (versionId: string) => {
      const docId = currentDocRef.current?.id;
      if (!docId) return;
      const updated = history.filter(item => item.id !== versionId);
      setHistory(updated);
      void saveHistory(docId, updated);
    },
    [history]
  );

  const handleToggleLanguage = useCallback(() => {
    const newLang = toggleLanguage();
    const newT = getStrings(newLang);
    toast.success(newT.languageSwitched);
  }, [toggleLanguage]);

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

  // 键盘快捷键：Ctrl/Cmd+1/2/3 切换视图，Ctrl/Cmd+Shift+F 全屏
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (e.shiftKey && key === 'f') {
        e.preventDefault();
        void handleToggleFullscreen();
      } else if (key === '1') {
        e.preventDefault();
        setViewMode('edit');
      } else if (key === '2') {
        e.preventDefault();
        setViewMode('split');
      } else if (key === '3') {
        e.preventDefault();
        setViewMode('preview');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleToggleFullscreen]);

  // 退出时立即保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      const doc = currentDocRef.current;
      if (doc && contentRef.current !== doc.content) {
        void saveDoc({ ...doc, content: contentRef.current, updatedAt: Date.now() });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const { chars, words } = countText(content);

  if (!langMounted || !themeMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const editorArea = (
    <main
      className={`flex-1 min-h-0 overflow-hidden ${dragActive ? 'pointer-events-none' : ''}`}
    >
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
    </main>
  );

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {focusMode ? (
        // 专注模式：极简顶栏（文档名 + 字数统计 + 视图/全屏 + 退出）
        <header className="flex items-center px-4 py-2 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 flex-1 sm:w-1/3 min-w-0">
            <span className="text-sm font-medium truncate">{currentDoc?.name ?? t.untitled}</span>
            <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
              {words} {t.words} · {chars} {t.chars}
            </span>
          </div>
          <div className="flex items-center justify-center w-1/3">
            <ViewControls
              viewMode={viewMode}
              onChange={setViewMode}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
            />
          </div>
          <div className="flex items-center justify-end w-1/3">
            <button
              onClick={() => setFocusMode(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm shrink-0"
              title={t.exitFocus}
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">{t.exitFocus}</span>
            </button>
          </div>
        </header>
      ) : (
        <header className="flex items-center px-3 py-2 sm:px-6 sm:py-4 border-b border-border bg-card/50 backdrop-blur-sm">
          {/* 左侧：Logo + 文档列表 + 帮助 */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 sm:w-1/3">
            <button
              onClick={() => setShowMobileDocs(true)}
              className="md:hidden min-w-12 min-h-12 sm:min-w-0 sm:min-h-0 sm:p-2 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              title={t.docs}
              aria-label={t.docs}
            >
              <FileText className="w-5 h-5" />
            </button>
            <button
              onClick={toggleSidebar}
              className="hidden md:flex items-center justify-center p-2 rounded-lg hover:bg-muted transition-colors"
              title={sidebarCollapsed ? t.expandSidebar : t.collapseSidebar}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
            <a href="https://ale160.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="https://ale160.com/images/logo-icon.png" alt="Logo" className="w-8 h-8 rounded" />
              <span className="hidden sm:inline text-xl sm:text-2xl font-bold text-primary">{t.appName}</span>
            </a>
            <button
              onClick={() => setShowHelp(true)}
              className="min-w-12 min-h-12 sm:min-w-0 sm:min-h-0 sm:p-2 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              title={t.help}
              aria-label={t.help}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>

          {/* 中间：视图模式切换 */}
          <div className="flex items-center justify-center w-1/3">
            <ViewControls
              viewMode={viewMode}
              onChange={setViewMode}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
            />
          </div>

          {/* 右侧：桌面端功能按钮 / 移动端菜单按钮 */}
          <div className="flex items-center justify-end w-1/3">
            {/* 桌面端：直接显示功能按钮 */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setFocusMode(true)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title={t.focusMode}
                aria-label={t.focusMode}
              >
                <Focus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title={t.history}
                aria-label={t.history}
              >
                <History className="w-5 h-5" />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title={t.copy}
                aria-label={t.copy}
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title={t.export}
                aria-label={t.export}
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handleToggleLanguage}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title={t.language}
                aria-label={t.language}
              >
                <Globe className="w-5 h-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title={t.theme}
                aria-label={t.theme}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            {/* 移动端：菜单切换按钮 */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden min-w-12 min-h-12 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>
      )}

      {/* 移动端下拉菜单 */}
      {!focusMode && showMobileMenu && (
        <div className="sm:hidden border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex items-center justify-around px-2 py-2">
            <button
              onClick={() => { setFocusMode(true); setShowMobileMenu(false); }}
              className="min-w-12 min-h-12 flex flex-col items-center justify-center gap-1 rounded-lg hover:bg-muted transition-colors"
              aria-label={t.focusMode}
            >
              <Focus className="w-5 h-5" />
              <span className="text-[10px] text-muted-foreground">{t.focusMode}</span>
            </button>
            <button
              onClick={() => { setShowHistory(true); setShowMobileMenu(false); }}
              className="min-w-12 min-h-12 flex flex-col items-center justify-center gap-1 rounded-lg hover:bg-muted transition-colors"
              aria-label={t.history}
            >
              <History className="w-5 h-5" />
              <span className="text-[10px] text-muted-foreground">{t.history}</span>
            </button>
            <button
              onClick={() => { void handleCopy(); setShowMobileMenu(false); }}
              className="min-w-12 min-h-12 flex flex-col items-center justify-center gap-1 rounded-lg hover:bg-muted transition-colors"
              aria-label={t.copy}
            >
              <Copy className="w-5 h-5" />
              <span className="text-[10px] text-muted-foreground">{t.copy}</span>
            </button>
            <button
              onClick={() => { handleExport(); setShowMobileMenu(false); }}
              className="min-w-12 min-h-12 flex flex-col items-center justify-center gap-1 rounded-lg hover:bg-muted transition-colors"
              aria-label={t.export}
            >
              <Download className="w-5 h-5" />
              <span className="text-[10px] text-muted-foreground">{t.export}</span>
            </button>
            <button
              onClick={() => { handleToggleLanguage(); setShowMobileMenu(false); }}
              className="min-w-12 min-h-12 flex flex-col items-center justify-center gap-1 rounded-lg hover:bg-muted transition-colors"
              aria-label={t.language}
            >
              <Globe className="w-5 h-5" />
              <span className="text-[10px] text-muted-foreground">{t.language}</span>
            </button>
            <button
              onClick={() => { toggleTheme(); setShowMobileMenu(false); }}
              className="min-w-12 min-h-12 flex flex-col items-center justify-center gap-1 rounded-lg hover:bg-muted transition-colors"
              aria-label={t.theme}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="text-[10px] text-muted-foreground">{t.theme}</span>
            </button>
          </div>
        </div>
      )}

      {/* 主体：侧边栏 + 编辑区 */}
      <div
        className="flex-1 min-h-0 flex"
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget === e.target) setDragActive(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files.length > 0) {
            handleImportFiles(e.dataTransfer.files);
          }
        }}
      >
        {!focusMode && !sidebarCollapsed && (
          <DocSidebar
            docs={docs}
            currentDocId={currentDocId}
            search={search}
            onSearchChange={setSearch}
            onSelect={handleSelectDoc}
            onNew={handleNewDoc}
            onRename={handleRename}
            onDelete={handleDeleteDoc}
            onImport={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.md,.markdown,.txt,text/markdown,text/plain';
              input.multiple = true;
              input.onchange = () => {
                if (input.files && input.files.length > 0) {
                  handleImportFiles(input.files);
                }
              };
              input.click();
            }}
            mobileOpen={showMobileDocs}
            onClose={() => setShowMobileDocs(false)}
          />
        )}

        {editorArea}

        {/* 拖拽导入提示层 */}
        {dragActive && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-primary/10 border-2 border-dashed border-primary rounded-2xl px-12 py-8 flex flex-col items-center gap-3">
              <FolderUp className="w-10 h-10 text-primary" />
              <span className="text-lg font-medium text-primary">{t.importMd}</span>
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
        defaultName={currentDoc?.name || `web-text-${new Date().toISOString().slice(0, 10)}`}
        onExport={doExport}
        onExportHtml={handleExportHtml}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
      />
      <RenameModal
        isOpen={showRename}
        onClose={() => setShowRename(false)}
        currentName={renameTarget?.name}
        onRename={doRename}
      />
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {!focusMode && (
        <footer className="flex items-center justify-center gap-4 px-4 py-2 border-t border-gray-200 dark:border-border bg-background/50 text-xs text-muted-foreground">
          <span className="hidden sm:inline">
            {words} {t.words} · {chars} {t.chars}
          </span>
          <a
            href="https://github.com/ale-160/web-text.git"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
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
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <img src="https://ale160.com/images/Avatar-SVG.png" alt="" className="w-3.5 h-3.5" />
            <span>{t.ale160}</span>
          </a>
        </footer>
      )}
    </div>
  );
}
