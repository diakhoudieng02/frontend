
// src/hooks/use-theme.ts
import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    // Préférer le mode sombre par défaut ou détection système
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Supprimer les classes précédentes
    root.classList.remove('light', 'dark');
    // Ajouter la nouvelle classe
    root.classList.add(theme);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return { theme, setTheme };
   const toggleTheme = useCallback(() => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
}
