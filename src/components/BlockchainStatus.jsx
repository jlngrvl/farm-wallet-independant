/**
 * Blockchain Connection Status Component
 * Shows the status of the eCash blockchain connection
 */

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { blockchainStatusAtom } from '../atoms';
import chronikManager from '../services/chronikClient';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/blockchain-status.css';

const BlockchainStatus = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useAtom(blockchainStatusAtom);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await chronikManager.checkConnection();
        setStatus({
          connected: result.connected,
          blockHeight: result.blockHeight,
          checking: false,
          error: result.error,
          lastChecked: Date.now()
        });
      } catch (error) {
        setStatus({
          connected: false,
          blockHeight: 0,
          checking: false,
          error: error.message,
          lastChecked: Date.now()
        });
      }
    };

    checkConnection();
    
    // Refresh every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, [setStatus]);

  if (status.checking) {
    return (
      <div className="blockchain-status checking">
        <div className="status-indicator"></div>
        <span>{t('blockchain.checking') || 'Checking blockchain...'}</span>
      </div>
    );
  }

  if (!status.connected) {
    return (
      <div className="blockchain-status error">
        <div className="status-indicator"></div>
        <span>{t('blockchain.disconnected') || 'Blockchain disconnected'}</span>
      </div>
    );
  }

  return (
    <div className="blockchain-status connected">
      <div className="status-indicator"></div>
      <span>
        {t('blockchain.connected') || 'Connected'} • Block {status.blockHeight.toLocaleString()}
      </span>
    </div>
  );
};

export default BlockchainStatus;
