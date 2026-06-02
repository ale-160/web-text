'use client';

import { useState, useEffect, useCallback } from 'react';
import { Language, getStrings } from '@/data/i18n';

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
  // 初始状态用英文，与服务端渲染一致，避免 hydration 错误
  const [language, setLanguage] = useState<Language>('en');
  const [isMounted, setIsMounted] = useState(false);

  // 客户端挂载后，检测浏览器语言和本地存储
  useEffect(() => {
    setIsMounted(true);

    // 检查本地存储
    const saved = localStorage.getItem('web-text-language');
    if (saved === 'en' || saved === 'zh') {
      if (saved !== language) {
        setLanguage(saved);
      }
      return;
    }

    // 如果没有保存，则检测浏览器语言
    const browserLang = getBrowserLanguage();
    if (browserLang !== language) {
      setLanguage(browserLang);
    }
  }, [language]);

  // 保存语言设置到本地存储
  useEffect(() => {
    if (typeof window !== 'undefined' && isMounted) {
      const saved = localStorage.getItem('web-text-language');
      if (!saved) {
        localStorage.setItem('web-text-language', language);
      }
    }
  }, [language, isMounted]);

  const toggleLanguage = useCallback(() => {
    const prevLang = language;
    const newLang = prevLang === 'zh' ? 'en' : 'zh';

    setLanguage(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('web-text-language', newLang);
    }

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
