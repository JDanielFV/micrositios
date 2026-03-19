'use client';

import { useEffect } from 'react';

interface ThemeInjectorProps {
  styles: string;
}

export default function ThemeInjector({ styles: initialStyles }: ThemeInjectorProps) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security check - origin check is already done by PreviewPanel
      if (event.data && event.data.type === 'UPDATE_SITE_DATA') {
        const siteData = event.data.data;
        
        // Update CSS variables if theme exists
        if (siteData.theme) {
          const { color1, color2, angle, fontFamily } = siteData.theme;
          document.documentElement.style.setProperty('--color1', color1);
          document.documentElement.style.setProperty('--color2', color2);
          document.documentElement.style.setProperty('--angle', `${angle}deg`);
          if (fontFamily) {
            document.documentElement.style.setProperty('--font-family', fontFamily);
          }
        }
        
        // Dispatch custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('SITE_DATA_LIVE_UPDATE', { 
          detail: siteData 
        }));
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Inyectar estilos iniciales
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-theme-injector', 'true');
    styleElement.textContent = initialStyles;
    document.head.appendChild(styleElement);

    return () => {
      window.removeEventListener('message', handleMessage);
      const elementToRemove = document.querySelector('style[data-theme-injector="true"]');
      if (elementToRemove) elementToRemove.remove();
    };
  }, [initialStyles]);

  return null;
}
