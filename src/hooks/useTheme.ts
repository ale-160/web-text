'use client';

import { useState, useEffect } from 'react';

// 保持与 storage.ts 一致的 key
const THEME_KEY = 'web-text-theme';

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  }
  return 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return {
    theme,
    toggleTheme,
    isMounted
  };
}
