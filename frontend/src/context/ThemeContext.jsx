import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Lee desde localStorage o usa 'dark' como predeterminado
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    console.log('Theme changed to:', theme);

    // Aplicar tema tanto con clases CSS como con variables directas
    const root = document.documentElement;
    const body = document.body;

    // Limpiar clases existentes
    body.classList.remove('light-theme');

    if (theme === 'light') {
      body.classList.add('light-theme');
      console.log('Added light-theme class to body');

      // Aplicar variables directamente como respaldo
      const lightVars = {
        '--color-background': '#f9f9f9',
        '--color-surface': '#ffffff',
        '--color-surface-secondary': '#f8f9fa',
        '--color-surface-accent': '#f2f2f2',
        '--color-text-primary': '#213547',
        '--color-text-secondary': '#555555',
        '--color-text-muted': '#888888',
        '--color-border': '#dddddd',
        '--color-border-light': '#e5e5e5',
        '--color-primary': '#646cff',
        '--color-primary-hover': '#535bf2',
        '--color-focus': '#646cff'
      };

      Object.entries(lightVars).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });

      body.style.backgroundColor = '#f9f9f9';
      body.style.color = '#213547';
    } else {
      console.log('Removed light-theme class from body');

      // Aplicar variables del modo oscuro directamente
      const darkVars = {
        '--color-background': '#1a1a1a',
        '--color-surface': '#242424',
        '--color-surface-secondary': '#2a2a2a',
        '--color-surface-accent': '#333333',
        '--color-text-primary': 'rgba(255, 255, 255, 0.87)',
        '--color-text-secondary': 'rgba(255, 255, 255, 0.6)',
        '--color-text-muted': 'rgba(255, 255, 255, 0.4)',
        '--color-border': '#444444',
        '--color-border-light': '#555555',
        '--color-primary': '#646cff',
        '--color-primary-hover': '#747bff',
        '--color-focus': '#646cff'
      };

      Object.entries(darkVars).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });

      body.style.backgroundColor = '#1a1a1a';
      body.style.color = 'rgba(255, 255, 255, 0.87)';
    }

    localStorage.setItem('theme', theme);

    // Forzar re-renderizado de componentes
    setTimeout(() => {
      const event = new CustomEvent('themeChange', { detail: { theme } });
      window.dispatchEvent(event);
    }, 100);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
