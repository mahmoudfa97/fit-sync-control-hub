
import { useEffect } from 'react';
import i18next from '@/utils/translations';
import { useAppSelector } from './redux';

export function useLanguage() {
  const settings = useAppSelector((state) => state.settings);
  
  useEffect(() => {
    // Get language from settings or default to Hebrew
    const lang = settings?.language === 'en' ? 'en' : 'he';
    
    // Set language and RTL direction on the HTML element
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    
    // Ensure i18next is using the correct language
    i18next.changeLanguage(lang);
  }, [settings?.language]);
  
  return settings?.language || 'he';
}
