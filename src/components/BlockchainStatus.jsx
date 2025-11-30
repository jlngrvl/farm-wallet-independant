/**
 * Blockchain Connection Status Component
 * Shows the status of the eCash blockchain connection
 */

import { useState, useEffect } from 'react';
import { ChronikClient, ConnectionStrategy } from 'chronik-client';
import { useTranslation } from '../hooks/useTranslation';
import '../styles/blockchain-status.css';

const BlockchainStatus = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState({
    connected: false,
    blockHeight: 0,
    checking: true,
    error: null
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const chronik = await ChronikClient.useStrategy(
          ConnectionStrategy.ClosestFirst,
          [
            'https://chronik.be.cash/xec',
            'https://chronik.pay2stay.com/xec',
            'https://chronik.fabien.cash'
          ]
        );
        const blockchainInfo = await chronik.blockchainInfo();
        
        setStatus({
          connected: true,
          blockHeight: blockchainInfo.tipHeight,
          checking: false,
          error: null
        });
      } catch (error) {
        setStatus({
          connected: false,
          blockHeight: 0,
          checking: false,
          error: error.message
        });
      }
    };

    checkConnection();
    
    // Refresh every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

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
