'use client';

import { useState, useEffect, useCallback } from 'react';
import { Language, getStrings } from '@/data/i18n';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('zh');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('webtext-language');
    if (saved === 'en' || saved === 'zh') {
      setLanguage(saved);
    }
    setIsMounted(true);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => {
      const newLang = prev === 'zh' ? 'en' : 'zh';
      localStorage.setItem('webtext-language', newLang);
      return newLang;
    });
  }, []);

  const t = getStrings(language);

  return {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isMounted
  };
}
