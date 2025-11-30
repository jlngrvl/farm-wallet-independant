import { useState, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { walletAtom, notificationAtom, savedMnemonicAtom } from '../atoms';
import { hexToWIF } from '../utils/wifUtils';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/walletdetails.css';

const WalletDetails = () => {
  const { t } = useTranslation();
  const [wallet] = useAtom(walletAtom);
  const [savedMnemonic] = useAtom(savedMnemonicAtom);
  const setNotification = useSetAtom(notificationAtom);
  const [wifPrivateKey, setWifPrivateKey] = useState('Converting...');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  // Convert hex to WIF asynchronously using robust conversion
  useEffect(() => {
    const convertHexToWIF = async () => {
      if (!wallet) {
        setWifPrivateKey('N/A');
        return;
      }

      try {
        // Get hex private key directly from wallet service
        const hexPrivateKey = wallet.getPrivateKeyHex ? wallet.getPrivateKeyHex() : null;
        
        if (!hexPrivateKey) {
          setWifPrivateKey('N/A');
          return;
        }

        // If already in WIF format (starts with K, L, 5, c, or 9)
        if (/^[KL5c9]/.test(hexPrivateKey)) {
          setWifPrivateKey(hexPrivateKey);
          return;
        }

        // Convert hex to WIF using utility
        if (hexPrivateKey.length === 64 && /^[a-fA-F0-9]+$/.test(hexPrivateKey)) {
          const wif = hexToWIF(hexPrivateKey, true, false); // compressed, mainnet
          setWifPrivateKey(wif || hexPrivateKey);
        } else {
          setWifPrivateKey(hexPrivateKey);
        }
      } catch (error) {
        console.error('🔧 Failed to convert hex to WIF:', error);
        setWifPrivateKey('Error');
      }
    };

    convertHexToWIF();
  }, [wallet]);

  const getWIFFromHex = () => {
    return wifPrivateKey;
  };

  const handleCopyClick = (text, label) => {
    // Prevent event bubbling that might interfere with wallet state
    if (!text || text === 'N/A') return;

    try {
      // Use the older document.execCommand as fallback to avoid async issues
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          setNotification({ type: 'success', message: `${label} copied!` });
        }).catch(() => {
          fallbackCopy(text, label);
        });
      } else {
        fallbackCopy(text, label);
      }
    } catch (error) {
      console.error('Copy failed:', error);
      setNotification({ type: 'error', message: 'Copy failed' });
    }
  };

  const fallbackCopy = (text, label) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setNotification({ type: 'success', message: `${label} copied!` });
    } catch (error) {
      console.error('Fallback copy failed:', error);
      setNotification({ type: 'error', message: 'Copy failed' });
    }
  };

  // Wallet data - only essential fields
  const mnemonic = savedMnemonic || wallet?.walletInfo?.mnemonic || 'N/A';
  
  // Safely get address (protect against Address object)
  const getRawAddress = () => {
    const addr = wallet?.walletInfo?.xecAddress || wallet?.walletInfo?.address || wallet?.getAddress();
    return typeof addr === 'string' ? addr : addr?.toString() || 'N/A';
  };
  
  const walletData = {
    mnemonic,
    xecAddress: getRawAddress(),
    privateKeyWIF: getWIFFromHex(),
    hdPath: wallet?.walletInfo?.hdPath || "m/44'/1899'/0'/0/0"
  };

  return (
    <div className="walletdetails-info">
      {/* Security Warning */}
      <div className="security-warning">
        <span className="warning-icon">⚠️</span>
        <span>
          {t('wallet.securityWarning') || 'Ne partagez jamais votre phrase de récupération. Écrivez-la sur papier et gardez-la en lieu sûr.'}
        </span>
      </div>

      {/* Mnemonic */}
      <div className="wallet-detail-item">
        <span className="wallet-detail-label">Mnemonic (12 words):</span>
        <div className="wallet-detail-value-group">
          <span className={`wallet-detail-value ${!showMnemonic ? 'blurred' : ''}`}>
            {walletData.mnemonic}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMnemonic(!showMnemonic);
            }}
            className="wallet-action-button small"
            title={showMnemonic ? 'Hide mnemonic' : 'Show mnemonic'}
            disabled={walletData.mnemonic === 'N/A'}
          >
            {showMnemonic ? '🙈' : '👁️'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCopyClick(walletData.mnemonic, 'Mnemonic');
            }}
            className="wallet-action-button small"
            title="Copy to clipboard"
            disabled={walletData.mnemonic === 'N/A'}
          >
            📋
          </button>
        </div>
      </div>

      {/* Private Key (WIF) */}
      <div className="wallet-detail-item">
        <span className="wallet-detail-label">Private Key (WIF):</span>
        <div className="wallet-detail-value-group">
          <span className={`wallet-detail-value ${!showPrivateKey ? 'blurred' : ''}`}>
            {walletData.privateKeyWIF}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPrivateKey(!showPrivateKey);
            }}
            className="wallet-action-button small"
            title={showPrivateKey ? 'Hide private key' : 'Show private key'}
            disabled={walletData.privateKeyWIF === 'N/A'}
          >
            {showPrivateKey ? '🙈' : '👁️'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCopyClick(walletData.privateKeyWIF, 'Private Key');
            }}
            className="wallet-action-button small"
            title="Copy to clipboard"
            disabled={walletData.privateKeyWIF === 'N/A'}
          >
            📋
          </button>
        </div>
      </div>

      <div className="wallet-detail-item">
        <span className="wallet-detail-label">HD Path:</span>
        <div className="wallet-detail-value-group">
          <span className="wallet-detail-value">{walletData.hdPath}</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCopyClick(walletData.hdPath, 'HD Path');
            }}
            className="wallet-action-button small"
            title="Copy to clipboard"
            disabled={walletData.hdPath === 'N/A'}
          >
            📋
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletDetails;
