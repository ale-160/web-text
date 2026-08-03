/**
 * 存储工具函数（IndexedDB）
 *
 * 数据模型：
 * - docs: 文档列表 { id, name, content, createdAt, updatedAt }
 * - history: 历史版本 { id, docId, content, timestamp, pinned?, name? }
 *   （pinned 已并入 history，以 pinned 标记区分）
 *
 * 旧版本数据（localStorage）首次打开时自动迁移，迁移后删除旧键。
 * 语言/主题等轻量设置仍存 localStorage。
 */

export interface Doc {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface HistoryEntry {
  id: string;
  docId: string;
  content: string;
  timestamp: number;
  pinned?: boolean;
  name?: string;
}

export interface StorageInfo {
  totalSize: number;
  contentSize: number;
  historySize: number;
  pinnedSize: number;
}

export interface BackupData {
  format: 'web-text-backup';
  version: 1;
  exportedAt: string;
  docs: Doc[];
  history: HistoryEntry[];
}

const DB_NAME = 'web-text-db';
const DB_VERSION = 1;
const STORE_DOCS = 'docs';
const STORE_HISTORY = 'history';

const LEGACY_KEYS = ['web-text-content', 'web-text-history', 'web-text-pinned'];

// 生成唯一 ID
export const uid = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

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

// ---------- IndexedDB 基础 ----------

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_DOCS)) {
        db.createObjectStore(STORE_DOCS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_HISTORY)) {
        const store = db.createObjectStore(STORE_HISTORY, { keyPath: 'id' });
        store.createIndex('docId', 'docId', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ---------- 文档 ----------

export async function loadDocs(): Promise<Doc[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_DOCS, 'readonly');
  const all = await reqToPromise(tx.objectStore(STORE_DOCS).getAll() as IDBRequest<Doc[]>);
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveDoc(doc: Doc): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_DOCS, 'readwrite');
  await reqToPromise(tx.objectStore(STORE_DOCS).put(doc));
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteDocWithHistory(docId: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([STORE_DOCS, STORE_HISTORY], 'readwrite');
  tx.objectStore(STORE_DOCS).delete(docId);
  const historyStore = tx.objectStore(STORE_HISTORY);
  const index = historyStore.index('docId');
  const keys = await reqToPromise(index.getAllKeys(docId) as IDBRequest<IDBValidKey[]>);
  keys.forEach((key) => historyStore.delete(key));
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---------- 历史版本 ----------

export async function loadHistory(docId: string): Promise<HistoryEntry[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_HISTORY, 'readonly');
  const index = tx.objectStore(STORE_HISTORY).index('docId');
  const all = await reqToPromise(index.getAll(docId) as IDBRequest<HistoryEntry[]>);
  return all.sort((a, b) => b.timestamp - a.timestamp);
}

// 覆盖式保存某文档的全部历史（先删后写，保证一致性）
export async function saveHistory(docId: string, entries: HistoryEntry[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_HISTORY, 'readwrite');
  const store = tx.objectStore(STORE_HISTORY);
  const index = store.index('docId');
  const keys = await reqToPromise(index.getAllKeys(docId) as IDBRequest<IDBValidKey[]>);
  keys.forEach((key) => store.delete(key));
  entries.forEach((entry) => store.put(entry));
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---------- 存储用量统计 ----------

export const getStorageInfo = (
  content: string,
  history: HistoryEntry[],
  pinned: HistoryEntry[]
): StorageInfo => {
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

// 重命名历史记录
export const renameHistoryEntry = (
  entryId: string,
  newName: string,
  history: HistoryEntry[],
  pinned: HistoryEntry[]
): { history: HistoryEntry[]; pinned: HistoryEntry[] } => {
  const updatedHistory = history.map((item) =>
    item.id === entryId ? { ...item, name: newName } : item
  );

  const updatedPinned = pinned.map((item) =>
    item.id === entryId ? { ...item, name: newName } : item
  );

  return { history: updatedHistory, pinned: updatedPinned };
};

// ---------- 备份 / 恢复 ----------

export async function exportBackup(): Promise<BackupData> {
  const db = await openDB();
  const tx = db.transaction([STORE_DOCS, STORE_HISTORY], 'readonly');
  const storedDocs = await reqToPromise(tx.objectStore(STORE_DOCS).getAll() as IDBRequest<Doc[]>);
  const storedHistory = await reqToPromise(
    tx.objectStore(STORE_HISTORY).getAll() as IDBRequest<HistoryEntry[]>
  );
  return {
    format: 'web-text-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    docs: storedDocs,
    history: storedHistory,
  };
}

export async function importBackup(data: BackupData): Promise<{ docs: number; history: number }> {
  const docs = Array.isArray(data.docs) ? data.docs : [];
  const history = Array.isArray(data.history) ? data.history : [];
  const db = await openDB();
  const tx = db.transaction([STORE_DOCS, STORE_HISTORY], 'readwrite');
  const docStore = tx.objectStore(STORE_DOCS);
  const historyStore = tx.objectStore(STORE_HISTORY);
  // 清空现有数据，恢复为备份时的状态
  const allDocKeys = await reqToPromise(docStore.getAllKeys() as IDBRequest<IDBValidKey[]>);
  allDocKeys.forEach((key) => docStore.delete(key));
  const allHistoryKeys = await reqToPromise(historyStore.getAllKeys() as IDBRequest<IDBValidKey[]>);
  allHistoryKeys.forEach((key) => historyStore.delete(key));
  docs.forEach((doc) => docStore.put(doc));
  history.forEach((entry) => historyStore.put(entry));
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return { docs: docs.length, history: history.length };
}

// ---------- 旧数据迁移 ----------

// 将 localStorage 中的旧数据迁移为 IndexedDB 文档。
// 返回迁移创建的文档 id（无旧数据时返回 null）。
export async function migrateLegacyStorage(defaultName: string): Promise<string | null> {
  const legacyContent = localStorage.getItem(LEGACY_KEYS[0]);
  if (legacyContent === null) {
    // 无旧内容但可能有历史（异常状态），清理残留键
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    return null;
  }

  const now = Date.now();
  const docId = uid();
  const doc: Doc = {
    id: docId,
    name: defaultName,
    content: legacyContent,
    createdAt: now,
    updatedAt: now,
  };
  await saveDoc(doc);

  // 迁移历史与固定版本
  let legacyHistory: HistoryEntry[] = [];
  let legacyPinned: HistoryEntry[] = [];
  try {
    const rawHistory = localStorage.getItem(LEGACY_KEYS[1]);
    legacyHistory = rawHistory ? JSON.parse(rawHistory) : [];
  } catch {
    legacyHistory = [];
  }
  try {
    const rawPinned = localStorage.getItem(LEGACY_KEYS[2]);
    legacyPinned = rawPinned ? JSON.parse(rawPinned) : [];
  } catch {
    legacyPinned = [];
  }

  const merged: HistoryEntry[] = [...legacyPinned, ...legacyHistory]
    .filter((item) => item && typeof item.id === 'string')
    .map((item) => ({
      id: item.id,
      docId,
      content: String(item.content ?? ''),
      timestamp: Number(item.timestamp) || Date.now(),
      pinned: Boolean(item.pinned),
      name: typeof item.name === 'string' ? item.name : undefined,
    }));

  if (merged.length > 0) {
    await saveHistory(docId, merged);
  }

  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  return docId;
}
