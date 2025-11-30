import { useAtom } from 'jotai';
import { themeAtom, themeSetterAtom } from '../atoms';
import PropTypes from 'prop-types';

const ThemeToggle = ({ compact = false, className = '' }) => {
  const [theme] = useAtom(themeAtom);
  const [, setTheme] = useAtom(themeSetterAtom);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center justify-center
        w-10 h-10 rounded-full
        border-2 border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-800
        text-gray-600 dark:text-gray-300
        hover:bg-gray-100 dark:hover:bg-gray-700
        hover:border-blue-500 dark:hover:border-blue-400
        hover:text-blue-600 dark:hover:text-blue-400
        hover:shadow-lg hover:shadow-blue-500/30
        hover:scale-110
        active:scale-95
        transition-all duration-300
        ${compact ? 'w-8 h-8' : ''}
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <div className="transition-transform duration-500 hover:rotate-180">
        {isDark ? (
          // Sun icon for switching to light theme
          <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>
        </svg>
      ) : (
        // Moon icon for switching to dark theme
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
        )}
      </div>
    </button>
  );
};

ThemeToggle.propTypes = {
  compact: PropTypes.bool,
  className: PropTypes.string,
};

export default ThemeToggle;
