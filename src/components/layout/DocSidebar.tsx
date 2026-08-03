'use client';

import { FileText, Plus, Search, Upload, Pencil, Trash2, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Doc } from '@/utils/storage';

interface DocSidebarProps {
  docs: Doc[];
  currentDocId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (docId: string) => void;
  onNew: () => void;
  onRename: (doc: Doc) => void;
  onDelete: (doc: Doc) => void;
  onImport: () => void;
  mobileOpen: boolean;
  onClose: () => void;
}

export function DocSidebar({
  docs,
  currentDocId,
  search,
  onSearchChange,
  onSelect,
  onNew,
  onRename,
  onDelete,
  onImport,
  mobileOpen,
  onClose,
}: DocSidebarProps) {
  const { t, language } = useLanguage();

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US');
  };

  const filtered = docs.filter((doc) =>
    doc.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const renderContent = () => (
    <>
      {/* 头部：标题 + 操作 */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <span className="text-sm font-semibold">{t.docs}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onImport}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            title={t.importMd}
            aria-label={t.importMd}
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={onNew}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            title={t.newDoc}
            aria-label={t.newDoc}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchDocs}
            className="w-full pl-8 pr-2 py-1.5 text-sm bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* 文档列表 */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">{t.noDocs}</div>
        ) : (
          filtered.map((doc) => {
            const active = doc.id === currentDocId;
            return (
              <div
                key={doc.id}
                onClick={() => onSelect(doc.id)}
                className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{doc.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {formatTime(doc.updatedAt)}
                  </div>
                </div>
                <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRename(doc);
                    }}
                    className="p-1 rounded hover:bg-muted/70"
                    title={t.rename}
                    aria-label={t.rename}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(doc);
                    }}
                    className="p-1 rounded hover:bg-muted/70"
                    title={t.deleteDoc}
                    aria-label={t.deleteDoc}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );

  return (
    <>
      {/* 桌面端：常驻侧栏 */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card/40">
        {renderContent()}
      </aside>

      {/* 移动端：抽屉 */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border flex flex-col shadow-xl">
            <div className="flex justify-end p-2">
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex flex-col min-h-0">{renderContent()}</div>
          </aside>
        </div>
      )}
    </>
  );
}
