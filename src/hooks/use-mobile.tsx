'use client';

import { useState, useEffect, useCallback } from 'react';

const MOBILE_BREAKPOINT = 768;
export const MOBILE_VIEW_OVERRIDE_KEY = 'dartbrig_view_mode';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  const checkDevice = useCallback(() => {
    if (typeof window === 'undefined') return;

    let override = null;
    try {
      override = sessionStorage.getItem(MOBILE_VIEW_OVERRIDE_KEY);
    } catch (e) {
      console.warn('Could not access sessionStorage.');
    }
    
    if (override === 'mobile') {
      setIsMobile(true);
    } else if (override === 'desktop') {
      setIsMobile(false);
    } else {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }
  }, []);

  useEffect(() => {
    checkDevice();
    const customEventName = 'viewmodechange';
    
    // Слушаем изменение размера окна и кастомное событие переключения режима
    window.addEventListener('resize', checkDevice);
    window.addEventListener(customEventName, checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener(customEventName, checkDevice);
    };
  }, [checkDevice]);

  return isMobile;
}
