import { useTheme } from '../context/ThemeContext';

// Hook personalizado para obtener estilos dinámicos basados en el tema
export const useThemedStyles = () => {
  const { theme } = useTheme();

  // Función para obtener valores CSS variables
  const getCSSVariable = (variable) => {
    return getComputedStyle(document.documentElement).getPropertyValue(variable);
  };

  // Estilos comunes para formularios
  const formStyles = {
    container: {
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--border-radius-md)',
      padding: 'var(--spacing-lg)',
      margin: 'var(--spacing-md)',
      boxShadow: '0 2px 4px var(--color-shadow)',
      border: '1px solid var(--color-border)',
    },
    input: {
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--border-radius-sm)',
      padding: 'var(--spacing-sm) var(--spacing-md)',
      color: 'var(--color-text-primary)',
      fontSize: '14px',
      width: '100%',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    inputFocus: {
      borderColor: 'var(--color-focus)',
      boxShadow: '0 0 0 2px rgba(100, 108, 255, 0.2)',
      outline: 'none',
    },
    inputError: {
      borderColor: 'var(--color-danger)',
    },
    label: {
      display: 'block',
      marginBottom: 'var(--spacing-xs)',
      fontWeight: '500',
      color: 'var(--color-text-primary)',
    },
    button: {
      backgroundColor: 'var(--color-primary)',
      color: 'white',
      border: 'none',
      borderRadius: 'var(--border-radius-sm)',
      padding: 'var(--spacing-sm) var(--spacing-md)',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    buttonSecondary: {
      backgroundColor: 'var(--color-surface-secondary)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--border-radius-sm)',
      padding: 'var(--spacing-sm) var(--spacing-md)',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    errorText: {
      color: 'var(--color-danger)',
      fontSize: '12px',
      marginTop: 'var(--spacing-xs)',
    },
    successText: {
      color: 'var(--color-success)',
      fontSize: '12px',
      marginTop: 'var(--spacing-xs)',
    },
  };

  // Estilos para tablas
  const tableStyles = {
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--border-radius-md)',
      overflow: 'hidden',
      boxShadow: '0 2px 4px var(--color-shadow)',
    },
    th: {
      backgroundColor: 'var(--color-surface-accent)',
      color: 'var(--color-text-primary)',
      padding: 'var(--spacing-md)',
      textAlign: 'left',
      fontWeight: '600',
      borderBottom: '1px solid var(--color-border)',
    },
    td: {
      padding: 'var(--spacing-md)',
      borderBottom: '1px solid var(--color-border-light)',
      color: 'var(--color-text-primary)',
    },
  };

  // Estilos para modales
  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    content: {
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--border-radius-md)',
      padding: 'var(--spacing-lg)',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80vh',
      overflow: 'auto',
      boxShadow: '0 8px 32px var(--color-shadow)',
      border: '1px solid var(--color-border)',
    },
  };

  return {
    theme,
    formStyles,
    tableStyles,
    modalStyles,
    getCSSVariable,
  };
};

// Hook para generar clases CSS dinámicas
export const useThemeClasses = () => {
  const { theme } = useTheme();

  const getClasses = (baseClasses, themeClasses = {}) => {
    const classes = [baseClasses];

    if (themeClasses[theme]) {
      classes.push(themeClasses[theme]);
    }

    return classes.filter(Boolean).join(' ');
  };

  return { getClasses, theme };
};
