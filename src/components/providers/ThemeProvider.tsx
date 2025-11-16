'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/lib/store/useSettingsStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettingsStore();

  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;

      // Remove existing theme classes
      root.classList.remove('light', 'dark');

      if (settings.theme === 'auto') {
        // Check system preference
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(isDark ? 'dark' : 'light');
      } else {
        root.classList.add(settings.theme);
      }
    };

    applyTheme();

    // Listen for system theme changes if using auto
    if (settings.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.fontSize = fontSizeMap[settings.fontSize];
  }, [settings.fontSize]);

  // Apply font family
  useEffect(() => {
    const root = document.documentElement;
    const fontFamilyMap = {
      'public-sans': 'var(--font-body)',
      'inter': 'Inter, sans-serif',
      'system': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    };
    root.style.setProperty('--active-font-family', fontFamilyMap[settings.fontFamily]);
  }, [settings.fontFamily]);

  return <>{children}</>;
}
