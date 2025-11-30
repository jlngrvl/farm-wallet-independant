import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { localeAtom, savedMnemonicAtom } from './atoms';
import i18n from './i18n';

// Pages
import DirectoryPage from './pages/DirectoryPage';
import WalletDashboard from './pages/WalletDashboard';
import SendPage from './pages/SendPage';
import SettingsPage from './pages/SettingsPage';
import FavoritesPage from './pages/FavoritesPage';
import FarmerInfoPage from './pages/FarmerInfoPage';
import FaqPage from './pages/FaqPage';
import CreateTokenPage from './pages/CreateTokenPage';

// Layout & Components
import ProtectedRoute from './components/ProtectedRoute';
import ThemeProvider from './components/ThemeProvider';
import Notification from './components/Notification';
import LoadingScreen from './components/LoadingScreen';

// Hooks
import { useEcashWallet } from './hooks/useEcashWallet';
import { useChronikWebSocket } from './hooks/useChronikWebSocket';

// i18n
import './i18n';

// Styles
import './App.css';
import './styles/themes.css';
import './styles/layout.css';

function App() {
  const [locale] = useAtom(localeAtom);
  const [savedMnemonic] = useAtom(savedMnemonicAtom);
  const { walletConnected, loading, initializeWallet } = useEcashWallet();
  
  // Initialize Chronik WebSocket for real-time balance updates
  useChronikWebSocket();

  useEffect(() => {
    // Initialize i18n on app load
    import('./i18n').then(() => {
      console.log('i18n initialized');
    });
  }, []);

  // Synchronize locale atom with i18n system
  useEffect(() => {
    if (locale && i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale]);

  // NOTE: Auto-initialization is handled by useEcashWallet hook
  // No need to call initializeWallet here to avoid infinite loop

  // Show loading state while wallet initializes
  if (loading) {
    return (
      <ThemeProvider>
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="app-container bg-red-500">
          <Notification />
          <Routes>
            {/* ========================================
                ROUTES PUBLIQUES (Sans wallet requis)
                ======================================== */}
            
            {/* Annuaire - Point d'entrée public */}
            <Route path="/" element={<DirectoryPage />} />
            
            {/* Espace Producteur - DOIT Être PUBLIC */}
            <Route path="/farmer-info" element={<FarmerInfoPage />} />
            
            {/* FAQ - Page d'aide publique */}
            <Route path="/faq" element={<FaqPage />} />
            
            {/* ========================================
                ROUTES PRIVÉES (Wallet requis)
                ======================================== */}
            
            {/* Dashboard personnel (Wallet, ferme optionnelle) */}
            <Route 
              path="/wallet" 
              element={
                <ProtectedRoute requireFarm={false}>
                  <WalletDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Envoyer des tokens */}
            <Route 
              path="/send" 
              element={
                <ProtectedRoute requireFarm={false}>
                  <SendPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Fermes favorites */}
            <Route 
              path="/favorites" 
              element={
                <ProtectedRoute requireFarm={false}>
                  <FavoritesPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Paramètres */}
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute requireFarm={false}>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Création de jetons */}
            <Route 
              path="/create-token" 
              element={
                <ProtectedRoute requireFarm={false}>
                  <CreateTokenPage />
                </ProtectedRoute>
              } 
            />
            
            {/* ========================================
                REDIRECTIONS & COMPATIBILITÉ
                ======================================== */}
            
            {/* Anciennes routes */}
            <Route path="/home" element={<Navigate to="/wallet" replace />} />
            <Route path="/directory" element={<Navigate to="/" replace />} />
            <Route path="/fund" element={<Navigate to="/settings" replace />} />
            
            {/* Catch-all - Redirection vers annuaire */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;