'use client';

import { useState, useEffect, useCallback } from 'react';
import { Language, getStrings } from '@/data/i18n';

function getInitialLanguage(): Language {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('webtext-language');
    if (saved === 'en' || saved === 'zh') {
      return saved;
    }
  }
  return 'zh';
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleLanguage = useCallback(() => {
    const prevLang = language;
    const newLang = prevLang === 'zh' ? 'en' : 'zh';
    
    setLanguage(newLang);
    localStorage.setItem('webtext-language', newLang);
    
    // 返回之前的语言用于显示提示
    return prevLang;
  }, [language]);

  const t = getStrings(language);

  return {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isMounted
  };
}
