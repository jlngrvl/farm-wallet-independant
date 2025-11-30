import { useState, useEffect } from 'react';
import { useEcashWallet } from './useEcashWallet';

// Remplace par le hash réel plus tard, pour l'instant on met un placeholder
const ADMIN_HASH = 'TON_HASH_ICI'; 

export function useAdmin() {
  const { address } = useEcashWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    if (!address) { setIsAdmin(false); return; }
    // Logique simple pour éviter le crash si crypto.subtle n'est pas dispo (ex: http localhost)
    try {
       // Simulation pour le moment, à remplacer par le vrai hash
       setIsAdmin(false); 
    } catch (e) { setIsAdmin(false); }
  }, [address]);
  
  return isAdmin;
}
