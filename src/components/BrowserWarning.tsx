'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const WARNING_DISMISSED_KEY = 'web-text-browser-warning-dismissed';

export function BrowserWarning() {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user already dismissed the warning
    const dismissed = localStorage.getItem(WARNING_DISMISSED_KEY);
    if (dismissed === 'true') return;

    const ua = navigator.userAgent;
    const isChrome = /Chrome\/(\d+)/.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua);
    const isEdge = /Edg\/(\d+)/.test(ua);
    const chromeMatch = ua.match(/Chrome\/(\d+)/);
    const edgeMatch = ua.match(/Edg\/(\d+)/);
    const chromeVersion = chromeMatch ? parseInt(chromeMatch[1], 10) : 0;
    const edgeVersion = edgeMatch ? parseInt(edgeMatch[1], 10) : 0;

    if ((isChrome && chromeVersion >= 149) || (isEdge && edgeVersion >= 149)) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(WARNING_DISMISSED_KEY, 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{t.browserWarning}</span>
      <button
        onClick={handleDismiss}
        className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors p-1"
        title="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
