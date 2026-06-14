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

export function useLanguage(defaultLang?: Language) {
  const [language, setLanguage] = useState<Language>(defaultLang ?? 'en');
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

    // 优先使用路由传入的 defaultLang，其次浏览器检测
    const browserLang = defaultLang ?? getBrowserLanguage();
    if (browserLang !== language) {
      setLanguage(browserLang);
    }
  }, [language, defaultLang]);

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
