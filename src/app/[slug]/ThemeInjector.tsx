'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ThemeInjectorProps {
  styles: string;
  slug: string;
}

export default function ThemeInjector({ styles: initialStyles, slug }: ThemeInjectorProps) {
  const router = useRouter();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'UPDATE_SITE_DATA') {
        const siteData = event.data.data;
        
        if (siteData.theme) {
          const { color1, color2, angle, fontFamily } = siteData.theme;
          document.documentElement.style.setProperty('--color1', color1);
          document.documentElement.style.setProperty('--color2', color2);
          document.documentElement.style.setProperty('--angle', `${angle}deg`);
          if (fontFamily) {
            document.documentElement.style.setProperty('--font-family', fontFamily);
          }
        }
        
        window.dispatchEvent(new CustomEvent('SITE_DATA_LIVE_UPDATE', { 
          detail: siteData 
        }));
      }

      // Nueva lógica de navegación reactiva
      if (event.data && event.data.type === 'NAVIGATE') {
        const targetRoute = event.data.route;
        const targetPath = targetRoute === '/' ? `/${slug}` : `/${slug}${targetRoute}`;
        router.push(targetPath);
      }

      // Lógica de Scroll Contextual
      if (event.data && event.data.type === 'SCROLL_TO') {
        const sectionId = event.data.section;
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (sectionId === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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
