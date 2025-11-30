import { useNavigate } from 'react-router-dom';
import ECashWallet from '../ECashWallet';
import ThemeToggle from '../ThemeToggle';
import LanguageToggle from '../LanguageToggle';
import BlockchainStatus from '../BlockchainStatus';
import { useTranslation } from '../../hooks/useTranslation';
import { useAtom } from 'jotai';
import { walletConnectedAtom, selectedFarmAtom } from '../../atoms';
import '../../styles/disconnected.css';

const DisconnectedView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [walletConnected] = useAtom(walletConnectedAtom);
  const [, setSelectedFarm] = useAtom(selectedFarmAtom);

  const handleBackToDirectory = () => {
    setSelectedFarm(null);
    navigate('/');
  };

  return (
    <div className="disconnected-view">
      <div className="app-header">
        <div className="header-controls">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <div className="wallet-setup">
        {!walletConnected && (
          <div className="wallet-connect-prompt">
            <h2 className="wallet-title-centered">{t('wallet.title') || 'Token Wallet'}</h2>
            <ECashWallet />
            <p className="wallet-hint-text">{t('wallet.loadingHint') || 'This may take a few moments during first connection...'}</p>
            <div className="wallet-help-link">
              <button 
                onClick={() => navigate('/faq')}
                className="faq-help-button"
              >
                ❓ {t('common.help') || 'Besoin d\'aide ?'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Back button outside the card */}
      <div className="disconnected-back-button">
        <button onClick={handleBackToDirectory} className="back-to-directory-btn">
          ← {t('directory.backToDirectory') || 'Back to Directory'}
        </button>
      </div>

      {/* Blockchain status as footer */}
      <div className="disconnected-footer">
        <BlockchainStatus />
      </div>
    </div>
  );
};

export default DisconnectedView;
