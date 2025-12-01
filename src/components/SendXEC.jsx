import { useState, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  notificationAtom,
  busyAtom,
  walletAtom,
  walletConnectedAtom,
  balanceRefreshTriggerAtom,
  currencyAtom
} from '../atoms';
import QrCodeScanner from './QrCodeScanner';
import { useTranslation } from '../hooks/useTranslation';
import useBalance from '../hooks/useBalance';
import { useXecPrice } from '../hooks/useXecPrice';
import { sanitizeInput, isValidXECAddress, isValidAmount } from '../utils/validation';
import '../styles/sendxec.css';

const SendXEC = () => {
  const { t } = useTranslation();
  const [wallet] = useAtom(walletAtom);
  const [walletConnected] = useAtom(walletConnectedAtom);
  const setNotification = useSetAtom(notificationAtom);
  const [busy, setBusy] = useAtom(busyAtom);
  const setBalanceRefreshTrigger = useSetAtom(balanceRefreshTriggerAtom);
  const { balanceBreakdown } = useBalance();
  const [currency] = useAtom(currencyAtom);
  const price = useXecPrice();

  const [sendForm, setSendForm] = useState({
    address: '',
    amount: ''
  });
  const [showScanner, setShowScanner] = useState(false);
  const [lastTransactionTime, setLastTransactionTime] = useState(0);
  const [countdown, setCountdown] = useState(0);

  // Update countdown timer for transaction cooldown
  useEffect(() => {
    if (lastTransactionTime === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastTx = now - lastTransactionTime;
      const minInterval = 5000; // 5 seconds
      const remaining = Math.max(0, Math.ceil((minInterval - timeSinceLastTx) / 1000));

      setCountdown(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastTransactionTime]);

  const handleInputChange = (field, value) => {
    setSendForm(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleAddressDetected = (scannedData) => {
    if (!walletConnected) {
      setNotification({ type: 'error', message: t('token.walletNotConnected') });
      return;
    }

    try {
      if (Array.isArray(scannedData) && scannedData.length > 0) {
        const rawAddress = scannedData[0].rawValue;
        const sanitizedAddress = sanitizeInput(rawAddress, 'address');

        if (!isValidXECAddress(sanitizedAddress)) {
          setNotification({ type: 'error', message: t('xec.validation.invalidAddress') });
          return;
        }

        handleInputChange('address', sanitizedAddress);
        setNotification({ type: 'success', message: t('token.addressScanned') });
      } else {
        setNotification({ type: 'error', message: t('token.qrScanFailed') });
      }
    } catch (error) {
      setNotification({ type: 'error', message: error.message });
    }
    setShowScanner(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!walletConnected) {
      setNotification({ type: 'error', message: t('token.walletNotConnected') });
      return;
    }

    // Prevent rapid consecutive transactions (minimum 5 seconds between sends)
    if (countdown > 0) {
      setNotification({
        type: 'error',
        message: t('xec.transactionCooldown', { countdown })
      });
      return;
    }

    try {
      // Validate and sanitize inputs
      const sanitizedRecipient = sanitizeInput(sendForm.address, 'address');
      const sanitizedAmount = sanitizeInput(sendForm.amount, 'amount');

      if (!sanitizedRecipient) {
        setNotification({ type: 'error', message: t('xec.validation.addressRequired') });
        return;
      }

      if (!isValidXECAddress(sanitizedRecipient)) {
        setNotification({ type: 'error', message: t('xec.validation.invalidAddress') });
        return;
      }

      if (!sanitizedAmount) {
        setNotification({ type: 'error', message: t('xec.validation.amountRequired') });
        return;
      }

      if (!isValidAmount(sanitizedAmount, 'xec')) {
        setNotification({ type: 'error', message: t('xec.validation.invalidAmount') });
        return;
      }

      const amount = parseFloat(sanitizedAmount);
      if (amount <= 0) {
        setNotification({ type: 'error', message: t('xec.validation.amountPositive') });
        return;
      }

      // Check minimum amount (dust limit)
      if (amount < 5.46) {
        setNotification({ 
          type: 'error', 
          message: t('xec.validation.minimumAmount') || 'Le montant minimum pour une transaction est de 5.46 XEC.'
        });
        return;
      }

      // Check if we have enough balance (use SPENDABLE balance, not total)
      const spendableXEC = balanceBreakdown?.spendableBalance || 0;
      if (amount > spendableXEC) {
        setNotification({
          type: 'error',
          message: t('xec.validation.insufficientBalance', {
            balance: spendableXEC.toFixed(2),
            amount: amount.toFixed(2)
          })
        });
        return;
      }

      // WARNING: Check if change will be lost due to dust limit
      // Fee estimate: 2.5 XEC, Dust limit: 5.46 XEC
      const feeEstimate = 2.5;
      const dustLimit = 5.46;
      const estimatedChange = spendableXEC - amount - feeEstimate;
      
      // Si le change sera perdu (entre 0 et dust limit)
      if (estimatedChange > 0 && estimatedChange < dustLimit) {
        const lostAmount = estimatedChange.toFixed(2);
        const sendAllOption = (amount + estimatedChange).toFixed(2);
        const safeOption = Math.max(0, spendableXEC - dustLimit - feeEstimate).toFixed(2);
        
        setNotification({
          type: 'warning',
          message: `⚠️ ${lostAmount} XEC seront perdus en frais (change < ${dustLimit} XEC minimum). Envoyez plutôt ${sendAllOption} XEC (tout) ou ${safeOption} XEC (garde ${dustLimit} XEC).`
        });
        return;
      }
      
      // Si le change sera négatif (pas assez de fonds pour les frais)
      if (estimatedChange < 0) {
        const needed = Math.abs(estimatedChange).toFixed(2);
        setNotification({
          type: 'error',
          message: `Solde insuffisant. Il manque ${needed} XEC pour couvrir les frais (${feeEstimate} XEC).`
        });
        return;
      }

      setBusy(true);

      try {
        // 1. Convert to number first
        const numericAmount = parseFloat(amount);
        
        // 2. Format as String with exactly 2 decimals (e.g., "13.64")
        // This avoids floating point precision issues like 13.639999999
        const cleanAmount = numericAmount.toFixed(2);
        
        console.log(`Envoi sécurisé : ${cleanAmount} XEC (type: ${typeof cleanAmount})`);
        console.log(`Sending to:`, sanitizedRecipient);

        // Pre-send validation
        if (!cleanAmount || isNaN(cleanAmount) || parseFloat(cleanAmount) <= 0) {
          throw new Error(`Invalid amount: ${cleanAmount} XEC`);
        }

        console.log('Broadcasting transaction...');

        // Service sendXec expects (toAddress, amountXec)
        // Send cleanAmount as String with exactly 2 decimals
        const result = await wallet.sendXec(sanitizedRecipient, cleanAmount);
        const txid = result.txid;

        console.log('Send successful, txid:', txid);

        // Record successful transaction time
        setLastTransactionTime(Date.now());

        // Trigger balance refresh after successful transaction
        // Add delay to allow Chronik to propagate the transaction
        setTimeout(() => {
          setBalanceRefreshTrigger(Date.now());
        }, 2000); // 2 seconds delay for Chronik propagation

        // Reset form and show success
        setSendForm({
          address: '',
          amount: ''
        });

        setNotification({
          type: 'success',
          message: t('xec.sendSuccess', {
            amount: cleanAmount,
            address: sanitizedRecipient.substring(0, 15),
            txid: txid.substring(0, 8)
          })
        });
      } catch (error) {
        console.error('=== SEND XEC FAILED ===');
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        // If error is related to missing inputs, trigger balance refresh
        if (error.message?.toLowerCase().includes('missing inputs') ||
            error.message?.toLowerCase().includes('inputs-missingorspent')) {
          console.log('Triggering balance refresh due to UTXO-related error');
          setBalanceRefreshTrigger(Date.now());
        }

        // Enhanced error handling with specific debugging
        let errorMessage = error.message || t('errors.generic');

        if (error.message?.includes('Invalid amount') || error.message?.includes('undefined')) {
          errorMessage = 'Transaction failed: Invalid amount format. Please check the amount and try again.';
        } else if (error.message?.includes('browser') || error.message?.includes('compatibility')) {
          errorMessage = t('errors.browserCompatibility');
        } else if (error.message?.includes('signing') || error.message?.includes('transaction signing')) {
          errorMessage = t('errors.signingFailed');
        } else if (error.message?.includes('mempool') || error.message?.includes('conflict')) {
          errorMessage = t('errors.mempoolConflict');
        } else if (error.message?.includes('insufficient') || error.message?.includes('balance')) {
          errorMessage = 'Insufficient balance for transaction including fees.';
        }

        setNotification({
          type: 'error',
          message: `Send XEC failed: ${errorMessage}`
        });
      }
    } catch (error) {
      console.error('XEC send validation error:', error);
      setNotification({ type: 'error', message: error.message });
    } finally {
      setBusy(false);
    }
  };

  const setMaxAmount = () => {
    if (balanceBreakdown) {
      // Utiliser le solde SPENDABLE (XEC purs) pas le total
      const spendableXEC = balanceBreakdown.spendableBalance || 0;
      
      // Si le solde est 0 ou proche de 0, ne rien mettre
      if (spendableXEC < 0.01) {
        handleInputChange('amount', '0');
        return;
      }
      
      // Calcul optimisé : Frais réels (3 XEC) + marge de sécurité (0.1 XEC)
      const maxAmount = Math.max(0, spendableXEC - 3.1);
      
      handleInputChange('amount', maxAmount.toFixed(2));
    }
  };


  return (
    <div className="sendxec-container">
      <form onSubmit={handleSend}>
        {/* Address Input with QR Scanner */}
        <div className="send-group">
          <div className="form-input-group">
            <input
              type="text"
              value={sendForm.address}
              onChange={(e) => handleInputChange('address', sanitizeInput(e.target.value, 'address'))}
              placeholder={t('xec.recipientPlaceholder')}
              disabled={busy}
              className="form-input"
            />
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="scan-button"
              disabled={busy}
              title={t('common.qrScan')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 12px'
              }}
            >
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
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
          </div>
          {sendForm.address && sendForm.address.length > 10 && !isValidXECAddress(sendForm.address) && (
            <div className="error-text">
              {t('xec.validation.invalidAddress')}
            </div>
          )}

          {/* QR Scanner Modal */}
          {showScanner && (
            <div className="qr-scanner-modal">
              <button
                type="button"
                disabled={busy}
                className="close-scanner-button"
                onClick={() => setShowScanner(false)}
              >
                {t('common.close')} {t('common.qrScan')}
              </button>
              <QrCodeScanner onAddressDetected={handleAddressDetected} />
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div className="send-group">
          <label htmlFor="xec-amount" className="form-label">
            {t('xec.amount')}
          </label>
          <div className="form-input-group">
            <input
              id="xec-amount"
              type="number"
              value={sendForm.amount}
              onChange={(e) => handleInputChange('amount', sanitizeInput(e.target.value, 'amount'))}
              placeholder={t('xec.amountPlaceholder')}
              step="0.01"
              min="0"
              disabled={busy}
              className="form-input"
            />
            <button
              type="button"
              onClick={setMaxAmount}
              className="max-button"
              disabled={busy}
            >
              {t('common.max')}
            </button>
          </div>
          {sendForm.amount && !isValidAmount(sendForm.amount, 'xec') && (
            <div className="error-text">
              {t('xec.validation.invalidAmount')}
            </div>
          )}
          {/* Bloc regroupé des infos */}
          {balanceBreakdown && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: 'var(--bg-secondary, #f5f5f5)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary, #666)',
              lineHeight: '1.6'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                📊 Disponible: {balanceBreakdown.spendableBalance?.toFixed(2) || 0} XEC
                {price && typeof price.convert === 'function' && (() => {
                  const converted = price.convert(balanceBreakdown.spendableBalance || 0, currency);
                  return converted !== null ? ` (≈ ${converted.toFixed(2)} ${currency})` : '';
                })()}
              </div>
              <div>⚠️ Min. envoi : 5.46 XEC</div>
              <div>🔒 Réserve frais : ~3 XEC</div>
            </div>
          )}
        </div>

        {/* Send Button */}
        <div className="send-actions">
          <button
            type="submit"
            className="send-button"
            disabled={busy || !sendForm.address || !sendForm.amount || !walletConnected || countdown > 0}
          >
            {busy ? t('xec.sending') : countdown > 0 ? t('xec.waitCountdown', { countdown }) : `✔️ ${t('common.confirmSend') || 'Confirmer l’envoi'}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendXEC;
