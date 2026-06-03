'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { useState, useRef, useEffect } from 'react';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName?: string;
  onRename: (newName: string) => void;
}

export const RenameModal = ({
  isOpen,
  onClose,
  currentName = '',
  onRename,
}: RenameModalProps) => {
  const { t } = useLanguage();
  const [name, setName] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(currentName);
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [currentName, isOpen]);

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (name.trim()) {
      onRename(name.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">{t.rename}</h3>
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
              {t.name}
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-2 justify-end">
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
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
