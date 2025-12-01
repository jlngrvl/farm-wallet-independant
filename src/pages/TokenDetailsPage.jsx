import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAtom, useSetAtom } from 'jotai';
import MobileLayout from '../components/Layout/MobileLayout';
import BlockchainStatus from '../components/BlockchainStatus';
import QrCodeScanner from '../components/QrCodeScanner';
import { Card, CardContent, Button, PageLayout, Badge, Tabs, BalanceCard } from '../components/UI';
import { useEcashWallet } from '../hooks/useEcashWallet';
import { useFarms } from '../hooks/useFarms';
import { useXecPrice } from '../hooks/useXecPrice';
import { notificationAtom, currencyAtom } from '../atoms';
import '../styles/token-details.css';

const TokenDetailsPage = () => {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const { wallet } = useEcashWallet();
  const { farms } = useFarms();
  const setNotification = useSetAtom(notificationAtom);

  // États de chargement et données
  const [loading, setLoading] = useState(true);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [farmInfo, setFarmInfo] = useState(null);
  const [myBalance, setMyBalance] = useState('0');
  const [isCreator, setIsCreator] = useState(false);
  
  // États des onglets
  const [activeTab, setActiveTab] = useState('send'); // 'send' ou 'airdrop'
  const [managementPanelOpen, setManagementPanelOpen] = useState(false);
  const [managementTab, setManagementTab] = useState('mint'); // 'mint' ou 'burn'
  
  // États des formulaires
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [xecBalance, setXecBalance] = useState(0);
  
  // États Airdrop
  const [airdropMode, setAirdropMode] = useState('equal'); // 'equal' ou 'prorata' - toggle
  const [ignoreCreator, setIgnoreCreator] = useState(false);
  const [airdropTotal, setAirdropTotal] = useState('');
  const [minEligible, setMinEligible] = useState('');
  
  // Hooks pour le prix et la devise
  const price = useXecPrice();
  const [currency] = useAtom(currencyAtom);

  // Charger les données complètes du jeton
  useEffect(() => {
    const loadTokenData = async () => {
      if (!wallet || !tokenId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1. Récupérer les infos blockchain complètes
        const info = await wallet.getTokenInfo(tokenId);
        console.log('📊 Token Info Blockchain:', info);
        
        // 2. Récupérer les infos de l'annuaire
        const farm = farms.find((f) => f.tokenId === tokenId);
        console.log('🗂️ Farm Info:', farm);

        // 3. Vérifier si je suis le créateur (j'ai un Mint Baton)
        const batons = await wallet.getMintBatons();
        const hasBaton = batons.some((b) => b.tokenId === tokenId);
        setIsCreator(hasBaton);

        // 4. Récupérer mon solde
        let balance = '0';
        try {
          const balanceData = await wallet.getTokenBalance(tokenId);
          balance = balanceData.balance || '0';
        } catch (e) {
          console.warn('⚠️ Balance non disponible:', e);
        }

        setTokenInfo(info);
        setFarmInfo(farm);
        setMyBalance(balance);

        // 5. Récupérer le solde XEC pour les frais
        const xecBalanceData = await wallet.getBalance();
        setXecBalance(xecBalanceData.balance || 0);

      } catch (err) {
        console.error('❌ Erreur chargement jeton:', err);
        setNotification({
          type: 'error',
          message: 'Impossible de charger les données du jeton'
        });
      } finally {
        setLoading(false);
      }
    };

    loadTokenData();
  }, [tokenId, wallet, farms, setNotification]);

  // Copier le Token ID
  const handleCopyTokenId = () => {
    navigator.clipboard.writeText(tokenId).then(
      () => setNotification({ type: 'success', message: '✅ Token ID copié !' }),
      () => setNotification({ type: 'error', message: '❌ Échec de la copie' })
    );
  };

  // Gérer l'envoi de tokens
  const handleSendToken = async (e) => {
    e.preventDefault();
    if (!sendAddress || !sendAmount) {
      setNotification({ type: 'error', message: 'Adresse et montant requis' });
      return;
    }

    setProcessing(true);
    try {
      const decimals = tokenInfo?.genesisInfo?.decimals || 0;
      const protocol = farmInfo?.protocol || tokenInfo?.protocol || 'ALP';
      const result = await wallet.sendToken(tokenId, sendAddress, sendAmount, decimals, protocol);
      
      setNotification({
        type: 'success',
        message: `✅ ${sendAmount} jetons envoyés ! TXID: ${result.txid.substring(0, 8)}...`
      });
      
      setSendAddress('');
      setSendAmount('');
      
      // Recharger le solde
      setTimeout(async () => {
        try {
          const balanceData = await wallet.getTokenBalance(tokenId);
          setMyBalance(balanceData.balance || '0');
        } catch (err) {
          console.warn('⚠️ Échec rechargement solde:', err);
        }
      }, 2000);
    } catch (err) {
      console.error('❌ Erreur envoi:', err);
      setNotification({ type: 'error', message: err.message || 'Échec de l\'envoi' });
    } finally {
      setProcessing(false);
    }
  };

  // Gérer le scan QR
  const handleQrScan = (scannedAddress) => {
    setSendAddress(scannedAddress);
    setShowQrScanner(false);
    setNotification({ type: 'success', message: '✅ Adresse scannée' });
  };

  // Gérer l'émission (Mint)
  const handleMint = async (e) => {
    e.preventDefault();
    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      setNotification({ type: 'error', message: 'Montant invalide' });
      return;
    }

    setProcessing(true);
    try {
      const decimals = tokenInfo?.genesisInfo?.decimals || 0;
      const txid = await wallet.mintToken(tokenId, parseInt(mintAmount), decimals);
      
      setNotification({
        type: 'success',
        message: `✅ ${mintAmount} jetons émis ! TXID: ${txid.substring(0, 8)}...`
      });
      
      setMintAmount('');
      
      // Recharger le solde
      setTimeout(async () => {
        try {
          const balanceData = await wallet.getTokenBalance(tokenId);
          setMyBalance(balanceData.balance || '0');
        } catch (err) {
          console.warn('⚠️ Échec rechargement solde:', err);
        }
      }, 2000);
    } catch (err) {
      console.error('❌ Erreur mint:', err);
      setNotification({ type: 'error', message: err.message || 'Échec de l\'émission' });
    } finally {
      setProcessing(false);
    }
  };

  // Gérer la destruction (Burn)
  const handleBurn = async (e) => {
    e.preventDefault();
    if (!burnAmount || parseFloat(burnAmount) <= 0) {
      setNotification({ type: 'error', message: 'Montant invalide' });
      return;
    }

    setProcessing(true);
    try {
      const decimals = tokenInfo?.genesisInfo?.decimals || 0;
      const protocol = farmInfo?.protocol || tokenInfo?.protocol || 'ALP';
      const txid = await wallet.burnToken(tokenId, parseInt(burnAmount), decimals, protocol);
      
      setNotification({
        type: 'success',
        message: `🔥 ${burnAmount} jetons détruits ! TXID: ${txid.substring(0, 8)}...`
      });
      
      setBurnAmount('');
      
      // Recharger le solde
      setTimeout(async () => {
        try {
          const balanceData = await wallet.getTokenBalance(tokenId);
          setMyBalance(balanceData.balance || '0');
        } catch (err) {
          console.warn('⚠️ Échec rechargement solde:', err);
        }
      }, 2000);
    } catch (err) {
      console.error('❌ Erreur burn:', err);
      setNotification({ type: 'error', message: err.message || 'Échec de la destruction' });
    } finally {
      setProcessing(false);
    }
  };

  // Définir le MAX pour burn
  const handleSetMaxBurn = () => {
    const decimals = tokenInfo?.genesisInfo?.decimals || 0;
    const maxAmount = formatAmount(myBalance, decimals);
    setBurnAmount(maxAmount);
  };

  // Définir le MAX pour airdrop
  const handleSetMaxAirdrop = () => {
    setAirdropTotal(xecBalance.toString());
  };

  // Calculer Airdrop (Simulé)
  const handleCalculateAirdrop = () => {
    setNotification({ 
      type: 'info', 
      message: '🚧 Fonctionnalité Airdrop en développement' 
    });
  };

  // Formater un nombre avec décimales
  const formatAmount = (amount, decimals = 0) => {
    if (!amount || amount === '0') return '0';
    try {
      const num = BigInt(amount);
      const divisor = BigInt(10 ** decimals);
      const whole = num / divisor;
      const remainder = num % divisor;
      
      if (remainder === 0n) return whole.toString();
      
      const decimal = remainder.toString().padStart(decimals, '0').replace(/0+$/, '');
      return decimal ? `${whole}.${decimal}` : whole.toString();
    } catch {
      return amount.toString();
    }
  };

  // Formater une date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Inconnue';
    try {
      return new Date(timestamp * 1000).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Inconnue';
    }
  };

  if (loading) {
    return (
      <MobileLayout title="Chargement...">
        <PageLayout hasBottomNav className="max-w-2xl">
          <Stack spacing="md">
            <Card>
              <CardContent className="p-8 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-900 dark:text-white">Chargement des données...</p>
              </CardContent>
            </Card>
          </Stack>
        </PageLayout>
      </MobileLayout>
    );
  }

  if (!tokenInfo) {
    return (
      <MobileLayout title="Erreur">
        <PageLayout hasBottomNav className="max-w-2xl">
          <Stack spacing="md">
            <Card>
              <CardContent className="p-8 text-center">
              <div className="text-5xl mb-4 opacity-30">❌</div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Jeton introuvable
              </h3>
              <Button onClick={() => navigate('/manage-token')} className="w-full">
                ← Retour
              </Button>
              </CardContent>
            </Card>
          </Stack>
        </PageLayout>
      </MobileLayout>
    );
  }

  // Extraction des données principales
  const genesisInfo = tokenInfo.genesisInfo || {};
  const name = farmInfo?.name || genesisInfo.tokenName || 'Jeton Non Référencé';
  const ticker = genesisInfo.tokenTicker || 'UNK';
  const decimals = genesisInfo.decimals || 0;
  const protocol = farmInfo?.protocol || tokenInfo.protocol || 'ALP';
  const isListed = !!farmInfo;
  const genesisSupply = BigInt(genesisInfo.mintAmount || '0');
  const isActive = genesisSupply > 0n;

  return (
    <MobileLayout title={name}>
      <PageLayout hasBottomNav className="max-w-2xl">
        <Stack spacing="md">
          
          {/* EN-TÊTE */}
          <Card>
            <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={farmInfo?.image || genesisInfo.url || 'https://placehold.co/64x64?text=Token'}
                alt={name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-700 flex-shrink-0"
                onError={(e) => { e.target.src = 'https://placehold.co/64x64?text=Token'; }}
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {name}
                </h1>
                <div className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                  {ticker}
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              <Badge variant="primary">{protocol}</Badge>
              <Badge variant={isCreator ? 'success' : 'warning'}>
                {isCreator ? '🔄 Variable' : '🔒 Fixe'}
              </Badge>
              <Badge variant={isListed ? 'success' : 'default'}>
                {isListed ? '✓ Listé' : 'Non Listé'}
              </Badge>
              <Badge variant={isActive ? 'success' : 'danger'}>
                {isActive ? '✓ Actif' : '⚠ Inactif'}
              </Badge>
            </div>
            </CardContent>
          </Card>

          {/* SOLDE ET FRAIS */}
          <BalanceCard
            leftContent={{
              label: ticker,
              value: formatAmount(myBalance, decimals),
              subtitle: name
            }}
            rightContent={{
              label: 'eCash (XEC)',
              value: xecBalance.toFixed(2),
              subtitle: 'Frais réseau',
              conversion: price && typeof price.convert === 'function' ? price.convert(xecBalance, currency) : null
            }}
            onRightClick={() => navigate('/settings')}
          />

          {/* ACTIONS UTILISATEUR */}
          <Tabs
            tabs={[
              { id: 'send', label: '📤 Envoyer ' + ticker },
              { id: 'airdrop', label: '🎁 Distribuer XEC' }
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          {/* Contenu Onglet ENVOYER */}
          {activeTab === 'send' && (
            <Card>
              <CardContent className="p-6">
              <form onSubmit={handleSendToken} className="space-y-4">
                <Input
                  label="Destinataire"
                  value={sendAddress}
                  onChange={(e) => setSendAddress(e.target.value)}
                  placeholder="ecash:qp..."
                  disabled={processing}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowQrScanner(true)}
                      disabled={processing}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                    </button>
                  }
                />

                <Input
                  label="Montant"
                  type="number"
                  step="0.01"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={processing}
                  actionButton={{
                    label: 'MAX',
                    onClick: () => setSendAmount(formatAmount(myBalance, decimals))
                  }}
                  helperText={`Solde: ${formatAmount(myBalance, decimals)} ${ticker}`}
                />

                <Card>
                  <CardContent className="p-4 bg-muted/50">
                  <p className="text-sm text-gray-600 dark:text-gray-400 m-0">
                    💡 Frais de réseau estimés : ~5 XEC
                  </p>
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={processing || !sendAddress || !sendAmount}
                >
                  {processing ? '⏳ Envoi en cours...' : '✔️ Confirmer l\'envoi'}
                </Button>
              </form>
              </CardContent>
            </Card>
          )}

          {/* Contenu Onglet AIRDROP */}
          {activeTab === 'airdrop' && (
            <Card>
              <CardContent className="p-6">
              <form className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Distribuez des XEC automatiquement à tous les détenteurs de {ticker}
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mode de distribution
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className={`text-sm ${airdropMode === 'equal' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                      Égalitaire
                    </span>
                    <button
                      type="button"
                      onClick={() => setAirdropMode(airdropMode === 'equal' ? 'prorata' : 'equal')}
                      className={`relative w-11 h-6 rounded-full transition-colors ${airdropMode === 'prorata' ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${airdropMode === 'prorata' ? 'left-5.5' : 'left-0.5'}`} />
                    </button>
                    <span className={`text-sm ${airdropMode === 'prorata' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                      Pro-Rata
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {airdropMode === 'equal' ? 'Montant identique pour tous' : 'Proportionnel au solde'}
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ignoreCreator}
                    onChange={(e) => setIgnoreCreator(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Ignorer le créateur
                  </span>
                </label>

                <Input
                  label="Montant total XEC à distribuer"
                  type="number"
                  step="0.01"
                  value={airdropTotal}
                  onChange={(e) => setAirdropTotal(e.target.value)}
                  placeholder="1000.00"
                  actionButton={{
                    label: 'MAX',
                    onClick: handleSetMaxAirdrop
                  }}
                  helperText={`Disponible: ${xecBalance.toFixed(2)} XEC`}
                />

                <Input
                  label="Solde minimum éligible (optionnel)"
                  type="number"
                  step="0.01"
                  value={minEligible}
                  onChange={(e) => setMinEligible(e.target.value)}
                  placeholder="0.00"
                  helperText="Seuls les détenteurs avec au moins ce montant recevront des XEC"
                />

                <Card>
                  <CardContent className="p-4 bg-muted/50">
                  <p className="text-sm text-gray-600 dark:text-gray-400 m-0">
                    💡 Cette fonctionnalité est en cours de développement
                  </p>
                  </CardContent>
                </Card>

                <Button
                  type="button"
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleCalculateAirdrop}
                >
                  🧮 Calculer (Bientôt)
                </Button>
              </form>
              </CardContent>
            </Card>
          )}

          {/* ACTIONS DE GESTION (Si Créateur) */}
          {isCreator && (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setManagementPanelOpen(!managementPanelOpen)}
              >
                ⚙️ Actions de Gestion {managementPanelOpen ? '▼' : '▶'}
              </Button>

              {managementPanelOpen && (
                <>
                  <Tabs
                    tabs={[
                      { id: 'mint', label: '🏭 Émettre' },
                      { id: 'burn', label: '🔥 Détruire' }
                    ]}
                    activeTab={managementTab}
                    onChange={setManagementTab}
                  />

                  {/* Contenu MINT */}
                  {managementTab === 'mint' && (
                    <Card>
                      <CardContent className="p-6">
                      <form onSubmit={handleMint} className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Créez de nouveaux jetons {ticker} si votre supply est variable
                        </p>
                        
                        <Input
                          label="Quantité à émettre"
                          type="number"
                          step="1"
                          value={mintAmount}
                          onChange={(e) => setMintAmount(e.target.value)}
                          placeholder="1000"
                          disabled={!isCreator || processing}
                        />

                        <Card>
                          <CardContent className="p-4 bg-muted/50">
                          <p className="text-sm text-gray-600 dark:text-gray-400 m-0">
                            💡 Frais de réseau estimés : ~5 XEC
                          </p>
                          </CardContent>
                        </Card>

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={!isCreator || processing || !mintAmount}
                        >
                          {!isCreator ? '🔒 Offre Fixe' : processing ? '⏳ Émission...' : "✔️ Confirmer l'émission"}
                        </Button>
                      </form>
                      </CardContent>
                    </Card>
                  )}

                  {/* Contenu BURN */}
                  {managementTab === 'burn' && (
                    <Card>
                      <CardContent className="p-6">
                      <form onSubmit={handleBurn} className="space-y-4">
                        <Card className="border-yellow-200 dark:border-yellow-800">
                          <CardContent className="p-4 bg-yellow-50 dark:bg-yellow-950/30">
                          <p className="text-sm font-medium m-0">
                            ⚠️ Action irréversible : les jetons détruits ne peuvent pas être récupérés
                          </p>
                          </CardContent>
                        </Card>
                        
                        <Input
                          label="Quantité à détruire"
                          type="number"
                          step="0.01"
                          value={burnAmount}
                          onChange={(e) => setBurnAmount(e.target.value)}
                          placeholder="100"
                          disabled={processing}
                          actionButton={{
                            label: 'MAX',
                            onClick: handleSetMaxBurn
                          }}
                          helperText={`Solde: ${formatAmount(myBalance, decimals)} ${ticker}`}
                          className="border-red-500 dark:border-red-400"
                        />

                        <Card className="border-red-200 dark:border-red-800">
                          <CardContent className="p-4 bg-red-50 dark:bg-red-950/30">
                          <p className="text-sm text-red-600 dark:text-red-400 m-0">
                            💡 Frais de réseau estimés : ~5 XEC
                          </p>
                          </CardContent>
                        </Card>

                        <Button
                          type="submit"
                          className="w-full bg-red-600 hover:bg-red-700 text-white"
                          disabled={processing || !burnAmount}
                        >
                          {processing ? '⏳ Destruction...' : '🔥 Détruire Définitivement'}
                        </Button>
                      </form>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </>
          )}

          {/* STATISTIQUES */}
          <Card>
            <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Statistiques
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4 bg-muted/50">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">
                  En Circulation
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  N/A
                </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 bg-muted/50">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">
                  Genèse
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatAmount(genesisInfo.mintAmount || '0', decimals)}
                </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 bg-muted/50">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">
                  Mon Solde
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatAmount(myBalance, decimals)}
                </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 bg-muted/50">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">
                  Date Création
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatDate(tokenInfo.timeFirstSeen)}
                </div>
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardContent className="p-4 bg-muted/50">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">
                  Détenteurs
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  N/A
                </div>
                </CardContent>
              </Card>
            </div>
            </CardContent>
          </Card>

          {/* TECHNIQUE (Token ID) */}
          <Card>
            <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              Informations Techniques
            </h3>
            
            <Card>
              <CardContent className="p-4 bg-muted/50">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">
                Token ID
              </div>
              <div className="font-mono text-xs break-all text-gray-900 dark:text-white mb-3 leading-relaxed">
                {tokenId}
              </div>
              <Button
                className="w-full"
                onClick={handleCopyTokenId}
              >
                📋 Copier Token ID
              </Button>
              </CardContent>
            </Card>
            </CardContent>
          </Card>

          {/* Bouton Retour */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/manage-token')}
          >
            ← Retour à la liste
          </Button>

          {/* Footer */}
          <BlockchainStatus />

        </Stack>
      </PageLayout>

      {/* QR Scanner Modal */}
      <Modal isOpen={showQrScanner} onClose={() => setShowQrScanner(false)}>
        <Modal.Header>Scanner un QR Code</Modal.Header>
        <Modal.Body>
          <QrCodeScanner onScan={handleQrScan} />
        </Modal.Body>
      </Modal>
    </MobileLayout>
  );
};

export default TokenDetailsPage;
