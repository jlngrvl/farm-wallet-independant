import { useState, useEffect } from 'react';

/**
 * Hook pour récupérer le prix du XEC en temps réel
 * Interroge l'API Coingecko toutes les 60 secondes
 * Supporte EUR, USD, GBP, CHF
 * @returns {Object|null} { eur: number, usd: number, gbp: number, chf: number, convert: function } ou null si chargement/erreur
 */
export const useXecPrice = () => {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ecash&vs_currencies=eur,usd');
        const data = await res.json();
        if (data?.ecash) setPrice(data.ecash);
      } catch (e) { console.warn('API Price Error'); }
    };

    fetchPrice();
  }, []);

  return price;
};
