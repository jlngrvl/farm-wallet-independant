import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { notificationAtom } from '../atoms';

const Notification = () => {
  const [notification, setNotification] = useAtom(notificationAtom);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000); // Auto-hide after 4 seconds

      return () => clearTimeout(timer);
    }
  }, [notification, setNotification]);

  if (!notification) return null;

  const { type, message } = notification;

  // Type-based styling
  const typeStyles = {
    success: 'bg-green-50 dark:bg-green-950/20 border-green-500/30 text-green-800 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-950/20 border-red-500/30 text-red-800 dark:text-red-300',
    warning: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500/30 text-yellow-800 dark:text-yellow-300',
    info: 'bg-blue-50 dark:bg-blue-950/20 border-blue-500/30 text-blue-800 dark:text-blue-300'
  };

  return (
    <div 
      className={`
        fixed top-20 left-4 right-4 z-[1000]
        px-4 py-3 rounded-lg border
        flex items-center justify-between gap-3
        shadow-lg backdrop-blur-sm
        animate-slideDown
        ${typeStyles[type] || typeStyles.info}
      `}
    >
      <p className="flex-1 m-0 text-sm leading-relaxed">
        {type === 'success' && '✅ '}
        {type === 'error' && '❌ '}
        {type === 'warning' && '⚠️ '}
        {message}
      </p>
      <button
        onClick={() => setNotification(null)}
        aria-label="Close notification"
        className="
          flex items-center justify-center
          min-w-6 h-6 p-1
          bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20
          rounded transition-colors
          text-lg leading-none
        "
      >
        ×
      </button>
    </div>
  );
};

export default Notification;
