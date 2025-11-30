import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import MobileLayout from '../components/Layout/MobileLayout';
import TokenSend from '../components/TokenSend';
import { useTranslation } from '../hooks/useTranslation';
import { selectedFarmAtom, favoriteFarmsAtom, walletAtom, currentTokenIdAtom } from '../atoms';
import { useFarms } from '../hooks/useFarms';
import { useEcashToken } from '../hooks/useEcashWallet';
import '../styles/send.css';

const SendPage = () => {
  const { t } = useTranslation();
  const [selectedFarm] = useAtom(selectedFarmAtom);
  const [favoriteFarmIds] = useAtom(favoriteFarmsAtom);
  const [wallet] = useAtom(walletAtom);
  const [, setCurrentTokenId] = useAtom(currentTokenIdAtom);
  const { farms } = useFarms();
  const [selectedTokenId, setSelectedTokenId] = useState('');
  const [availableTokens, setAvailableTokens] = useState([]);

  // Build list of available tokens
  useEffect(() => {
    const buildTokenList = async () => {
      const tokens = [];
      
      // Add current farm if selected
      if (selectedFarm) {
        tokens.push({
          id: selectedFarm.tokenId,
          name: selectedFarm.name,
          tokenId: selectedFarm.tokenId,
          type: 'current'
        });
      }
      
      // Add favorite farms
      const favoriteFarms = farms.filter(farm => favoriteFarmIds.includes(farm.id));
      for (const farm of favoriteFarms) {
        if (!tokens.find(t => t.tokenId === farm.tokenId)) {
          tokens.push({
            id: farm.tokenId,
            name: farm.name,
            tokenId: farm.tokenId,
            type: 'favorite'
          });
        }
      }
      
      // TODO: Add tokens with balance > 0 (requires wallet token scan)
      // This would need a new wallet method to list all tokens
      
      setAvailableTokens(tokens);
      
      // Set default selection to current farm or first available
      if (tokens.length > 0) {
        const defaultToken = selectedFarm?.tokenId || tokens[0].tokenId;
        setSelectedTokenId(defaultToken);
        setCurrentTokenId(defaultToken);
      }
    };
    
    buildTokenList();
  }, [selectedFarm, favoriteFarmIds, farms, wallet, setCurrentTokenId]);

  const handleTokenChange = (e) => {
    const newTokenId = e.target.value;
    setSelectedTokenId(newTokenId);
    setCurrentTokenId(newTokenId);
  };

  return (
    <MobileLayout title={t('navigation.send')}>
      <div className="send-page-content">
        {/* Token Selector */}
        {availableTokens.length > 0 && (
          <div className="token-selector-section">
            <label htmlFor="token-select" className="token-selector-label">
              {t('send.selectToken') || 'Select token to send'}:
            </label>
            <select
              id="token-select"
              value={selectedTokenId}
              onChange={handleTokenChange}
              className="token-selector"
            >
              {availableTokens.map((token) => (
                <option key={token.tokenId} value={token.tokenId}>
                  {token.name} {token.type === 'current' && `(${t('send.current')})`}
                  {token.ticker && ` - ${token.ticker}`}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <TokenSend />
      </div>
    </MobileLayout>
  );
};

export default SendPage;
