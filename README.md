# 🌾 Farm Wallet

> **Version 2.0** - Refactored & Modernized

A beautiful, user-friendly wallet for **eCash (XEC)** and farm tokens, built with React 19, Vite, and **shadcn/ui**.

## ✨ Features

- 🪙 **Multi-token support** - XEC + farm tokens
- 🎨 **Modern UI** - Built with shadcn/ui + Tailwind CSS
- 🌓 **Dark mode** - Automatic theme switching
- 🌍 **Multi-language** - French & English support
- 📱 **Mobile-first** - Responsive design optimized for mobile
- 📷 **QR codes** - Scan & generate QR codes for payments
- ⚡ **Real-time updates** - WebSocket integration with Chronik
- 🔐 **Secure** - Non-custodial, keys stored locally
- 🚀 **Fast** - Built with Vite for instant HMR

## 🏗️ Architecture

**Version 2.0** features a complete refactoring:
- ✅ **shadcn/ui** - Modern, accessible components
- ✅ **Tailwind CSS** - Utility-first styling (93% less CSS)
- ✅ **Jotai** - Atomic state management
- ✅ **Clear structure** - Separated concerns and clean imports

📚 **[See full documentation](./docs/INDEX.md)**

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

### Other Configuration Options

You can add other environment variables to customize the wallet:

```bash
# Optional: Custom API endpoints
VITE_API_BASE_URL=https://your-api.com

# Optional: Network configuration  
VITE_NETWORK=mainnet
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
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