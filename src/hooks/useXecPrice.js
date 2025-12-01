import { useState, useEffect } from 'react';

/**
 * Hook pour récupérer le prix du XEC en temps réel
 * Interroge l'API Coingecko toutes les 60 secondes
 * Supporte EUR, USD, GBP, CHF
 * @returns {Object|null} Objet avec prix et méthode convert, ou null si chargement/erreur
 */
export const useXecPrice = () => {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ecash&vs_currencies=eur,usd,gbp,chf');
        const data = await res.json();
        if (data?.ecash) {
          const prices = data.ecash;
          
          // Créer un objet avec les prix ET une méthode convert
          const priceObj = {
            eur: prices.eur || 0,
            usd: prices.usd || 0,
            gbp: prices.gbp || 0,
            chf: prices.chf || 0,
            
            // Méthode pour convertir une quantité de XEC en devise
            convert: (xecAmount, currency) => {
              if (!xecAmount) return 0;
              const currencyCode = (currency || 'EUR').toLowerCase();
              const rate = priceObj[currencyCode];
              
              if (!rate) {
                console.warn(`⚠️ Prix non disponible pour ${currency}`);
                return 0;
              }
              
              return Number(xecAmount) * rate;
            }
          };
          
          setPrice(priceObj);
        }
      } catch (e) { 
        console.warn('⚠️ Erreur chargement prix XEC:', e);
      }
    };

    fetchPrice();
    
    // Recharger le prix toutes les 60 secondes
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  return price;
};
