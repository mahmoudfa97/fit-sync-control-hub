
import { useEffect } from 'react';
import { useAppSelector } from './redux';

export function useLanguage() {
  const language = useAppSelector((state) => state.settings.language);

  useEffect(() => {
    // Set the language and direction on the HTML element
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  return language;
}
