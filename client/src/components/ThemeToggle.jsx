import React from 'react';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext.jsx';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? (
        <FaSun className="text-yellow-400" size={20} />
      ) : (
        <FaMoon className="text-gray-600" size={20} />
      )}
    </button>
  );
};

export default ThemeToggle;
