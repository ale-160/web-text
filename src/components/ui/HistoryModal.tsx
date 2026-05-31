'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { HistoryEntry, getStorageInfo, formatSize } from '@/utils/storage';
import { Pin, PinOff, Trash2 } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  pinned: HistoryEntry[];
  currentContent: string;
  onRestore: (version: HistoryEntry) => void;
  onDelete: (versionId: string) => void;
  onTogglePin: (version: HistoryEntry) => void;
}

export const HistoryModal = ({
  isOpen,
  onClose,
  history,
  pinned,
  currentContent,
  onRestore,
  onDelete,
  onTogglePin,
}: HistoryModalProps) => {
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return t.justNow;
    if (diff < 3600000) return `${Math.floor(diff / 60000)} ${t.minutesAgo}`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ${t.hoursAgo}`;
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US');
  };

  const storageInfo = getStorageInfo(currentContent, history, pinned);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">{t.historyPanelTitle}</h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded hover:bg-muted"
          >
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
          {history.length === 0 && pinned.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {t.noHistory}
            </div>
          ) : (
            <div className="space-y-0">
              {/* 固定版本 */}
              {pinned.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-muted/30 text-xs font-medium text-muted-foreground sticky top-0">
                    {t.pinned} ({pinned.length})
                  </div>
                  {pinned.map(version => (
                    <div
                      key={version.id}
                      className="p-3 hover:bg-muted cursor-pointer transition-colors border-b border-border last:border-b-0"
                    >
                      <div className="flex items-start justify-between">
                        <div 
                          className="flex-1"
                          onClick={() => onRestore(version)}
                        >
                          <div className="text-sm text-muted-foreground">{formatTime(version.timestamp)}</div>
                          <div className="mt-1 text-sm truncate">{version.content.slice(0, 50) + (version.content.length > 50 ? '...' : '')}</div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePin(version);
                            }}
                            className="p-1.5 rounded hover:bg-muted/70"
                            title={t.unpin}
                          >
                            <PinOff className="w-4 h-4 text-yellow-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(version.id);
                            }}
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
                        <div 
                          className="flex-1"
                          onClick={() => onRestore(version)}
                        >
                          <div className="text-sm text-muted-foreground">{formatTime(version.timestamp)}</div>
                          <div className="mt-1 text-sm truncate">{version.content.slice(0, 50) + (version.content.length > 50 ? '...' : '')}</div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePin(version);
                            }}
                            className="p-1.5 rounded hover:bg-muted/70"
                            title={t.pin}
                          >
                            <Pin className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(version.id);
                            }}
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
  );
};
