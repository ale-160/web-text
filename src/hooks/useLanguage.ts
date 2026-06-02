'use client';

import {useCallback, useEffect, useState} from 'react';
import {getStrings, Language} from '@/data/i18n';

function getBrowserLanguage(): Language {
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language || (navigator as any).userLanguage;
    if (browserLang && browserLang.startsWith('zh')) {
      return 'zh';
    }
  }
  return 'en';
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const saved = localStorage.getItem('web-text-language');
    if (saved === 'en' || saved === 'zh') {
      if (saved !== language) {
        setLanguage(saved);
      }
      return;
    }

    const browserLang = getBrowserLanguage();
    if (browserLang !== language) {
      setLanguage(browserLang);
    }
  }, [language]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isMounted) {
      const saved = localStorage.getItem('web-text-language');
      if (!saved) {
        localStorage.setItem('web-text-language', language);
      }
    }
  }, [language, isMounted]);

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'zh' ? 'en' : 'zh';

    setLanguage(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('web-text-language', newLang);
    }

    return newLang;
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
