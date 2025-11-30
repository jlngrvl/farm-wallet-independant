import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { selectedFarmAtom, favoriteFarmsAtom, toggleFarmFavoriteAtom, walletConnectedAtom, currentTokenIdAtom, walletModalOpenAtom } from '../atoms';
import { useFarms } from '../hooks';
import { useToken } from '../hooks/useToken';
import { useTranslation } from '../hooks/useTranslation';
import { useEcashWallet } from '../hooks/useEcashWallet';
import TopBar from '../components/Layout/TopBar';
import BottomNavigation from '../components/Layout/BottomNavigation';
import ECashWallet from '../components/ECashWallet';
import '../styles/directory.css';

/**
 * Directory Page - Farm selection interface
 * This is the entry point of the Farm Wallet Platform
 */
const DirectoryPage = () => {
  const { t } = useTranslation();
  const { farms, loading, error } = useFarms();
  const [, setSelectedFarm] = useAtom(selectedFarmAtom);
  const [favoriteFarmIds] = useAtom(favoriteFarmsAtom);
  const [, toggleFavorite] = useAtom(toggleFarmFavoriteAtom);
  const [walletConnected] = useAtom(walletConnectedAtom);
  const [isWalletModalOpen, setIsWalletModalOpen] = useAtom(walletModalOpenAtom);
  const navigate = useNavigate();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');
  
  // Modal state
  const [modalFarm, setModalFarm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // The wallet modal is controlled by isWalletModalOpen atom
  // TopBar can set it to true to open the modal from anywhere
  // The modal closes itself when connection succeeds or user clicks X

  // Get unique countries from farms
  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(farms.map(farm => farm.country).filter(Boolean))];
    return uniqueCountries.sort();
  }, [farms]);

  // Get unique regions - filtered by selected country (cascading)
  const regions = useMemo(() => {
    let filteredFarms = farms;
    if (selectedCountry !== 'all') {
      filteredFarms = farms.filter(farm => farm.country === selectedCountry);
    }
    const uniqueRegions = [...new Set(filteredFarms.map(farm => farm.region))];
    return uniqueRegions.sort();
  }, [farms, selectedCountry]);
  
  // Get unique departments - filtered by selected country and region (cascading)
  const departments = useMemo(() => {
    let filteredFarms = farms;
    if (selectedCountry !== 'all') {
      filteredFarms = filteredFarms.filter(farm => farm.country === selectedCountry);
    }
    if (selectedRegion !== 'all') {
      filteredFarms = filteredFarms.filter(farm => farm.region === selectedRegion);
    }
    const uniqueDepartments = [...new Set(filteredFarms.map(farm => farm.department).filter(Boolean))];
    return uniqueDepartments.sort();
  }, [farms, selectedCountry, selectedRegion]);
  
  // Get unique products - filtered by current geographic selection (cascading)
  const products = useMemo(() => {
    let filteredFarms = farms;
    if (selectedCountry !== 'all') {
      filteredFarms = filteredFarms.filter(farm => farm.country === selectedCountry);
    }
    if (selectedRegion !== 'all') {
      filteredFarms = filteredFarms.filter(farm => farm.region === selectedRegion);
    }
    if (selectedDepartment !== 'all') {
      filteredFarms = filteredFarms.filter(farm => farm.department === selectedDepartment);
    }
    const allProducts = filteredFarms.flatMap(farm => farm.products || []);
    const uniqueProducts = [...new Set(allProducts)];
    return uniqueProducts.sort();
  }, [farms, selectedCountry, selectedRegion, selectedDepartment]);

  // Filter farms based on search, country, region, department, and products (cascading logic)
  const filteredFarms = useMemo(() => {
    let filtered = farms.filter(farm => {
      const matchesSearch = farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           farm.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = selectedCountry === 'all' || farm.country === selectedCountry;
      const matchesRegion = selectedRegion === 'all' || farm.region === selectedRegion;
      const matchesDepartment = selectedDepartment === 'all' || farm.department === selectedDepartment;
      const matchesProduct = selectedProduct === 'all' || (farm.products && farm.products.includes(selectedProduct));
      return matchesSearch && matchesCountry && matchesRegion && matchesDepartment && matchesProduct;
    });
    
    // Sort favorites first if wallet is connected
    if (walletConnected && favoriteFarmIds.length > 0) {
      filtered = filtered.sort((a, b) => {
        const aIsFavorite = favoriteFarmIds.includes(a.id);
        const bIsFavorite = favoriteFarmIds.includes(b.id);
        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;
        return 0;
      });
    }
    
    return filtered;
  }, [farms, searchQuery, selectedCountry, selectedRegion, selectedDepartment, selectedProduct, walletConnected, favoriteFarmIds]);

  const handleSelectFarm = (farm) => {
    console.log('Selected farm:', farm);
    setSelectedFarm(farm);
    navigate('/wallet');
  };

  const handleLogout = () => {
    if (window.confirm(t('wallet.disconnectConfirm'))) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleLogin = () => {
    setIsWalletModalOpen(true);
  };

  const handleRegisterFarm = () => {
    navigate('/farmer-info');
  };
  
  const handleCardClick = (farm) => {
    setModalFarm(farm);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalFarm(null);
  };
  
  const handleSelectFromModal = () => {
    if (modalFarm) {
      if (!walletConnected) {
        // Si non connecté, ouvrir le modal wallet
        handleCloseModal();
        setIsWalletModalOpen(true);
      } else {
        // Si connecté, sélectionner la ferme
        handleSelectFarm(modalFarm);
        handleCloseModal();
      }
    }
  };
  
  const getGoogleMapsLink = (farm) => {
    const query = encodeURIComponent(`${farm.name}, ${farm.region}, France`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  if (loading) {
    return (
      <div className="directory-container">
        <div className="directory-loading">
          <div className="loading-spinner"></div>
          <p>{t('directory.loading') || 'Loading farms...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="directory-container">
        <div className="directory-error">
          <h2>❌ {t('directory.error') || 'Error'}</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="directory-container">
      <TopBar />

      <header className="directory-header">
        <h1>Soutenez vos producteurs locaux en direct 🇫🇷</h1>
        <p className="directory-subtitle">
          {t('directory.subtitle') || 'La plateforme de crowdfunding local décentralisé sur eCash'}
        </p>
      </header>

      {/* Filters Section */}
      <div className="directory-filters-wrapper">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder={t('directory.searchPlaceholder') || 'Search farms by name...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filters-horizontal-scroll">
          <div className="filter-group">
            <select
              className="filter-select modern"
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedRegion('all');
                setSelectedDepartment('all');
              }}
            >
              <option value="all">🌍 {t('directory.allCountries') || 'Tous les pays'}</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              className="filter-select modern"
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedDepartment('all');
              }}
            >
              <option value="all">📍 {t('directory.allRegions') || 'All Regions'}</option>
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              className="filter-select modern"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="all">🏘️ {t('directory.allDepartments') || 'Tous les départements'}</option>
              {departments.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              className="filter-select modern"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="all">🥬 {t('directory.allProducts') || 'Tous les produits'}</option>
              {products.map((product) => (
                <option key={product} value={product}>{product}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading && !error && (
        <div className="results-count">
          {filteredFarms.length === farms.length ? (
            <p>
              {farms.length} {t('directory.farmsAvailable') || 'farms available'}
            </p>
          ) : (
            <p>
              {filteredFarms.length} {t('directory.resultsFound') || 'results found'} {t('directory.outOf') || 'out of'} {farms.length}
            </p>
          )}
        </div>
      )}

      {/* Farms Grid */}
      <div className="farms-grid">
        {filteredFarms.length === 0 ? (
          <div className="no-farms">
            <p>
              {searchQuery || selectedRegion !== 'all' 
                ? (t('directory.noResults') || 'No farms match your filters')
                : (t('directory.noFarms') || 'No farms available yet')
              }
            </p>
            {(searchQuery || selectedCountry !== 'all' || selectedRegion !== 'all' || selectedDepartment !== 'all' || selectedProduct !== 'all') && (
              <button
                className="reset-filters-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCountry('all');
                  setSelectedRegion('all');
                  setSelectedDepartment('all');
                  setSelectedProduct('all');
                }}
              >
                {t('directory.resetFilters') || 'Reset filters'}
              </button>
            )}
          </div>
        ) : (
          filteredFarms.map((farm) => {
            const isFavorite = favoriteFarmIds.includes(farm.id);
            return (
              <FarmCard 
                key={farm.id} 
                farm={farm} 
                isFavorite={isFavorite}
                onCardClick={handleCardClick}
                onSelectClick={handleLogin}
              />
            );
          })
        )}
      </div>

      {/* Register Farm Button - Moved to bottom */}
      <div className="register-farm-section-footer">
        <button
          className="register-farm-btn"
          onClick={handleRegisterFarm}
        >
          👨‍🌾 {t('directory.registerFarmButton') || 'Are you a farmer? List your token'}
        </button>
      </div>
      
      {/* Farm Details Modal */}
      {isModalOpen && modalFarm && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              ✕
            </button>
            
            <div className="modal-header">
              <h2>{modalFarm.name}</h2>
              {modalFarm.verified && (
                <span className="verified-badge verified modal-verified">
                  ✓ {t('directory.verified') || 'Verified'}
                </span>
              )}
            </div>
            
            <div className="modal-body">
              <div className="modal-info-row">
                <span className="modal-label">📍 {t('directory.region') || 'Région'}:</span>
                <span className="modal-value">{modalFarm.region}</span>
              </div>
              
              {modalFarm.department && (
                <div className="modal-info-row">
                  <span className="modal-label">🏛️ Département:</span>
                  <span className="modal-value">{modalFarm.department}</span>
                </div>
              )}
              
              <div className="modal-section">
                <h3>{t('directory.description') || 'Description'}</h3>
                <p>{modalFarm.description}</p>
              </div>
              
              {modalFarm.products && modalFarm.products.length > 0 && (
                <div className="modal-section">
                  <h3>👨‍🌾 Produits</h3>
                  <div className="product-badges">
                    {modalFarm.products.map((product, idx) => (
                      <span key={idx} className="product-badge">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {modalFarm.contactEmail && (
                <div className="modal-info-row">
                  <span className="modal-label">📧 {t('directory.contact') || 'Contact'}:</span>
                  <a href={`mailto:${modalFarm.contactEmail}`} className="modal-link">
                    {modalFarm.contactEmail}
                  </a>
                </div>
              )}
              
              {modalFarm.website && (
                <div className="modal-info-row">
                  <span className="modal-label">🌐 {t('directory.website') || 'Website'}:</span>
                  <a href={modalFarm.website} target="_blank" rel="noopener noreferrer" className="modal-link">
                    {modalFarm.website}
                  </a>
                </div>
              )}
              
              <div className="modal-actions">
                <a
                  href={getGoogleMapsLink(modalFarm)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-map-btn"
                >
                  🗺️ {t('directory.directions') || 'Itinéraire'}
                </a>
                <button onClick={handleSelectFromModal} className="modal-select-btn">
                  {t('directory.selectThisFarm') || 'Sélectionner cette ferme'} →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Wallet Connection Modal */}
      {isWalletModalOpen && (
        <div className="modal-overlay" onClick={() => setIsWalletModalOpen(false)}>
          <div className="modal-container wallet-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn"
              onClick={() => setIsWalletModalOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="modal-content">
              <h2 className="wallet-modal-title">{t('common.connect') || 'Connexion'}</h2>
              <ECashWallet onWalletConnected={() => setIsWalletModalOpen(false)} />
              <div className="wallet-modal-help">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsWalletModalOpen(false);
                    navigate('/faq');
                  }}
                  className="faq-link-btn"
                >
                  ❓ {t('common.help') || 'Besoin d\'aide ?'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Bottom Navigation - show if wallet is connected */}
      {walletConnected && (
        <div className="directory-bottom-nav">
          <BottomNavigation />
        </div>
      )}
    </div>
  );
};

/**
 * Smart FarmCard Component - Shows Pay button if user holds tokens, Select otherwise
 */
const FarmCard = ({ farm, isFavorite, onCardClick, onSelectClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [walletConnected] = useAtom(walletConnectedAtom);
  const [, setSelectedFarm] = useAtom(selectedFarmAtom);
  const [, setCurrentTokenId] = useAtom(currentTokenIdAtom);
  const [, toggleFavorite] = useAtom(toggleFarmFavoriteAtom);
  
  // Check token balance for this farm
  const { balance, loading: balanceLoading } = useToken(farm.tokenId);
  
  const hasTokens = walletConnected && balance > 0;

  const handleSelectFarm = (e) => {
    e.stopPropagation();
    if (!walletConnected) {
      // Si non connecté, ouvrir le modal wallet
      onSelectClick();
    } else {
      // Si connecté, sélectionner la ferme
      setSelectedFarm(farm);
      setCurrentTokenId(farm.tokenId);
      navigate('/wallet');
    }
  };

  const handlePayFarm = (e) => {
    e.stopPropagation();
    setSelectedFarm(farm);
    setCurrentTokenId(farm.tokenId);
    navigate('/send');
  };

  const handleCardClick = () => {
    onCardClick(farm);
  };

  return (
    <div className="farm-card" onClick={handleCardClick}>
      <div className="farm-card-content">
        {/* Favorite star - only show if connected */}
        {walletConnected && (
          <button
            className={`favorite-star-btn ${isFavorite ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(farm.id);
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '⭐' : '☆'}
          </button>
        )}
        
        <h3 className="farm-name">
          {farm.name}
          {farm.ticker && <span className="farm-ticker"> ({farm.ticker})</span>}
        </h3>
        <p className="farm-region">📍 {farm.region}</p>
        <p className="farm-description">{farm.description}</p>
        
        {/* Rewards banner - show if defined */}
        {farm.rewards && (
          <div className="farm-rewards-banner">
            🎁 {farm.rewards}
          </div>
        )}
        
        {/* Token balance - show if user has tokens */}
        {hasTokens && !balanceLoading && (
          <div className="farm-balance-display">
            💰 {t('directory.yourBalance') || 'Your balance'}: <strong>{balance.toLocaleString()} {farm.ticker || 'tokens'}</strong>
          </div>
        )}
        
        {/* Product badges */}
        {farm.products && farm.products.length > 0 && (
          <div className="product-badges">
            {farm.products.map((product, idx) => (
              <span key={idx} className="product-badge">
                {product}
              </span>
            ))}
          </div>
        )}
        
        <div className="farm-footer">
          <div className="farm-badges">
            {farm.verified ? (
              <span className="verified-badge verified">
                ✓ {t('directory.verified') || 'Verified'}
              </span>
            ) : (
              <span className="verified-badge unverified">
                {t('directory.notVerified') || 'Not Verified'}
              </span>
            )}
          </div>
          
          {/* Smart button - Pay if has tokens, Select otherwise */}
          {hasTokens ? (
            <button 
              className="pay-farm-btn"
              onClick={handlePayFarm}
            >
              {t('directory.pay') || 'Pay'} 💳
            </button>
          ) : (
            <button 
              className="select-farm-btn"
              onClick={handleSelectFarm}
            >
              {t('directory.select') || 'Select'} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectoryPage;
