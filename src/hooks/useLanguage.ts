
import { useEffect } from 'react';
import i18next from '@/utils/translations';

export function useLanguage() {
  useEffect(() => {
    // Set Hebrew language and RTL direction on the HTML element
    document.documentElement.lang = 'he';
    document.documentElement.dir = 'rtl';
    
    // Ensure i18next is using Hebrew
    i18next.changeLanguage('he');
  }, []);
  
  return 'he';
}
