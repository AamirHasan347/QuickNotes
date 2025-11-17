'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { ACCENT_COLOR_VALUES } from '@/components/settings/AccentColorPicker';

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
    const fontSize = settings.fontSize || 'medium';
    root.style.fontSize = fontSizeMap[fontSize] || fontSizeMap.medium;
  }, [settings.fontSize]);

  // Apply font family
  useEffect(() => {
    const root = document.documentElement;
    const fontFamilyMap: Record<string, string> = {
      'public-sans': 'var(--font-body)',
      'inter': 'var(--font-inter)',
      'system': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      'roboto': 'var(--font-roboto)',
      'poppins': 'var(--font-poppins)',
      'lora': 'var(--font-lora)',
      'jetbrains-mono': 'var(--font-jetbrains-mono)',
      'comic-neue': 'var(--font-comic-neue)',
      'minecraft': 'var(--font-minecraft)',
    };
    const fontFamily = settings.fontFamily || 'public-sans';
    root.style.setProperty('--active-font-family', fontFamilyMap[fontFamily] || fontFamilyMap['public-sans']);
  }, [settings.fontFamily]);

  // Apply line height
  useEffect(() => {
    const root = document.documentElement;
    const lineHeightMap: Record<string, string> = {
      'compact': '1.4',
      'normal': '1.6',
      'relaxed': '1.8',
    };
    const lineHeight = settings.lineHeight || 'normal';
    root.style.setProperty('--editor-line-height', lineHeightMap[lineHeight] || lineHeightMap.normal);
  }, [settings.lineHeight]);

  // Apply accent color
  useEffect(() => {
    const root = document.documentElement;
    // Fallback to 'blue' if accentColor is undefined or invalid
    const accentColor = settings.accentColor || 'blue';
    const accentColors = ACCENT_COLOR_VALUES[accentColor] || ACCENT_COLOR_VALUES.blue;

    root.style.setProperty('--accent-primary', accentColors.primary);
    root.style.setProperty('--accent-light', accentColors.light);
    root.style.setProperty('--accent-hover', accentColors.hover);
  }, [settings.accentColor]);

  // Apply UI density (currently disabled - CSS rules removed to prevent Tailwind override)
  // This will be re-enabled when components are properly tagged with density classes
  useEffect(() => {
    // Reserved for future implementation
    // const root = document.documentElement;
    // const body = document.body;
    // ... density application logic ...
  }, [settings.uiDensity]);

  // Apply animation preferences
  useEffect(() => {
    const body = document.body;

    if (settings.reduceAnimations) {
      body.classList.add('reduce-motion');
    } else {
      body.classList.remove('reduce-motion');
    }
  }, [settings.reduceAnimations]);

  // Apply GPU acceleration
  useEffect(() => {
    const body = document.body;

    if (settings.gpuAcceleration) {
      body.classList.add('gpu-accelerated');
    } else {
      body.classList.remove('gpu-accelerated');
    }
  }, [settings.gpuAcceleration]);

  return <>{children}</>;
}
