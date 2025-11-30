import { useTranslation } from '../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import '../styles/language-toggle.css';

const LanguageToggle = () => {
  const { locale } = useTranslation();
  const navigate = useNavigate();

  // Émojis drapeaux pour chaque langue
  const flags = {
    en: '🇬🇧',
    fr: '🇫🇷'
  };

  const handleClick = () => {
    // Rediriger vers la page des paramètres
    navigate('/settings');
  };

  return (
    <button
      onClick={handleClick}
      className="language-flag-button"
      type="button"
      title={`Langue actuelle: ${locale.toUpperCase()}`}
    >
      {flags[locale] || '🌐'}
    </button>
  );
};

export default LanguageToggle;
