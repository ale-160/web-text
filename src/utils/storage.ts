/**
 * 存储工具函数
 */

export interface HistoryEntry {
  id: string;
  content: string;
  timestamp: number;
  pinned?: boolean;
}

export interface StorageInfo {
  totalSize: number;
  contentSize: number;
  historySize: number;
  pinnedSize: number;
}

const STORAGE_KEYS = {
  CONTENT: 'webtext-content',
  HISTORY: 'webtext-history',
  PINNED: 'webtext-pinned',
  LANGUAGE: 'webtext-language',
  THEME: 'webtext-theme',
};

// 获取字符串字节大小
export const getTextSize = (text: string): number => {
  return new Blob([text]).size;
};

// 格式化显示大小
export const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// 内容存储
export const saveContent = (content: string): void => {
  localStorage.setItem(STORAGE_KEYS.CONTENT, content);
};

export const loadContent = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.CONTENT);
};

// 历史记录存储
export const saveHistory = (history: HistoryEntry[]): void => {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
};

export const loadHistory = (): HistoryEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
  try {
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const savePinned = (pinned: HistoryEntry[]): void => {
  localStorage.setItem(STORAGE_KEYS.PINNED, JSON.stringify(pinned));
};

export const loadPinned = (): HistoryEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PINNED);
  try {
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// 获取存储使用情况
export const getStorageInfo = (content: string, history: HistoryEntry[], pinned: HistoryEntry[]): StorageInfo => {
  const contentSize = getTextSize(content);
  const historySize = history.reduce((acc, item) => acc + getTextSize(item.content), 0);
  const pinnedSize = pinned.reduce((acc, item) => acc + getTextSize(item.content), 0);
  
  return {
    totalSize: contentSize + historySize + pinnedSize,
    contentSize,
    historySize,
    pinnedSize,
  };
};
