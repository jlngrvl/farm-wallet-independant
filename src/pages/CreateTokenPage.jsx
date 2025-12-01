import { useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../components/Layout/MobileLayout';
import { useTranslation } from '../hooks/useTranslation';
import { useEcashWallet, useEcashBalance } from '../hooks/useEcashWallet';
import { useXecPrice } from '../hooks/useXecPrice';
import { useAdmin } from '../hooks/useAdmin';
import { walletConnectedAtom, walletAtom, notificationAtom, walletModalOpenAtom } from '../atoms';
import '../styles/fund.css';

const CreateTokenPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State atoms
  const [walletConnected] = useAtom(walletConnectedAtom);
  const [wallet] = useAtom(walletAtom);
  const setNotification = useSetAtom(notificationAtom);
  const setWalletModalOpen = useSetAtom(walletModalOpenAtom);
  
  // Hooks
  const { wallet: walletInstance } = useEcashWallet();
  const { balance } = useEcashBalance();
  const xecPrice = useXecPrice();
  const isAdmin = useAdmin();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    decimals: 0,
    quantity: '',
    isFixedSupply: false,
    url: ''
  });
  
  // Loading & Result states
  const [creating, setCreating] = useState(false);
  const [createdToken, setCreatedToken] = useState(null);

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validation: Check if form is valid
  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.ticker.trim() !== '' &&
      formData.ticker.length <= 5 &&
      formData.quantity !== '' &&
      Number(formData.quantity) > 0 &&
      balance >= 25
    );
  };

  const handleCreateToken = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setNotification({ type: 'error', message: t('createToken.validation.nameRequired') });
      return;
    }
    
    if (!formData.ticker.trim()) {
      setNotification({ type: 'error', message: t('createToken.validation.tickerRequired') });
      return;
    }
    
    if (formData.ticker.length > 5) {
      setNotification({ type: 'error', message: t('createToken.validation.tickerTooLong') });
      return;
    }
    
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      setNotification({ type: 'error', message: t('createToken.validation.quantityPositive') });
      return;
    }
    
    // Check XEC balance
    if (balance < 25) {
      setNotification({ type: 'error', message: t('createToken.validation.insufficientXec') });
      return;
    }

    try {
      setCreating(true);
      
      const params = {
        name: formData.name.trim(),
        ticker: formData.ticker.trim().toUpperCase(),
        url: formData.url.trim() || '',
        decimals: parseInt(formData.decimals),
        quantity: parseInt(formData.quantity),
        isFixedSupply: formData.isFixedSupply
      };
      
      console.log('🚀 Creating token with params:', params);
      
      const result = await walletInstance.createToken(params);
      
      console.log('✅ Token created:', result);
      
      setCreatedToken(result);
      
      setNotification({
        type: 'success',
        message: t('createToken.successTitle')
      });
      
    } catch (error) {
      console.error('❌ Error creating token:', error);
      setNotification({
        type: 'error',
        message: `${t('createToken.errorTitle')}: ${error.message}`
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCopyTokenId = () => {
    if (createdToken?.txid) {
      navigator.clipboard.writeText(createdToken.txid).then(
        () => {
          setNotification({ type: 'success', message: t('wallet.addressCopied') || 'Token ID copié !' });
        },
        (err) => {
          console.error('Copy failed:', err);
          setNotification({ type: 'error', message: t('wallet.copyFailed') });
        }
      );
    }
  };

  const handleGoToKyc = () => {
    navigate('/farmer-info');
  };

  const handleConnectWallet = () => {
    if (location.pathname === '/') {
      setWalletModalOpen(true);
    } else {
      navigate('/');
      setTimeout(() => {
        setWalletModalOpen(true);
      }, 100);
    }
  };

  // Calculate estimated cost in EUR
  const estimatedCostXec = 25;
  const estimatedCostEur = xecPrice && typeof xecPrice.convert === 'function' 
    ? xecPrice.convert(estimatedCostXec, 'EUR').toFixed(4) 
    : '...';

  // Wallet not connected view
  if (!walletConnected || !wallet) {
    return (
      <MobileLayout title={t('createToken.title')}>
        <div className="settings-page-content">
          <h1 className="page-header-title">🛠️ {t('createToken.title')}</h1>
          
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-secondary, #f5f5f5)',
            borderRadius: '12px',
            margin: '20px 0'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
            <p style={{ 
              fontSize: '1rem', 
              color: 'var(--text-primary, #000)',
              marginBottom: '20px'
            }}>
              {t('createToken.connectWallet')}
            </p>
            <button
              onClick={handleConnectWallet}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--primary-color, #0074e4)',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              🔓 {t('common.connect')}
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Success view (after token created)
  if (createdToken) {
    return (
      <MobileLayout title={t('createToken.title')}>
        <div className="settings-page-content">
          <h1 className="page-header-title">🛠️ {t('createToken.title')}</h1>
          
          <div style={{
            padding: '30px',
            backgroundColor: 'var(--bg-secondary, #f0f9ff)',
            borderRadius: '12px',
            border: '2px solid var(--primary-color, #0074e4)',
            margin: '20px 0'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '10px' }}>🎉</div>
              <h2 style={{ 
                fontSize: '1.3rem', 
                fontWeight: '700',
                color: 'var(--primary-color, #0074e4)',
                marginBottom: '10px'
              }}>
                {t('createToken.successTitle')}
              </h2>
              <div style={{ 
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'var(--text-primary, #000)',
                marginBottom: '5px'
              }}>
                {createdToken.name} ({createdToken.ticker})
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary, #666)',
                marginTop: '8px'
              }}>
                {createdToken.isFixedSupply ? '🔒 Offre Fixe' : '🔄 Offre Variable'}
              </div>
            </div>

            {/* Token ID Section */}
            <div style={{
              padding: '16px',
              backgroundColor: 'var(--bg-primary, #fff)',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: 'var(--text-secondary, #666)',
                marginBottom: '8px'
              }}>
                🆔 {t('createToken.tokenId')}
              </div>
              <div style={{
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                color: 'var(--text-primary, #000)',
                padding: '8px',
                backgroundColor: 'var(--bg-secondary, #f5f5f5)',
                borderRadius: '6px',
                marginBottom: '10px'
              }}>
                {createdToken.txid}
              </div>
              <button
                onClick={handleCopyTokenId}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #ddd)',
                  backgroundColor: 'var(--bg-primary, #fff)',
                  color: 'var(--text-primary, #000)',
                  cursor: 'pointer'
                }}
              >
                📋 {t('common.copy')}
              </button>
            </div>

            {/* Next Steps */}
            <div style={{
              padding: '16px',
              backgroundColor: '#fff3cd',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '0.9rem',
                color: '#856404',
                lineHeight: '1.6'
              }}>
                ⚠️ {t('createToken.nextStep')}
              </div>
            </div>

            {/* Admin Helper */}
            {isAdmin && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                border: '2px solid #dc2626',
                borderRadius: '12px',
                backgroundColor: '#fef2f2'
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  🛡️ Admin Helper
                </h3>
                <p style={{
                  fontSize: '0.85rem',
                  color: '#4b5563',
                  marginBottom: '12px',
                  lineHeight: '1.5'
                }}>
                  Copie ce bloc JSON et ajoute-le dans <code style={{
                    backgroundColor: '#e5e7eb',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}>src/data/farms.json</code> sur GitHub pour lister ce token :
                </p>
                <div style={{ position: 'relative' }}>
                  <pre style={{
                    backgroundColor: '#1f2937',
                    color: '#10b981',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    fontFamily: 'monospace',
                    lineHeight: '1.5',
                    margin: 0
                  }}>
{JSON.stringify({
  id: Date.now().toString(),
  name: "Nom du Token (À éditer)",
  description: "Description courte...",
  region: "Région...",
  country: "France",
  department: "Département...",
  products: ["Produit 1", "Produit 2"],
  verified: false,
  tokenId: createdToken?.txid || "ERREUR_TXID",
  ticker: createdToken?.ticker || "TICKER",
  decimals: parseInt(formData.decimals) || 0,
  protocol: "ALP",
  image: "https://placehold.co/400x300?text=Ferme"
}, null, 2)}
                  </pre>
                  <button 
                    onClick={() => {
                      const jsonContent = JSON.stringify({
                        id: Date.now().toString(),
                        name: "Nom du Token (À éditer)",
                        description: "Description courte...",
                        region: "Région...",
                        country: "France",
                        department: "Département...",
                        products: ["Produit 1", "Produit 2"],
                        verified: false,
                        tokenId: createdToken?.txid || "ERREUR_TXID",
                        ticker: createdToken?.ticker || "TICKER",
                        decimals: parseInt(formData.decimals) || 0,
                        protocol: "ALP",
                        image: "https://placehold.co/400x300?text=Ferme"
                      }, null, 2);
                      navigator.clipboard.writeText(jsonContent).then(
                        () => {
                          setNotification({ type: 'success', message: 'JSON copié dans le presse-papiers !' });
                        },
                        (err) => {
                          console.error('Copy failed:', err);
                          setNotification({ type: 'error', message: 'Échec de la copie' });
                        }
                      );
                    }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#fff',
                      color: '#000',
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '500',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
                  >
                    📋 Copier JSON
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleGoToKyc}
                style={{
                  padding: '14px',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--primary-color, #0074e4)',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                📝 {t('createToken.goToKyc')}
              </button>
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '14px',
                  fontSize: '16px',
                  fontWeight: '500',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, #ddd)',
                  backgroundColor: 'var(--bg-primary, #fff)',
                  color: 'var(--text-primary, #000)',
                  cursor: 'pointer'
                }}
              >
                🏠 {t('common.back')}
              </button>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Form view (main)
  return (
    <MobileLayout title={t('createToken.title')}>
      <div className="settings-page-content">
        <h1 className="page-header-title">🛠️ {t('createToken.title')}</h1>
        
        <form onSubmit={handleCreateToken}>
          {/* Info Balance & Cost */}
          <div style={{
            padding: '14px',
            marginBottom: '24px',
            backgroundColor: 'var(--bg-secondary, #f0f9ff)',
            borderRadius: '10px',
            fontSize: '0.9rem',
            color: 'var(--text-primary, #000)',
            lineHeight: '1.6'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>💰 {t('wallet.balance')}:</span>
              <strong>{balance?.toFixed(2) || 0} XEC</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>💵 {t('createToken.estimatedCost')}</span>
              <strong>{t('createToken.estimatedCostEur', { price: estimatedCostEur })}</strong>
            </div>
          </div>

          {/* Token Name */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="token-name" style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: 'var(--text-primary, #000)',
              marginBottom: '8px'
            }}>
              {t('createToken.tokenName')} <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="token-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('createToken.tokenNamePlaceholder')}
              disabled={creating}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #ddd)',
                backgroundColor: 'var(--bg-primary, #fff)',
                color: 'var(--text-primary, #000)',
                boxSizing: 'border-box'
              }}
            />
            <small style={{
              display: 'block',
              marginTop: '6px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary, #666)',
              lineHeight: '1.4'
            }}>
              💡 {t('createToken.tokenNameHelp')}
            </small>
          </div>

          {/* Ticker */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="ticker" style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: 'var(--text-primary, #000)',
              marginBottom: '8px'
            }}>
              {t('createToken.ticker')} <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="ticker"
              type="text"
              value={formData.ticker}
              onChange={(e) => handleInputChange('ticker', e.target.value.toUpperCase())}
              placeholder={t('createToken.tickerPlaceholder')}
              maxLength={5}
              disabled={creating}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #ddd)',
                backgroundColor: 'var(--bg-primary, #fff)',
                color: 'var(--text-primary, #000)',
                boxSizing: 'border-box',
                textTransform: 'uppercase'
              }}
            />
            <small style={{
              display: 'block',
              marginTop: '6px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary, #666)',
              lineHeight: '1.4'
            }}>
              💡 {t('createToken.tickerHelp')}
            </small>
          </div>

          {/* Decimals */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="decimals" style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: 'var(--text-primary, #000)',
              marginBottom: '8px'
            }}>
              {t('createToken.decimals')} <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              id="decimals"
              value={formData.decimals}
              onChange={(e) => handleInputChange('decimals', e.target.value)}
              disabled={creating}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #ddd)',
                backgroundColor: 'var(--bg-primary, #fff)',
                color: 'var(--text-primary, #000)',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value={0}>{t('createToken.decimals0')}</option>
              <option value={2}>{t('createToken.decimals2')}</option>
              <option value={4}>{t('createToken.decimals4')}</option>
            </select>
            <small style={{
              display: 'block',
              marginTop: '6px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary, #666)',
              lineHeight: '1.4'
            }}>
              💡 {formData.decimals == 0 && t('createToken.decimals0Help')}
              {formData.decimals == 2 && t('createToken.decimals2Help')}
              {formData.decimals == 4 && t('createToken.decimals4Help')}
            </small>
          </div>

          {/* Quantity */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="quantity" style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: 'var(--text-primary, #000)',
              marginBottom: '8px'
            }}>
              {t('createToken.quantity')} <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              placeholder={t('createToken.quantityPlaceholder')}
              min="1"
              disabled={creating}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #ddd)',
                backgroundColor: 'var(--bg-primary, #fff)',
                color: 'var(--text-primary, #000)',
                boxSizing: 'border-box'
              }}
            />
            <small style={{
              display: 'block',
              marginTop: '6px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary, #666)',
              lineHeight: '1.4'
            }}>
              💡 {t('createToken.quantityHelp')}
            </small>
          </div>

          {/* Supply Type (Radio Buttons) */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: 'var(--text-primary, #000)',
              marginBottom: '12px'
            }}>
              {t('createToken.supply')} <span style={{ color: '#dc2626' }}>*</span>
            </label>
            
            {/* Variable Supply */}
            <div style={{
              padding: '12px',
              border: `2px solid ${!formData.isFixedSupply ? 'var(--primary-color, #0074e4)' : 'var(--border-color, #ddd)'}`,
              borderRadius: '8px',
              marginBottom: '10px',
              cursor: 'pointer',
              backgroundColor: !formData.isFixedSupply ? 'var(--bg-secondary, #f0f9ff)' : 'var(--bg-primary, #fff)',
              transition: 'all 0.2s'
            }}
            onClick={() => handleInputChange('isFixedSupply', false)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="radio"
                  id="supply-variable"
                  name="supply"
                  checked={!formData.isFixedSupply}
                  onChange={() => handleInputChange('isFixedSupply', false)}
                  disabled={creating}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="supply-variable" style={{
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  color: 'var(--text-primary, #000)',
                  cursor: 'pointer',
                  flex: 1
                }}>
                  🔄 {t('createToken.supplyVariable')}
                </label>
              </div>
              <small style={{
                display: 'block',
                marginTop: '6px',
                marginLeft: '30px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary, #666)',
                lineHeight: '1.4'
              }}>
                {t('createToken.supplyVariableHelp')}
              </small>
            </div>

            {/* Fixed Supply */}
            <div style={{
              padding: '12px',
              border: `2px solid ${formData.isFixedSupply ? '#dc2626' : 'var(--border-color, #ddd)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: formData.isFixedSupply ? '#fef2f2' : 'var(--bg-primary, #fff)',
              transition: 'all 0.2s'
            }}
            onClick={() => handleInputChange('isFixedSupply', true)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="radio"
                  id="supply-fixed"
                  name="supply"
                  checked={formData.isFixedSupply}
                  onChange={() => handleInputChange('isFixedSupply', true)}
                  disabled={creating}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="supply-fixed" style={{
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  color: 'var(--text-primary, #000)',
                  cursor: 'pointer',
                  flex: 1
                }}>
                  🔒 {t('createToken.supplyFixed')}
                </label>
              </div>
              <small style={{
                display: 'block',
                marginTop: '6px',
                marginLeft: '30px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary, #666)',
                lineHeight: '1.4'
              }}>
                {t('createToken.supplyFixedHelp')}
              </small>
            </div>
          </div>

          {/* URL (Optional) */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="url" style={{
              display: 'block',
              fontSize: '0.95rem',
              fontWeight: '600',
              color: 'var(--text-primary, #000)',
              marginBottom: '8px'
            }}>
              {t('createToken.url')} <span style={{ fontSize: '0.85rem', color: '#999' }}>(Optionnel)</span>
            </label>
            <input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder={t('createToken.urlPlaceholder')}
              disabled={creating}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #ddd)',
                backgroundColor: 'var(--bg-primary, #fff)',
                color: 'var(--text-primary, #000)',
                boxSizing: 'border-box'
              }}
            />
            <small style={{
              display: 'block',
              marginTop: '6px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary, #666)',
              lineHeight: '1.4'
            }}>
              💡 {t('createToken.urlHelp')}
            </small>
          </div>

          {/* Immutability Warning */}
          <div style={{
            padding: '16px',
            backgroundColor: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: '10px',
            marginBottom: '24px'
          }}>
            <div style={{
              fontSize: '0.9rem',
              color: '#856404',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              ⚠️ {t('createToken.immutabilityWarning')}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={creating || !isFormValid()}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: (creating || !isFormValid()) ? '#ccc' : 'var(--primary-color, #0074e4)',
              color: '#fff',
              cursor: (creating || !isFormValid()) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: (creating || !isFormValid()) ? 0.6 : 1
            }}
          >
            {creating ? `⏳ ${t('createToken.creating')}` : `🚀 ${t('createToken.createButton')}`}
          </button>
        </form>
      </div>
    </MobileLayout>
  );
};

export default CreateTokenPage;
