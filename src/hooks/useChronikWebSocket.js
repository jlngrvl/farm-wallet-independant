/**
 * React Hook for Chronik WebSocket
 * Provides real-time updates for wallet transactions
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { 
  walletAtom, 
  walletConnectedAtom,
  balanceRefreshTriggerAtom,
  notificationAtom 
} from '../atoms';

/**
 * Hook to manage Chronik WebSocket connection
 * Subscribes to wallet address and triggers balance refresh on new transactions
 */
export const useChronikWebSocket = () => {
  const [wallet] = useAtom(walletAtom);
  const [walletConnected] = useAtom(walletConnectedAtom);
  const setBalanceRefreshTrigger = useSetAtom(balanceRefreshTriggerAtom);
  const setNotification = useSetAtom(notificationAtom);
  
  const wsRef = useRef(null);
  const subscribedAddressRef = useRef(null);

  /**
   * Handle incoming WebSocket messages
   */
  const handleMessage = useCallback((msg) => {
    console.log('📨 Chronik WebSocket message:', msg);

    // Handle different message types
    if (msg.type === 'Tx' || msg.type === 'AddedToMempool' || msg.type === 'Confirmed') {
      console.log('💰 Transaction detected! Refreshing balance...');
      
      // Show notification immediately
      setNotification({
        type: 'info',
        message: '💰 Nouvelle transaction détectée'
      });
      
      // Delay to ensure transaction is fully propagated in Chronik
      // Mempool transactions need time to be indexed
      setTimeout(() => {
        console.log('🔄 Triggering balance refresh (after 1.5s delay)...');
        setBalanceRefreshTrigger(Date.now());
      }, 1500);
      
    } else if (msg.type === 'BlockConnected') {
      console.log('⛓️ New block connected, refreshing balance...');
      setTimeout(() => {
        setBalanceRefreshTrigger(Date.now());
      }, 300);
    }
  }, [setBalanceRefreshTrigger, setNotification]);

  /**
   * Handle WebSocket reconnection
   */
  const handleReconnect = useCallback((e) => {
    console.log('🔄 Chronik WebSocket reconnecting...', e);
  }, []);

  /**
   * Subscribe to wallet address
   */
  const subscribeToWallet = useCallback(async (ws, address) => {
    try {
      // Get script type and hash from wallet
      const scriptType = 'p2pkh';
      const scriptPayload = wallet.pkh ? Array.from(wallet.pkh).map(b => b.toString(16).padStart(2, '0')).join('') : null;
      
      if (!scriptPayload) {
        console.error('❌ Cannot subscribe: wallet pkh not available');
        return;
      }

      console.log(`🔔 Subscribing to ${scriptType} script:`, scriptPayload);
      
      // Subscribe to script (more reliable than address)
      ws.subscribeToScript(scriptType, scriptPayload);
      
      subscribedAddressRef.current = address;
      console.log('✅ Subscribed to wallet address:', address);
    } catch (error) {
      console.error('❌ Failed to subscribe to wallet:', error);
    }
  }, [wallet]);

  /**
   * Unsubscribe from previous address
   */
  const unsubscribeFromPrevious = useCallback(async (ws) => {
    if (subscribedAddressRef.current && wallet?.pkh) {
      try {
        const scriptType = 'p2pkh';
        const scriptPayload = Array.from(wallet.pkh).map(b => b.toString(16).padStart(2, '0')).join('');
        
        console.log(`🔕 Unsubscribing from ${scriptType} script:`, scriptPayload);
        ws.unsubscribeFromScript(scriptType, scriptPayload);
        subscribedAddressRef.current = null;
      } catch (error) {
        console.warn('⚠️ Failed to unsubscribe:', error);
      }
    }
  }, [wallet]);

  /**
   * Initialize WebSocket connection
   */
  useEffect(() => {
    if (!wallet || !walletConnected) {
      // Cleanup if wallet disconnected
      if (wsRef.current) {
        console.log('👋 Closing Chronik WebSocket (wallet disconnected)');
        unsubscribeFromPrevious(wsRef.current);
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    // Initialize WebSocket
    const initWebSocket = async () => {
      try {
        // Wait for wallet to be ready
        await wallet.chronikInitPromise;

        const chronik = wallet.chronik;
        if (!chronik) {
          console.error('❌ Chronik client not available');
          return;
        }

        console.log('🚀 Initializing Chronik WebSocket...');

        // Create WebSocket connection
        const ws = chronik.ws({
          onMessage: handleMessage,
          onReconnect: handleReconnect,
          // Enable keep-alive to maintain connection
          keepAlive: true,
        });

        // Wait for WebSocket to open
        await ws.waitForOpen();
        console.log('✅ Chronik WebSocket connected');

        // Subscribe to blocks for general updates
        ws.subscribeToBlocks();
        console.log('✅ Subscribed to blocks');

        // Subscribe to wallet address
        const address = wallet.getAddress();
        await subscribeToWallet(ws, address);

        // Store WebSocket reference
        wsRef.current = ws;

        console.log('🎉 Chronik WebSocket is now active! Real-time updates enabled.');
        console.log('💡 Send XEC to your address to see instant balance updates!');

      } catch (error) {
        console.error('❌ Failed to initialize Chronik WebSocket:', error);
      }
    };

    initWebSocket();

    // Cleanup on unmount or wallet change
    return () => {
      if (wsRef.current) {
        console.log('🧹 Cleaning up Chronik WebSocket');
        unsubscribeFromPrevious(wsRef.current);
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [wallet, walletConnected, handleMessage, handleReconnect, subscribeToWallet, unsubscribeFromPrevious]);

  return {
    isConnected: !!wsRef.current,
  };
};

export default useChronikWebSocket;
