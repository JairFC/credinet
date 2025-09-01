import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  // Aplicar tema inmediatamente al montar el componente
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (currentTheme) => {
    const root = document.documentElement;
    const body = document.body;

    // Limpiar clases existentes
    body.classList.remove('light-theme');

    if (currentTheme === 'light') {
      // Modo claro
      body.classList.add('light-theme');
      root.style.setProperty('--color-background', '#f9f9f9');
      root.style.setProperty('--color-surface', '#ffffff');
      root.style.setProperty('--color-surface-secondary', '#f8f9fa');
      root.style.setProperty('--color-surface-accent', '#f2f2f2');
      root.style.setProperty('--color-text-primary', '#213547');
      root.style.setProperty('--color-text-secondary', '#555');
      root.style.setProperty('--color-border', '#ddd');
      body.style.backgroundColor = '#f9f9f9';
      body.style.color = '#213547';
    } else {
      // Modo oscuro
      root.style.setProperty('--color-background', '#1a1a1a');
      root.style.setProperty('--color-surface', '#242424');
      root.style.setProperty('--color-surface-secondary', '#2a2a2a');
      root.style.setProperty('--color-surface-accent', '#333333');
      root.style.setProperty('--color-text-primary', 'rgba(255, 255, 255, 0.87)');
      root.style.setProperty('--color-text-secondary', 'rgba(255, 255, 255, 0.6)');
      root.style.setProperty('--color-border', '#444');
      body.style.backgroundColor = '#1a1a1a';
      body.style.color = 'rgba(255, 255, 255, 0.87)';
    }
  };

  const handleToggle = () => {
    toggleTheme();
    // El useEffect se encargará de aplicar el tema
  };

  const style = {
    background: 'none',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
  };

  return (
    <button onClick={handleToggle} style={style} title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeSwitcher;