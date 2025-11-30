import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { walletConnectedAtom, savedMnemonicAtom, mnemonicSetterAtom, mnemonicCollapsedAtom, selectedFarmAtom, notificationAtom } from '../atoms';
import { validateMnemonic as validateMnemonicBip39, generateMnemonic as generateMnemonicBip39 } from '../services/ecashWallet';
import { useEcashWallet } from '../hooks/useEcashWallet';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/ecashwallet.css';

const ECashWallet = ({ onWalletConnected }) => {
  const { t } = useTranslation();
  const [walletConnected] = useAtom(walletConnectedAtom);
  const [savedMnemonic] = useAtom(savedMnemonicAtom);
  const [, setSavedMnemonic] = useAtom(mnemonicSetterAtom);
  const [mnemonicCollapsed, setMnemonicCollapsed] = useAtom(mnemonicCollapsedAtom);
  const [, setNotification] = useAtom(notificationAtom);

  const { importWallet, resetWallet, generateNewWallet } = useEcashWallet();
  const [, setSelectedFarm] = useAtom(selectedFarmAtom);

  const [errorMessage, setErrorMessage] = useState('');
  const [editableMnemonic, setEditableMnemonic] = useState('');
  const [showImport, setShowImport] = useState(false);

  const generateNewMnemonicHandler = () => {
    try {
      const newMnemonic = generateMnemonicBip39();
      setEditableMnemonic(newMnemonic);
      setSuccessMessage('');
      setErrorMessage('');
    } catch (error) {
      console.error('Failed to generate mnemonic:', error);
      setSuccessMessage('');
      setErrorMessage('Failed to generate mnemonic. Please try again.');
    }
  };

  const handleConnectFromSaved = async () => {
    try {
      const mnemonicToUse = editableMnemonic || savedMnemonic;
      if (!mnemonicToUse.trim()) {
        setErrorMessage('No mnemonic available to connect.');
        return;
      }

      if (!validateMnemonicBip39(mnemonicToUse.trim())) {
        setErrorMessage('Invalid mnemonic. Please check your input.');
        return;
      }

      setErrorMessage('');
      
      console.log('🔄 Attempting to import wallet...');
      await importWallet(mnemonicToUse);
      
      console.log('✅ Wallet connection successful');
      setEditableMnemonic('');
      setNotification({
        type: 'success',
        message: t('wallet.connectedSuccess') || 'Wallet connected successfully!'
      });
      if (onWalletConnected) {
        onWalletConnected();
      }
    } catch (error) {
      console.error('❌ Failed to connect from saved mnemonic:', error);
      console.error('Error details:', error.stack);
      setErrorMessage(`Connection failed: ${error.message}`);
    }
  };

  const handleSaveMnemonic = () => {
    if (!editableMnemonic.trim()) {
      setErrorMessage('Mnemonic cannot be empty.');
      return;
    }

    if (!validateMnemonicBip39(editableMnemonic.trim())) {
      setErrorMessage('Invalid mnemonic. Please check your input.');
      return;
    }

    // Copy to clipboard
    navigator.clipboard.writeText(editableMnemonic.trim()).then(() => {
      console.log('Mnemonic copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });

    setSavedMnemonic(editableMnemonic.trim());
    setErrorMessage('');
    setNotification({
      type: 'success',
      message: t('wallet.mnemonicCopied') || 'Copied! Mnemonic saved to local storage.'
    });
  };

  const handleResetMnemonic = () => {
    if (window.confirm(t('wallet.resetConfirm'))) {
      resetWallet();
      setEditableMnemonic('');
      setErrorMessage('');
      setMnemonicCollapsed(false);
    }
  };

  const toggleMnemonicCollapsed = () => {
    setMnemonicCollapsed(!mnemonicCollapsed);
  };

  const handleBackToDirectory = () => {
    setSelectedFarm(null);
    setEditableMnemonic('');
    setErrorMessage('');
  };

  const handleShowImport = () => {
    setShowImport(true);
    setEditableMnemonic('');
    setMnemonicCollapsed(false);
  };

  // Initialize editable mnemonic from saved mnemonic when component mounts
  useEffect(() => {
    if (savedMnemonic && !editableMnemonic) {
      setEditableMnemonic(savedMnemonic);
    }
    // Always expand mnemonic section when mnemonic is empty (first access)
    if (!editableMnemonic && !savedMnemonic) {
      setMnemonicCollapsed(false);
    }
  }, [savedMnemonic, editableMnemonic, setMnemonicCollapsed]);

  if (walletConnected) {
    return null; // Wallet is connected, let MobileLayout handle the UI
  }

  return (
    <div className="ecash-wallet">

      <div className="mnemonic-section">
        <div
          className="mnemonic-header"
          onClick={toggleMnemonicCollapsed}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleMnemonicCollapsed();
            }
          }}
          tabIndex={0}
          role="button"
          aria-expanded={!mnemonicCollapsed}
          aria-controls="mnemonic-textarea"
        >
          <span className={`triangle ${mnemonicCollapsed ? 'collapsed' : 'expanded'}`}>
            ▼
          </span>
          <span className="mnemonic-title">
            {t('wallet.recoveryPhrase') || 'Recovery Phrase (Password)'}{' '}
            <span className="mnemonic-subtitle">({t('wallet.wordsCount', { count: 12 }) || '12 words'})</span>
          </span>
        </div>

        {!mnemonicCollapsed && (
          <>
            {/* Security Warning */}
            {editableMnemonic && (
              <div className="mnemonic-warning">
                <span className="warning-icon">⚠️</span>
                <strong>{t('wallet.mnemonicWarning') || 'Write these 12 words on paper. This is your only way to recover your funds.'}</strong>
              </div>
            )}
            
            <textarea
              id="mnemonic-textarea"
              value={editableMnemonic}
              onChange={(e) => setEditableMnemonic(e.target.value)}
              placeholder={t('wallet.mnemonicPlaceholder') || 'Your recovery phrase will appear here...'}
              rows="3"
              className="mnemonic-input"
            />
          </>
        )}

        <div className="mnemonic-buttons">
          {!editableMnemonic.trim() && !showImport ? (
            <>
              <button onClick={generateNewMnemonicHandler} className="generate-btn">
                {t('common.generate')}
              </button>
              <button onClick={handleShowImport} className="import-btn">
                {t('wallet.import') || 'Import Wallet'}
              </button>
            </>
          ) : !editableMnemonic.trim() && showImport ? (
            <>
              <button onClick={() => setShowImport(false)} className="back-btn">
                ← {t('common.cancel') || 'Cancel'}
              </button>
            </>
          ) : (
            <>
              <button onClick={handleConnectFromSaved}>
                {t('common.connect')}
              </button>
              <button onClick={handleSaveMnemonic}>
                {t('common.save')}
              </button>
              <button onClick={handleResetMnemonic}>
                {t('common.reset')}
              </button>
            </>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="connection-error">
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ECashWallet;
