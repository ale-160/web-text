'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { useState, useRef, useEffect } from 'react';
import { FileCode2, Archive, RotateCcw } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultName: string;
  onExport: (fileName: string) => void;
  onExportHtml: (fileName: string) => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
}

export const ExportModal = ({
  isOpen,
  onClose,
  defaultName,
  onExport,
  onExportHtml,
  onExportBackup,
  onImportBackup,
}: ExportModalProps) => {
  const { t } = useLanguage();
  const [fileName, setFileName] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFileName(defaultName);
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [defaultName, isOpen]);

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (fileName.trim()) {
      onExport(fileName.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  const actionButtonClass =
    'w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors text-left';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">{t.exportFile}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-muted"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {t.fileName}
            </label>
            <input
              ref={inputRef}
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-2 justify-end mb-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md hover:bg-muted transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              {t.export}
            </button>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <button
              type="button"
              onClick={() => {
                if (fileName.trim()) {
                  onExportHtml(fileName.trim());
                  onClose();
                }
              }}
              className={actionButtonClass}
            >
              <FileCode2 className="w-4 h-4 shrink-0" />
              <span className="text-sm">{t.exportHtml}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onExportBackup();
                onClose();
              }}
              className={actionButtonClass}
            >
              <Archive className="w-4 h-4 shrink-0" />
              <span className="text-sm">{t.exportBackup}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onImportBackup();
                onClose();
              }}
              className={actionButtonClass}
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span className="text-sm">{t.importBackup}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
