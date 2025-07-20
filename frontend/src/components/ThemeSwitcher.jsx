import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

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
    <button onClick={toggleTheme} style={style} title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeSwitcher;
