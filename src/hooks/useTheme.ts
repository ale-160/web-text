'use client';

import { useState, useEffect } from 'react';

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('webtext-theme');
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
    localStorage.setItem('webtext-theme', newTheme);
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
