#!/bin/bash

# 🧼 Priorité #2 - Suppression Logs Debug + Nettoyage Docs

echo "🧼 Priorité #2 : Suppression des logs debug et nettoyage..."
echo ""

# Supprimer les fichiers obsolètes
echo "🗑️  Suppression fichiers obsolètes..."
rm -f PRIORITY_1_COMPLETED.md
rm -f INTERVENTION_REPORT.md  
rm -f PRIORITY_1_CHECKLIST.md
echo "✅ Fichiers obsolètes supprimés"
echo ""

# Vérifier les changements
echo "📊 Statut git:"
git status --short
echo ""

# Commit
echo "💾 Création du commit..."
git add .
git commit -m "chore: remove debug logs and clean obsolete docs (Priority #2)

- Removed console.log debug statements in WalletDashboard.jsx
- Removed console.log debug in SettingsPage.jsx  
- Converted console.warn to console.error for errors
- Deleted obsolete docs (PRIORITY_1_*.md, INTERVENTION_REPORT.md)
- Updated NEXT_ACTIONS.md for Priority #3 (Dashboard v2)

Refs: PRIORITIES.md Phase 1"

if [ $? -eq 0 ]; then
  echo "✅ Commit réussi!"
  echo ""
  echo "📤 Push vers GitHub..."
  git push origin main
  
  if [ $? -eq 0 ]; then
    echo "✅ Push réussi!"
    echo ""
    echo "🎉 Priorité #2 TERMINÉE!"
    echo ""
    echo "📋 Prochaine étape : Dashboard v2 (voir NEXT_ACTIONS.md)"
  else
    echo "⚠️  Push échoué (vérifier permissions)"
    echo "💡 Réessayer avec: git push origin main"
  fi
else
  echo "❌ Commit échoué"
fi
