
import { useState, useEffect } from 'react';

export function useDashboardPrivacy() {
  const [hideNumbers, setHideNumbers] = useState(false);

  useEffect(() => {
    const storedPreference = localStorage.getItem('hideNumbers');
    if (storedPreference) {
      setHideNumbers(storedPreference === 'true');
    }
  }, []);

  const toggleNumberVisibility = () => {
    const newState = !hideNumbers;
    setHideNumbers(newState);
    localStorage.setItem('hideNumbers', String(newState));
  };

  return { hideNumbers, toggleNumberVisibility };
}
