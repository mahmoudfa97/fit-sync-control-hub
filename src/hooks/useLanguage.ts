
import { useEffect } from 'react';

export function useLanguage() {
  useEffect(() => {
    // Set Hebrew language and RTL direction on the HTML element
    document.documentElement.lang = 'he';
    document.documentElement.dir = 'rtl';
  }, []);
  
  return 'he';
}
