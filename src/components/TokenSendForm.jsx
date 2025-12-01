/**
 * TokenSendForm - Reusable form component for sending tokens
 * Separated from TokenSend.jsx for better component organization
 * Uses UI components (Card, Button, Stack) - NO Tailwind
 * 
 * @important Does NOT modify wallet logic or transaction calculations
 */

import { Button, Stack } from './UI';
import { sanitizeInput, isValidXECAddress } from '../utils/validation';

const TokenSendForm = ({
  sendForm,
  onInputChange,
  onSubmit,
  onScanClick,
  onMaxClick,
  showScanner,
  onCloseScanner,
  token,
  busy,
  countdown,
  walletConnected,
  t,
  QrCodeScanner,
  onAddressDetected
}) => {
  
  // Validation helpers (UI only, not blockchain)
  const isAddressValid = sendForm.address.length > 10 && isValidXECAddress(sendForm.address);
  const isAmountValid = sendForm.amount && parseFloat(sendForm.amount) > 0;
  const canSubmit = isAddressValid && isAmountValid && !busy && walletConnected && countdown === 0;

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing="lg">
        {/* Recipient Address Field */}
        <div className="form-group">
          <label htmlFor="recipient-address" className="form-label">
            {t('token.recipient')}
          </label>
          <div className="form-input-group">
            <input
              id="recipient-address"
              type="text"
              value={sendForm.address}
              onChange={(e) => onInputChange('address', sanitizeInput(e.target.value, 'address'))}
              placeholder={t('token.recipientPlaceholder')}
              disabled={busy}
              className={`form-input ${sendForm.address && !isAddressValid ? 'input-error' : ''}`}
              autoComplete="off"
            />
            <Button
              type="button"
              onClick={onScanClick}
              className="scan-button"
              disabled={busy}
            >
              📷 {t('common.qrScan')}
            </Button>
          </div>
          
          {/* Validation feedback */}
          {sendForm.address && sendForm.address.length > 10 && (
            <div className={isAddressValid ? 'success-text' : 'error-text'}>
              {isAddressValid ? '✓ Adresse valide' : t('token.invalidAddress')}
            </div>
          )}

          {/* QR Scanner Modal */}
          {showScanner && (
            <div className="qr-scanner-modal">
              <Button
                type="button"
                disabled={busy}
                className="close-scanner-button"
                onClick={onCloseScanner}
              >
                ✕ {t('common.close')}
              </Button>
              <QrCodeScanner onAddressDetected={onAddressDetected} />
            </div>
          )}
        </div>

        {/* Amount Input Field */}
        <div className="form-group">
          <label htmlFor="token-amount" className="form-label">
            {t('token.amount')}
          </label>
          <div className="form-input-group">
            <input
              id="token-amount"
              type="number"
              value={sendForm.amount}
              onChange={(e) => onInputChange('amount', sanitizeInput(e.target.value, 'amount'))}
              placeholder="0.00"
              step="any"
              min="0"
              disabled={busy}
              className="form-input"
              autoComplete="off"
            />
            {token && (
              <Button
                type="button"
                onClick={onMaxClick}
                className="max-button"
                disabled={busy}
              >
                {t('common.max')}
              </Button>
            )}
          </div>
          
          {/* Balance info */}
          {token && (
            <div className="balance-info">
              💰 {t('token.available')}: <strong>{typeof token.balance === 'object' ? token.balance.display : token.balance}</strong> {token.ticker || token.symbol}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <Button
            type="submit"
            className={`send-button ${canSubmit ? 'btn-primary' : ''}`}
            disabled={!canSubmit}
          >
            {busy ? (
              <>⌛ {t('token.sending')}</>
            ) : countdown > 0 ? (
              <>⏳ {t('token.transactionCooldown', { countdown })}</>
            ) : (
              <>✔️ {t('token.sendTokens')}</>
            )}
          </Button>
        </div>
      </Stack>
    </form>
  );
};

export default TokenSendForm;
