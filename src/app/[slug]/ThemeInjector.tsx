'use client';

import { useEffect } from 'react';

interface ThemeInjectorProps {
  styles: string;
}

export default function ThemeInjector({ styles }: ThemeInjectorProps) {
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-theme-injector', 'true'); // Custom attribute for easy identification
    styleElement.textContent = styles;

    // Remove any previously injected styles by this component
    const existingStyleElements = document.querySelectorAll('style[data-theme-injector="true"]');
    existingStyleElements.forEach(el => el.remove());

    document.head.appendChild(styleElement);

    return () => {
      // Cleanup: remove styles when component unmounts
      const elementToRemove = document.querySelector('style[data-theme-injector="true"]');
      if (elementToRemove) {
        elementToRemove.remove();
      }
    };
  }, [styles]); // Re-run effect if styles change

  return null; // This component doesn't render anything directly
}
