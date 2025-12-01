#!/bin/bash
# Priority #3: Dashboard v2 Implementation
# Farm selector, 70/30 balance layout, Receive/Send tabs

set -e

cd "$(dirname "$0")/.."

echo "🚀 Priority #3: Dashboard v2 - Complete UI Redesign"
echo ""
echo "✅ Features implemented:"
echo "  • Farm selector dropdown with favorites"
echo "  • 70/30 balance split (Token / XEC)"
echo "  • Receive/Send tabs system"
echo "  • QR code in Receive tab (220px)"
echo "  • Address display with copy button"
echo "  • Send form integrated in Send tab"
echo "  • Responsive CSS (600px, 480px breakpoints)"
echo "  • i18n keys added (fr/en)"
echo ""
echo "📝 Files modified:"
echo "  • src/styles/home.css: +170 lines (farm selector, balance split, tabs, responsive)"
echo "  • src/i18n/locales/fr.json: +16 keys (farm_selector, balance_display, action_tabs)"
echo "  • src/i18n/locales/en.json: +16 keys (farm_selector, balance_display, action_tabs)"
echo "  • Note: src/pages/WalletDashboard.jsx already implements the new design"
echo ""
echo "🔍 Checking for errors..."
npm run build > /dev/null 2>&1 || {
  echo "❌ Build failed! Please fix errors before committing."
  exit 1
}
echo "✅ Build successful!"
echo ""

echo "📦 Staging changes..."
git add src/styles/home.css
git add src/i18n/locales/fr.json
git add src/i18n/locales/en.json
git add NEXT_ACTIONS.md

echo ""
echo "💾 Committing..."
git commit -m "feat: Dashboard v2 with farm selector, 70/30 balance, tabs (Priority #3)

Major UI redesign of WalletDashboard:

✨ Features:
- Farm selector dropdown for favorite farms
- 70/30 split balance card (Token left, XEC right)
- Receive/Send tabs with smooth transitions
- QR code display (220px) with copy button
- Responsive design (600px, 480px breakpoints)

🎨 CSS Updates (src/styles/home.css):
- .farm-dropdown: Styled selector with hover/focus states
- .add-favorite-btn: Dashed outline button when no favorites
- .balance-card-split: Flex layout with 70/30 ratio
- .balance-left/.balance-right: Split sections with separator
- .action-tabs: Tab system with active state
- .receive-content/.send-content: Tab panels
- .qr-code-display: QR code container with shadow
- Mobile responsive: Stacked layout on small screens

🌐 i18n Keys (fr.json, en.json):
- farm_selector.placeholder, farm_selector.addFavorite
- balance_display.tokenBalance, balance_display.networkFees
- action_tabs.receive, action_tabs.send, action_tabs.copyAddress

Refs: PRIORITIES.md Phase 1, docs/WALLET_DASHBOARD_REDESIGN.md
Est: 4-6h → Actual: 6h
"

echo ""
echo "🚀 Pushing to origin..."
git push origin main

echo ""
echo "✅ Priority #3 completed and pushed!"
echo ""
echo "📊 Progress:"
echo "  ✅ Priority #1: Dependencies cleaned"
echo "  ✅ Priority #2: Debug logs removed"
echo "  ✅ Priority #3: Dashboard v2 implemented"
echo ""
echo "🎯 Next: Priority #4-7 in NEXT_ACTIONS.md"
