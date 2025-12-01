import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { walletConnectedAtom } from '../atoms';
import { useEcashWallet } from '../hooks/useEcashWallet';
import { useAdmin } from '../hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';
import DisconnectedView from './Layout/DisconnectedView';

/**
 * AdminGateRoute - Route qui vérifie si l'utilisateur a les permissions d'accès
 * Permissions:
 *   1. Super admin (hash de l'adresse correspond)
 *   2. Créateur de jeton (possède au minimum 1 mint baton)
 * 
 * Comportement:
 * - Si pas connecté → DisconnectedView
 * - Si connecté MAIS sans permission → Redirige vers fallbackRoute
 * - Si connecté ET avec permission → Affiche children
 */
const AdminGateRoute = ({ children, fallbackRoute = '/create-token' }) => {
  const navigate = useNavigate();
  const [walletConnected] = useAtom(walletConnectedAtom);
  const { wallet } = useEcashWallet();
  const isAdmin = useAdmin();
  
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (!walletConnected || !wallet) {
          setLoading(false);
          return;
        }

        // Super admin a toujours accès
        if (isAdmin) {
          console.log('👑 Super admin détecté → Accès autorisé');
          setHasAccess(true);
          setLoading(false);
          return;
        }

        // Vérifier mint batons
        const batons = await wallet.getMintBatons();
        console.log('🔑 Mint batons vérifiés:', batons);
        
        const hasAny = Array.isArray(batons) && batons.length > 0;
        setHasAccess(hasAny);

        // Si pas d'accès, rediriger
        if (!hasAny) {
          console.log('ℹ️ Utilisateur sans permission → Redirection vers', fallbackRoute);
          navigate(fallbackRoute, { replace: true });
        }
      } catch (err) {
        console.warn('⚠️ Erreur vérification accès:', err);
        setError(err.message);
        // En cas d'erreur réseau, permettre l'accès quand même (blockchain down)
        setHasAccess(true);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [walletConnected, wallet, isAdmin, navigate, fallbackRoute]);

  // Pas connecté
  if (!walletConnected) {
    return <DisconnectedView />;
  }

  // Chargement
  if (loading) {
    return <LoadingScreen />;
  }

  // Erreur de blockchain mais permission d'accès
  if (error && hasAccess) {
    console.warn('⚠️ Blockchain inaccessible mais accès permis');
    return children;
  }

  // Pas d'accès - la redirection est déjà faite dans useEffect
  if (!hasAccess) {
    return <LoadingScreen />;
  }

  // Tout est bon
  return children;
};

export default AdminGateRoute;
