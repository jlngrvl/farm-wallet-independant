# 🌾 Farm Wallet

> **Version Indépendante** - Architecture CSS Custom & Zero UI Framework

A beautiful, lightweight wallet for **eCash (XEC)** and farm tokens, built with React 19, pure CSS, and modern web standards.

[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-purple.svg)](https://vitejs.dev/)
[![CSS Custom](https://img.shields.io/badge/CSS-Custom-green.svg)](./docs/CONFORMITE_CAHIER_DES_CHARGES.md)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 📚 Documentation

**Nouveau sur le projet ?** Commencez ici :
- 📖 **[Quick Start Guide](./QUICK_START.md)** - Démarrage rapide (10 min)
- 📊 **[Project Status](./PROJECT_STATUS.md)** - État du projet complet
- 🎯 **[Priorities](./PRIORITIES.md)** - Tâches urgentes et priorités
- 🗺️ **[Roadmap](./ROADMAP.md)** - Vision et planning long terme
- 📚 **[Documentation Index](./DOCUMENTATION_INDEX.md)** - Navigation complète

**Documentation technique** :
- 🏗️ [Architecture Wallet](./docs/WALLET_ARCHITECTURE.md)
- ✅ [Conformité Cahier des Charges](./docs/CONFORMITE_CAHIER_DES_CHARGES.md)
- 🎨 [Dashboard Redesign](./docs/WALLET_DASHBOARD_REDESIGN.md)

---

## ✨ Features

- 🪙 **Multi-token support** - XEC + farm tokens
- 🎨 **Custom UI Components** - Zero dependencies (no Tailwind, no Shadcn, no Bootstrap)
- 🌓 **Dark mode** - CSS variables-based theme system
- 🌍 **Multi-language** - French & English support (i18next)
- 📱 **Mobile-first** - Responsive design optimized for all devices
- 📷 **QR codes** - Scan & generate QR codes for payments
- ⚡ **Real-time updates** - WebSocket integration with Chronik
- 🔐 **Secure** - Non-custodial, keys stored locally
- 🚀 **Fast** - Built with Vite, minimal CSS overhead

## 🏗️ Architecture

**Architecture moderne sans frameworks UI** :
- ✅ **CSS Custom** - Variables CSS, design system cohérent
- ✅ **Composants Atomiques** - `<Card>`, `<Button>`, `<Stack>`, etc. (src/components/UI.jsx)
- ✅ **Jotai** - State management atomique et performant
- ✅ **React Router** - Navigation déclarative
- ✅ **Mobile First** - Breakpoints: 400px, 600px, 640px, 768px
- ✅ **Performance** - Pas de build PostCSS/Tailwind, CSS pur et rapide

📚 **[Voir la documentation complète](./docs/CONFORMITE_CAHIER_DES_CHARGES.md)**

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/zh/farm-wallet.git
cd farm-wallet
npm install
```

### 2. Configure Your Token
Copy the environment example file and set your token ID:

```bash
cp .env.example .env
```

Edit `.env` and set your token ID:

```bash
VITE_TOKEN_ID=your_token_id_here
```

### 3. Start Development

```bash
npm run dev
```

Your wallet will be available at `http://localhost:5173`

## Environment Configuration

### Setting VITE_TOKEN_ID

The `VITE_TOKEN_ID` is the most important configuration. This determines which token your wallet will handle.

1. **Find your token ID**: This is a long string (usually 64 characters) that uniquely identifies your token on the eCash network
2. **Add it to .env**: Replace `your_token_id_here` with your actual token ID
3. **Restart the dev server**: Environment changes require a restart

Example:

```bash
VITE_TOKEN_ID=4bd147fc5d5ff26249a9299c46b80920c0b81f59a60895a2ca91a5a6fb9d8da1
```

## 🧪 Testing

### E2E Tests (Playwright)

```bash
# Run all tests
npm run test

# Run tests in headed mode
npx playwright test --headed

# Run specific test
npx playwright test tests/sendXEC.spec.js
```

## 🌍 Internationalization

Support multi-langue avec **i18next** :

- **Français** (par défaut)
- **English**

Les traductions sont dans `src/i18n/locales/`

## 🔧 State Management (Jotai)

**Fichier** : `src/atoms.js`

Atoms principaux :
- `walletAtom` - Instance EcashWallet
- `balanceAtom` - Solde XEC spendable
- `tokenAtom` - Informations du jeton actif
- `priceAtom` - Prix XEC en USD
- `themeAtom` - Thème (light/dark)
- `localeAtom` - Langue (fr/en)
- `blockchainStatusAtom` - État Chronik (connected, blockHeight, etc.)

## 📱 Pages Principales

| Route | Page | Description |
|-------|------|-------------|
| `/` | DirectoryPage | Annuaire des fermes (public) |
| `/wallet` | WalletDashboard | Dashboard principal (privé) |
| `/send` | SendPage | Envoi XEC/Tokens (privé) |
| `/settings` | SettingsPage | Paramètres (privé) |
| `/favorites` | FavoritesPage | Fermes favorites (privé) |
| `/farmer-info` | FarmerInfoPage | Info fermier (public) |
| `/faq` | FaqPage | FAQ (public) |

## 🚀 Deployment

```bash
# Build optimisé pour production
npm run build

# Le dossier dist/ contient les fichiers statiques prêts à déployer
```

Déployez sur :
- **Vercel** : `vercel`
- **Netlify** : Drag & drop du dossier `dist/`
- **GitHub Pages** : Configurer GitHub Actions

## 📄 Documentation Complète

- [📋 Conformité Cahier des Charges](./docs/CONFORMITE_CAHIER_DES_CHARGES.md)
- [🏗️ Architecture Wallet](./docs/WALLET_ARCHITECTURE.md)
- [🎨 Dashboard Redesign](./docs/WALLET_DASHBOARD_REDESIGN.md)
- [🔌 Chronik WebSocket](./docs/CHRONIK_WEBSOCKET.md)

## 🐛 Debug

Voir `DEBUG_CONSOLE.md` pour les commandes de débogage dans la console du navigateur.

## 📝 License

MIT License - voir [LICENSE](./LICENSE)

## 🤝 Contributing

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 👤 Author

Développé pour l'écosystème eCash (XEC)

---

**Note** : Le dossier `farm-wallet-main-1/` contient le projet original de référence. Le développement actif se fait dans le dossier racine.
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Run E2E tests (Playwright)
npm run test
```

## 📂 Repository Structure

```
farm-wallet-independant/
├── src/
│   ├── components/         # Reusable UI components (custom, no frameworks)
│   │   ├── UI.jsx         # Atomic components: Card, Button, Stack, etc.
│   │   ├── Layout/        # TopBar, BottomNavigation, MobileLayout
│   │   ├── ECashWallet.jsx
│   │   ├── SendXEC.jsx
│   │   └── TokenSend.jsx
│   ├── pages/             # Main application pages
│   │   ├── WalletDashboard.jsx
│   │   ├── DirectoryPage.jsx
│   │   ├── SendPage.jsx
│   │   └── SettingsPage.jsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useEcashWallet.js
│   │   ├── useBalance.js
│   │   ├── useToken.js
│   │   └── useChronikWebSocket.js
│   ├── services/          # Business logic & blockchain integration
│   │   ├── ecashWallet.js     # EcashWallet class (core wallet logic)
│   │   └── chronikClient.js   # Chronik API client
│   ├── styles/            # CSS files (no Tailwind, pure CSS)
│   │   ├── themes.css         # CSS variables (light/dark themes)
│   │   ├── layout.css         # Layout structures
│   │   ├── components.css     # Reusable component styles
│   │   ├── home.css           # Dashboard styles
│   │   └── send.css           # Send page styles
│   ├── utils/             # Helper functions
│   ├── i18n/              # Internationalization (fr/en)
│   └── data/              # Static data (farms.json)
├── docs/                  # Documentation
│   ├── CONFORMITE_CAHIER_DES_CHARGES.md
│   ├── WALLET_ARCHITECTURE.md
│   └── WALLET_DASHBOARD_REDESIGN.md
├── tests/                 # E2E tests (Playwright)
└── farm-wallet-main-1/    # Original reference project
```

## 🎨 CSS Architecture

### Zero UI Framework Philosophy

Ce projet utilise **uniquement du CSS custom** sans aucun framework UI :

- **Pas de Tailwind CSS**
- **Pas de Shadcn/UI**
- **Pas de Bootstrap**

### Design System

**Fichier central** : `src/styles/themes.css`

Variables CSS pour light/dark mode :
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
- `--text-primary`, `--text-secondary`
- `--accent-primary` (#0074e4 - bleu eCash)
- `--accent-success`, `--accent-danger`
- `--border-primary`, `--card-bg`, `--input-bg`

**Breakpoints responsive** :
- Mobile : `max-width: 600px`
- Très petit : `max-width: 400px`
- Small tablet : `max-width: 640px`
- Tablet : `max-width: 768px`

## 🔐 Blockchain Integration

### Stack eCash

- **chronik-client** (v2.1.1) - Indexer blockchain eCash
- **ecash-lib** (v4.5.2) - Construction et signature de transactions
- **@scure/bip39** - Génération mnémonique
- **@scure/bip32** - Dérivation HD
- **ecashaddrjs** - Encodage adresses eCash

### Wallet Service

Classe principale : `src/services/ecashWallet.js`

```javascript
// Initialize wallet
const wallet = new EcashWallet(mnemonic, hdPath);

// Get balance
const { balance, totalBalance } = await wallet.getBalance();

// Send XEC
const txid = await wallet.sendXec(toAddress, amountXec);

// Get token balance
const tokenBalance = await wallet.getTokenBalance(tokenId);
```
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

## 📂 Project Structure

```
farm-wallet/
├── docs/                  # 📚 Complete documentation
│   ├── INDEX.md          # Documentation index
│   ├── ARCHITECTURE.md   # Project architecture
│   └── ...
├── src/
│   ├── components/
│   │   ├── ui/          # 🎨 shadcn/ui base components
│   │   ├── UI/          # 🏗️ Business components
│   │   └── Layout/      # 📐 Layout components
│   ├── pages/           # 📄 Application pages
│   ├── hooks/           # 🪝 Custom React hooks
│   ├── services/        # 🔌 Blockchain services
│   ├── utils/           # 🛠️ Helper functions
│   ├── i18n/           # 🌍 Translations (FR/EN)
│   └── lib/            # Utilities (cn, etc.)
├── public/             # Static assets
└── dist/              # Built files (npm run build)
```

**📖 [Full architecture documentation →](./docs/ARCHITECTURE.md)**

## Deployment

### Deploy to Vercel
1. Build your project: `npm run build`
2. Install Vercel CLI: `npm i -g vercel`
3. Deploy: `vercel --prod`
4. Set `VITE_TOKEN_ID` environment variable in your Vercel dashboard

### Deploy to Netlify
1. Build your project: `npm run build`
2. Upload the `dist/` folder to Netlify
3. Set environment variables in your Netlify site settings

### Deploy Anywhere
The wallet builds to static files, so you can deploy the `dist/` folder to any web server:

```bash
npm run build
# Upload everything in dist/ to your web server
```

## Customizing the Wallet

### Adding New Languages
1. Add translation files in `src/i18n/locales/`
2. Import them in `src/i18n/index.js`
3. The wallet will automatically detect user language

### Styling
- Global styles: `src/styles/`
- Component styles: Each component has its own CSS file
- The wallet uses modern CSS with CSS custom properties

### Adding Features
1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Use Jotai atoms in `src/atoms.js` for state management

## Troubleshooting

### Common Issues

**Wallet won't start**: Make sure you've set `VITE_TOKEN_ID` in your `.env` file

**Token not loading**: Verify your token ID is correct and the token exists on the eCash network

**Build failing**: Run `npm run lint:fix` to fix common code issues

**Dependencies issues**: Delete `node_modules` and `package-lock.json`, then run `npm install`

## Contributing

This wallet is open source and welcomes contributions!

1. Fork the repository: https://github.com/zh/farm-wallet
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test them
4. Run the linter: `npm run lint:fix`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to your branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 🛠️ Tech Stack

- **Frontend**: React 19.1 + Vite 6
- **UI Framework**: [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS 4
- **State Management**: Jotai (atomic state)
- **Blockchain**: ecash-lib + Chronik WebSocket
- **QR Codes**: qrcode.react
- **i18n**: Custom i18n implementation (FR/EN)
- **Routing**: React Router v7

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [📚 INDEX](./docs/INDEX.md) | Documentation index (start here!) |
| [📐 ARCHITECTURE](./docs/ARCHITECTURE.md) | Complete project architecture |
| [🧹 REFACTORING](./docs/REFACTORING_COMPLET.md) | Refactoring guide v2.0 |
| [🎨 UI Components](./src/components/UI/README.md) | UI components documentation |
| [💡 shadcn/ui](./docs/SHADCN_UI_ARCHITECTURE.md) | shadcn/ui architecture |

## License

This project is open source and available under the [MIT License](LICENSE).