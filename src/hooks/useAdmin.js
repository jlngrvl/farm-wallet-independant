import { useState, useEffect } from 'react';
import { useEcashWallet } from './useEcashWallet';

/**
 * SHA256 Hash du super admin ecash address
 * Format: SHA256(address) en hexadécimal
 * À configurer avec le vrai hash de l'adresse du super admin
 * Exemple: "0x123abc..." (adresse hachée en SHA-256)
 */
const ADMIN_ADDRESS_HASH = process.env.REACT_APP_ADMIN_HASH || null;

/**
 * Hash SHA-256 d'une chaîne (async)
 */
async function sha256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * useAdmin - Vérifier si l'utilisateur connecté est super admin
 * @returns {boolean} true si l'utilisateur est super admin
 */
export function useAdmin() {
  const { address } = useEcashWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    if (!address || !ADMIN_ADDRESS_HASH) {
      setIsAdmin(false);
      return;
    }

    const checkAdmin = async () => {
      try {
        // Hacher l'adresse de l'utilisateur
        const userAddressHash = await sha256(address);
        
        // Comparer avec le hash du super admin
        const isAdminUser = userAddressHash.toLowerCase() === ADMIN_ADDRESS_HASH.toLowerCase();
        
        console.log('🔐 Vérification admin:', {
          address,
          userHash: userAddressHash.substring(0, 10) + '...',
          adminHash: ADMIN_ADDRESS_HASH.substring(0, 10) + '...',
          isAdmin: isAdminUser
        });
        
        setIsAdmin(isAdminUser);
      } catch (e) {
        console.error('❌ Erreur vérification admin:', e);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [address]);
  
  return isAdmin;
}
