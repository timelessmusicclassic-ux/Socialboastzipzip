import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { storage } from '../services/storage';

interface ThemeContextType {
  theme: 'light' | 'dark';
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => storage.getTheme());

  useEffect(() => {
    // Apply theme to document on mount
    const initial = storage.getTheme();
    setThemeState(initial);
    if (initial === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }

    const handleThemeChange = (e: any) => {
      const newTheme = e.detail?.theme || storage.getTheme();
      setThemeState(newTheme);
    };

    window.addEventListener('rss_theme_changed', handleThemeChange);
    return () => window.removeEventListener('rss_theme_changed', handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const next = storage.toggleTheme();
    setThemeState(next);
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    storage.setTheme(newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback if rendered outside ThemeProvider
    const currentTheme = storage.getTheme();
    return {
      theme: currentTheme,
      isDark: currentTheme === 'dark',
      toggleTheme: () => storage.toggleTheme(),
      setTheme: (t: 'light' | 'dark') => storage.setTheme(t)
    };
  }
  return context;
};
