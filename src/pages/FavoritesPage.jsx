import { useState } from 'react';
import { useAtom } from 'jotai';
import { favoriteFarmsAtom, selectedFarmAtom, walletAtom, toggleFarmFavoriteAtom } from '../atoms';
import { useFarms } from '../hooks/useFarms';
import { useEcashToken } from '../hooks/useEcashWallet';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../components/Layout/MobileLayout';
import '../styles/directory.css';

const FavoritesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { farms, loading, error } = useFarms();
  const [favoriteFarmIds] = useAtom(favoriteFarmsAtom);
  const [selectedFarm, setSelectedFarm] = useAtom(selectedFarmAtom);
  const [wallet] = useAtom(walletAtom);
  const [, toggleFavorite] = useAtom(toggleFarmFavoriteAtom);
  const [modalFarm, setModalFarm] = useState(null);
  
  // Page title
  const pageTitle = '⭐ Mes Favoris';

  // Filter farms to only show favorites
  const favoriteFarms = farms.filter(farm => favoriteFarmIds.includes(farm.id));

  const handleOpenModal = (farm) => {
    setModalFarm(farm);
  };

  const handleCloseModal = () => {
    setModalFarm(null);
  };

  const handlePayFarm = (farm) => {
    setSelectedFarm(farm);
    navigate('/wallet');
    setModalFarm(null);
  };

  const handleRemoveFavorite = (e, farmId) => {
    e.stopPropagation();
    toggleFavorite(farmId);
  };

  const handleInviteFarmer = () => {
    const shareData = {
      title: 'Farm Wallet - Plateforme de monnaie locale',
      text: 'Découvre cette plateforme pour créer ta monnaie locale et financer ton exploitation de manière décentralisée. Rejoins la communauté des producteurs en circuit court !',
      url: window.location.origin
    };

    // Try Web Share API first (mobile)
    if (navigator.share) {
      navigator.share(shareData)
        .catch((error) => {
          // Fallback to mailto if sharing fails or is cancelled
          if (error.name !== 'AbortError') {
            openMailtoFallback();
          }
        });
    } else {
      // Fallback to mailto for desktop
      openMailtoFallback();
    }
  };

  const openMailtoFallback = () => {
    const subject = encodeURIComponent('Découvre Farm Wallet - Plateforme de monnaie locale');
    const body = encodeURIComponent(`Bonjour,

Je t'invite à découvrir Farm Wallet, une plateforme qui permet aux producteurs de créer leur propre monnaie locale pour :
- Fidéliser leur clientèle
- Obtenir une avance de trésorerie
- Vendre en circuit ultra-court sans intermédiaire

C'est simple, gratuit et décentralisé sur la blockchain eCash.

Découvre la plateforme : ${window.location.origin}

À bientôt !`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="directory-page">
          <div className="loading-message">{t('common.loading')}</div>
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout>
        <div className="directory-page">
          <div className="error-message">{error}</div>
        </div>
      </MobileLayout>
    );
  }

  if (favoriteFarms.length === 0) {
    return (
      <MobileLayout>
        <div className="directory-page">
          <div className="directory-header">
            <h1>⭐ {t('navigation.favorites') || 'Favorites'}</h1>
            <p className="directory-subtitle">
              {t('favorites.description') || 'Retrouvez ici vos producteurs préférés pour un accès rapide.'}
            </p>
          </div>
          <div className="empty-favorites">
            <p className="empty-message">{t('favorites.empty') || 'No favorite farms yet. Add farms from the directory!'}</p>
            <button onClick={() => navigate('/')} className="primary-button">
              {t('favorites.goToDirectory') || 'Browse Directory'}
            </button>
          </div>

          {/* Invitation Section - Always visible even when empty */}
          <div className="invite-section">
            <h2>{t('favorites.inviteTitle') || 'Vous connaissez un producteur ?'}</h2>
            <p className="invite-description">
              {t('favorites.inviteDescription') || 'Partagez la plateforme avec les producteurs de votre région et aidez-les à créer leur monnaie locale.'}
            </p>
            <button onClick={handleInviteFarmer} className="invite-button">
              👨‍🌾 {t('favorites.inviteButton') || 'Inviter un fermier'}
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="directory-page">
        <h1 className="page-header-title">{pageTitle}</h1>
        
        <div className="directory-header">
          <h2 className="directory-subtitle-header">⭐ {t('navigation.favorites') || 'Favorites'}</h2>
          <p className="directory-subtitle">
            {t('favorites.description') || 'Retrouvez ici vos producteurs préférés pour un accès rapide.'}
          </p>
          <p className="favorites-count">
            {favoriteFarms.length} {t('favorites.farmsCount') || 'favorite farm(s)'}
          </p>
        </div>

        <div className="farms-grid">
          {favoriteFarms.map((farm) => (
            <FarmCard
              key={farm.id}
              farm={farm}
              isSelected={selectedFarm?.id === farm.id}
              onOpenModal={() => handleOpenModal(farm)}
              onRemoveFavorite={(e) => handleRemoveFavorite(e, farm.id)}
              onPay={() => handlePayFarm(farm)}
              wallet={wallet}
            />
          ))}
        </div>

        {/* Farm Detail Modal */}
        {modalFarm && (
          <FarmModal
            farm={modalFarm}
            onClose={handleCloseModal}
            onPay={() => handlePayFarm(modalFarm)}
            wallet={wallet}
          />
        )}

        {/* Invitation Section */}
        <div className="invite-section">
          <h2>{t('favorites.inviteTitle') || 'Vous connaissez un producteur ?'}</h2>
          <p className="invite-description">
            {t('favorites.inviteDescription') || 'Partagez la plateforme avec les producteurs de votre région et aidez-les à créer leur monnaie locale.'}
          </p>
          <button onClick={handleInviteFarmer} className="invite-button">
            👨‍🌾 {t('favorites.inviteButton') || 'Inviter un fermier'}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
};

// Farm Card Component with Token Balance
const FarmCard = ({ farm, isSelected, onOpenModal, onRemoveFavorite, onPay, wallet }) => {
  const { t } = useTranslation();
  const { tokenBalance, tokenInfo } = useEcashToken(farm.tokenId);

  const formatBalance = (balance) => {
    if (!balance || balance === '0') return '0';
    const decimals = tokenInfo?.decimals || 0;
    const divisor = Math.pow(10, decimals);
    return (parseFloat(balance) / divisor).toFixed(decimals);
  };

  return (
    <div 
      className={`farm-card ${isSelected ? 'selected' : ''}`}
      onClick={onOpenModal}
      style={{ cursor: 'pointer' }}
    >
      <button 
        className="favorite-star active"
        onClick={onRemoveFavorite}
        aria-label={t('favorites.remove') || 'Remove from favorites'}
        title={t('favorites.remove') || 'Remove from favorites'}
      >
        ⭐
      </button>

      <div className="farm-header">
        <h3>{farm.name}</h3>
        {farm.verified && (
          <span className="verified-badge" title={t('directory.verified')}>
            ✓
          </span>
        )}
      </div>

      <div className="farm-meta">
        <span className="farm-region">📍 {farm.region}</span>
        <span className="farm-type">{farm.type}</span>
      </div>

      {farm.description && (
        <p className="farm-description">{farm.description}</p>
      )}

      {wallet && (
        <div className="farm-balance">
          <div className="balance-info">
            <span className="balance-label">{t('favorites.yourBalance') || 'Your balance'}:</span>
            <span className="balance-value">
              {formatBalance(tokenBalance)} <strong>{tokenInfo?.ticker || farm.ticker}</strong>
            </span>
          </div>
          <button 
            className="pay-button"
            onClick={(e) => {
              e.stopPropagation();
              onPay();
            }}
          >
            💳 {t('favorites.pay') || 'Payer'}
          </button>
        </div>
      )}

      {isSelected && (
        <span className="active-badge">
          ✓ {t('directory.active') || 'Active'}
        </span>
      )}
    </div>
  );
};

// Farm Detail Modal Component
const FarmModal = ({ farm, onClose, onPay, wallet }) => {
  const { t } = useTranslation();
  const { tokenBalance, tokenInfo } = useEcashToken(farm.tokenId);

  const formatBalance = (balance) => {
    if (!balance || balance === '0') return '0';
    const decimals = tokenInfo?.decimals || 0;
    const divisor = Math.pow(10, decimals);
    return (parseFloat(balance) / divisor).toFixed(decimals);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>{farm.name}</h2>
          {farm.verified && (
            <span className="verified-badge" title={t('directory.verified')}>
              ✓ {t('directory.verified')}
            </span>
          )}
        </div>

        <div className="modal-body">
          <div className="farm-detail-section">
            {/* Location */}
            <div className="modal-info-section">
              <div className="info-icon">📍</div>
              <div className="info-content">
                <div className="info-main">{farm.region}, {farm.department}</div>
                {farm.country && <div className="info-sub">{farm.country}</div>}
              </div>
            </div>

            {/* Description */}
            {farm.description && (
              <div className="modal-info-section">
                <p className="farm-description-text">{farm.description}</p>
              </div>
            )}

            {/* Products */}
            {farm.products && farm.products.length > 0 && (
              <div className="modal-info-section">
                <h3 className="section-title">👨‍🌾 Produits</h3>
                <div className="products-list">
                  {farm.products.map((product, index) => (
                    <span key={index} className="product-tag">{product}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Rewards */}
            {farm.rewards && (
              <div className="modal-info-section rewards-section">
                <div className="rewards-icon">🎁</div>
                <div className="rewards-text">{farm.rewards}</div>
              </div>
            )}

            {/* Balance */}
            {wallet && (
              <div className="modal-balance">
                <div className="balance-label-small">{t('favorites.yourBalance') || 'Votre solde'}</div>
                <div className="balance-display-large">
                  <span className="balance-amount">{formatBalance(tokenBalance)}</span>
                  <span className="balance-ticker">{tokenInfo?.ticker || farm.ticker}</span>
                </div>
              </div>
            )}

            {/* Contact Links */}
            <div className="modal-contact-grid">
              {farm.address && (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(farm.address)}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contact-link"
                >
                  🗺️ {t('directory.directions') || 'Itinéraire'}
                </a>
              )}
              {farm.phone && (
                <a href={`tel:${farm.phone}`} className="contact-link">
                  📞 {t('directory.phone') || 'Téléphone'}
                </a>
              )}
              {farm.website && (
                <a href={farm.website} target="_blank" rel="noopener noreferrer" className="contact-link">
                  🌐 {t('directory.website') || 'Site web'}
                </a>
              )}
              {farm.contactEmail && (
                <a href={`mailto:${farm.contactEmail}`} className="contact-link">
                  📧 {t('directory.contact') || 'Contact'}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-pay-button" onClick={onPay}>
            💳 {t('favorites.pay') || 'Payer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
