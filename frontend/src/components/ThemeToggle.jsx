import React, { useState, useEffect } from 'react';
import { LuSun, LuMoon } from "react-icons/lu"; // Esempio con Lucide Icons
import styles from './ThemeToggle.module.css';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button className={styles.button} onClick={toggleTheme} aria-label="Toggle Theme">
      {/* Visualizziamo l'icona del sole se siamo in dark, e della luna se siamo in light */}
      {theme === 'light' ? (
        <LuMoon className={styles.icon} />
      ) : (
        <LuSun className={styles.icon} />
      )}
      <span className={styles.label}>
        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;