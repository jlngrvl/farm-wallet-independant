import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetAtom, useAtom } from 'jotai';
import MobileLayout from '../components/Layout/MobileLayout';
import BlockchainStatus from '../components/BlockchainStatus';
import { useEcashWallet } from '../hooks/useEcashWallet';
import { useAdmin } from '../hooks/useAdmin';
import { useFarms } from '../hooks/useFarms';
import { useXecPrice } from '../hooks/useXecPrice';
import { notificationAtom, currencyAtom } from '../atoms';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import supprimé : UI ne contient pas ces composants

const ManageTokenPage = () => {
  const navigate = useNavigate();
  const { wallet } = useEcashWallet();
  const { farms } = useFarms();
  const isAdmin = useAdmin();
  const price = useXecPrice();
  const [currency] = useAtom(currencyAtom);
  const setNotification = useSetAtom(notificationAtom);

  const [tokens, setTokens] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [xecBalance, setXecBalance] = useState(0);
  const [showInactive, setShowInactive] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);

  // Load mint batons with enriched metadata
  useEffect(() => {
    const loadData = async () => {
      if (!wallet) {
        setLoadingTokens(false);
        return;
      }

      try {
        setLoadingTokens(true);
        
        // Charger le solde XEC
        const xecBalanceData = await wallet.getBalance();
        setXecBalance(xecBalanceData.balance || 0);
        
        const batons = await wallet.getMintBatons();
        console.log('🔑 Mint Batons chargés:', batons);
        
        // Enrichir chaque baton avec les métadonnées blockchain et annuaire
        const enriched = await Promise.all(batons.map(async (b) => {
          // 1. Info Blockchain
          let info = { genesisInfo: { tokenName: 'Inconnu', tokenTicker: '???' } };
          try { 
            info = await wallet.getTokenInfo(b.tokenId);
            console.log(`📊 Token info pour ${b.tokenId}:`, info);
          } catch(e) {
            console.warn(`⚠️ Impossible de récupérer info pour ${b.tokenId}:`, e);
          }
          
          // 2. Info Annuaire (Image, Website)
          const farmInfo = farms.find(f => f.tokenId === b.tokenId);
          console.log(`🗂️ Farm info pour ${b.tokenId}:`, farmInfo);
          
          // 3. Solde du token
          let balance = '0';
          try {
            const balanceData = await wallet.getTokenBalance(b.tokenId);
            balance = balanceData.balance || '0';
          } catch (e) {
            console.warn(`⚠️ Impossible de récupérer le solde pour ${b.tokenId}:`, e);
          }
          
          // Déterminer si le token est actif (supply > 0)
          const genesisSupply = info.genesisInfo?.genesisSupply || 0n;
          const isActive = typeof genesisSupply === 'bigint' ? genesisSupply > 0n : BigInt(genesisSupply) > 0n;
          
          return {
            ...b, // utxo, tokenId, isMintBaton
            name: farmInfo?.name || info.genesisInfo?.tokenName || "Jeton Non Référencé",
            ticker: info.genesisInfo?.tokenTicker || "UNK",
            decimals: info.genesisInfo?.decimals || 0,
            image: farmInfo?.image || "https://placehold.co/400x400?text=Token",
            protocol: farmInfo?.protocol || "ALP",
            website: farmInfo?.website || info.genesisInfo?.url,
            isFixed: false, // Si on a le baton, c'est variable
            balance: balance,
            isListed: !!farmInfo, // Vérifie si présent dans l'annuaire
            isActive: isActive // Actif si supply > 0
          };
        }));
        
        console.log('✅ Jetons enrichis:', enriched);
        setTokens(enriched);
      } catch (err) {
        console.error('❌ Erreur chargement données jetons:', err);
        setNotification({ 
          type: 'error', 
          message: 'Impossible de charger les jetons' 
        });
      } finally {
        setLoadingTokens(false);
      }
    };

    loadData();
  }, [wallet, farms, setNotification]);

  // Copier l'ID du jeton dans le presse-papier
  const handleCopyTokenId = (tokenId, e) => {
    e.stopPropagation(); // Empêcher la navigation
    navigator.clipboard.writeText(tokenId).then(
      () => {
        setNotification({ 
          type: 'success', 
          message: 'ID du jeton copié !' 
        });
      },
      (err) => {
        console.error('❌ Échec de la copie:', err);
        setNotification({ 
          type: 'error', 
          message: 'Échec de la copie' 
        });
      }
    );
  };

  // Formater le solde avec décimales
  const formatBalance = (balance, decimals = 0) => {
    if (!balance || balance === '0') return '0';
    try {
      const balanceNum = typeof balance === 'string' ? BigInt(balance) : BigInt(balance.toString());
      const divisor = BigInt(Math.pow(10, decimals));
      const wholePart = balanceNum / divisor;
      const remainder = balanceNum % divisor;
      
      if (remainder === 0n) {
        return wholePart.toString();
      }
      
      const decimalPart = remainder.toString().padStart(decimals, '0');
      return `${wholePart}.${decimalPart}`.replace(/\.?0+$/, '');
    } catch (err) {
      console.warn('⚠️ Erreur formatage balance:', err);
      return balance.toString();
    }
  };

  // Naviguer vers la page de détails du jeton
  const handleViewToken = (token) => {
    navigate(`/manage-token/${token.tokenId}`);
  };

  // Créer une carte exemple pour les admins (mode debug)
  const renderAdminDebugCard = () => (
    <Card className="opacity-70 border-dashed relative">
      <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
        SIMULATION
      </div>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-4">
          <img 
            src="https://placehold.co/64x64?text=TEST" 
            alt="Test"
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">Exemple Admin</div>
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">DEMO</div>
          </div>
        </div>
        <div className="px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold uppercase">
          DEBUG
        </div>
      </div>
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-600 dark:text-gray-400">Token ID</div>
        <div className="text-sm font-semibold font-mono text-gray-900 dark:text-white">
          abc123...xyz789
        </div>
      </div>
    </Card>
  );

  return (
    <MobileLayout title="Gestionnaire de Jetons">
      <PageLayout hasBottomNav className="max-w-2xl">
        <Stack spacing="md">
        <PageHeader 
          icon="🔑"
          title="Gestionnaire de Jetons"
          subtitle="Gérez vos jetons à offre variable"
          action={
            <Button
              onClick={() => navigate('/create-token')}
              variant="primary"
              icon="➕"
              fullWidth
            >
              Créer un nouveau jeton
            </Button>
          }
        />

        {/* Balance Card (WalletDashboard style) */}
        <Card>
          <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">💰 eCash disponible</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {xecBalance.toFixed(2)} XEC
              </div>
            </div>
            
            <div className="w-px h-16 bg-gray-200 dark:bg-gray-700 mx-4"></div>
            
            <div 
              className="flex-1 text-right cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg p-2"
              onClick={() => navigate('/settings')}
            >
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">💱 Valeur estimée</div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {price?.convert(xecBalance, currency) || '...'}
              </div>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* État de chargement */}
        {loadingTokens ? (
          <Card>
            <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-600 dark:text-gray-400">
              Recherche des jetons en cours...
            </p>
            </CardContent>
          </Card>
        ) : tokens.length === 0 ? (
          /* Aucun jeton trouvé */
          <>
            <Card>
              <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4 opacity-30">🔑</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Aucun jeton géré
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Créez un jeton avec offre <strong>variable</strong> pour pouvoir le gérer ici.
              </p>
              </CardContent>
            </Card>

            {/* Carte de simulation pour les admins */}
            {isAdmin && (
              <>
                <Card variant="highlight" padding="small" className="text-center">
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    👑 MODE ADMIN : Carte de débogage
                  </p>
                </Card>
                {renderAdminDebugCard()}
              </>
            )}
          </>
        ) : (
          /* Liste des jetons */
          <>
            {/* Toggle Afficher les inactifs */}
            {tokens.some(t => !t.isActive) && (
              <Card>
                <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Afficher les jetons inactifs
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowInactive(!showInactive)}
                    className={`w-11 h-6 rounded-full relative transition-all ${
                      showInactive ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-md ${
                      showInactive ? 'left-5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
                </CardContent>
              </Card>
            )}
            
            {tokens
              .filter(token => showInactive ? true : token.isActive)
              .sort((a, b) => {
                if (a.isActive && !b.isActive) return -1;
                if (!a.isActive && b.isActive) return 1;
                return 0;
              })
              .map((token) => (
              <Card
                key={token.tokenId}
                onClick={() => handleViewToken(token)}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                {/* Header: Image + Info + Badge */}
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={token.image} 
                    alt={token.name}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-gray-100 dark:border-gray-700"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/64x64?text=Token';
                    }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                        {token.name}
                      </h3>
                      {token.isListed && (
                        <span className="text-xs font-bold px-2 py-0.5 bg-green-500 text-white rounded-full">
                          LISTÉ
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase">
                      {token.ticker}
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                    token.isActive 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {token.isActive ? '✓ ACTIF' : '⚠ INACTIF'}
                  </div>
                </div>

                {/* Balance Section */}
                <Card className="mb-4">
                  <CardContent className="p-4 bg-muted/50">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    💼 Solde en ma possession
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatBalance(token.balance, token.decimals)} {token.ticker}
                  </div>
                  </CardContent>
                </Card>

                {/* Token ID */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Token ID</div>
                    <div className="text-xs font-mono text-gray-900 dark:text-gray-100 truncate">
                      {token.tokenId}
                    </div>
                  </div>
                  <Button
                    onClick={(e) => handleCopyTokenId(token.tokenId, e)}
                    size="sm"
                    variant="outline"
                  >
                    📋 Copier
                  </Button>
                </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {/* FAQ Gestionnaire */}
        {tokens.length > 0 && (
          <Card>
            <CardContent className="p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <span className="text-2xl">❓</span>
              FAQ Gestionnaire
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Tout savoir sur la gestion de vos jetons
            </p>

            <div className="space-y-3">
              {[
                {
                  question: "🏭 C'est quoi Émettre (Mint) ?",
                  answer: "Émettre (ou \"Mint\") permet de créer de nouveaux jetons et d'augmenter l'offre en circulation. Cette action est réservée aux jetons à offre variable (ceux pour lesquels vous possédez le baton de mint). Les nouveaux jetons sont automatiquement ajoutés à votre solde."
                },
                {
                  question: "🔥 C'est quoi Détruire (Burn) ?",
                  answer: "Détruire (ou \"Burn\") permet de supprimer définitivement des jetons de la circulation. Cette action est irréversible. Les jetons brûlés disparaissent de votre solde et réduisent l'offre totale. Si vous brûlez tous les jetons (supply = 0), le jeton devient INACTIF."
                },
                {
                  question: "🎁 C'est quoi Distribuer (Airdrop) ?",
                  answer: "Distribuer permet d'envoyer des XEC (frais réseau) à tous les détenteurs de votre jeton en une seule opération. Vous pouvez choisir le mode Égalitaire (montant identique pour tous) ou Pro-Rata (proportionnel aux soldes). Utile pour récompenser votre communauté ou financer leurs transactions."
                },
                {
                  question: "📊 Génèse vs En circulation ?",
                  answer: "La \"Génèse\" représente la quantité totale de jetons créés depuis l'origine (incluant ceux détruits). L'\"En circulation\" représente la quantité actuellement disponible (Génèse - Jetons brûlés). Pour les jetons à offre fixe, ces deux valeurs sont identiques."
                },
                {
                  question: "⚠️ Pourquoi mon jeton est INACTIF ?",
                  answer: "Un jeton devient INACTIF lorsque son offre en circulation est égale à 0 (tous les jetons ont été détruits). Un jeton inactif ne peut plus être échangé mais peut être réactivé en émettant de nouveaux jetons si vous possédez toujours le baton de mint."
                },
                {
                  question: "🔐 ALP vs SLP ?",
                  answer: "ALP (Augmented Lokad Protocol) et SLP (Simple Ledger Protocol) sont deux standards de jetons sur eCash. ALP est plus récent, plus efficace et offre des fonctionnalités avancées. SLP est le standard historique. Farm Wallet utilise principalement ALP pour ses avantages techniques."
                },
                {
                  question: "📋 Pourquoi \"Non Listé\" ?",
                  answer: "Un jeton \"Non Listé\" n'apparaît pas encore dans l'annuaire public des fermes. Pour le faire référencer, contactez l'équipe Farm Wallet avec les informations de votre ferme (nom, description, image, coordonnées). Le référencement est gratuit."
                },
                {
                  question: "🔄 Offre Variable vs Fixe ?",
                  answer: "Offre Variable : vous pouvez émettre de nouveaux jetons à tout moment (vous possédez le baton de mint). Offre Fixe : la quantité totale est déterminée à la création et ne peut plus être modifiée. Vous pouvez toujours détruire des jetons, mais pas en créer de nouveaux."
                }
              ].map((faq, index) => (
                <Card
                  key={index}
                  onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {faq.question}
                    </span>
                    <span className="text-xl text-gray-600 dark:text-gray-400">
                      {faqOpen === index ? '−' : '+'}
                    </span>
                  </div>
                  {faqOpen === index && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                  </CardContent>
                </Card>
              ))}
            </div>
            </CardContent>
          </Card>
        )}

        {/* Blockchain Status */}
        <div className="mt-2">
          <BlockchainStatus />
        </div>
        </Stack>
      </PageLayout>
    </MobileLayout>
  );
};

export default ManageTokenPage;
