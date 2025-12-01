#!/bin/bash

# 🧹 Script de Nettoyage des Dépendances
# Farm Wallet - Priorité n°1

echo "🧹 Nettoyage des dépendances extraneous..."
echo ""

# Étape 1 : Afficher les packages extraneous actuels
echo "📊 Packages extraneous actuels :"
npm list --depth=0 2>/dev/null | grep extraneous | wc -l
echo ""

# Étape 2 : Sauvegarder package.json et package-lock.json
echo "💾 Sauvegarde des fichiers..."
cp package.json package.json.backup
if [ -f package-lock.json ]; then
  cp package-lock.json package-lock.json.backup
  echo "✅ package-lock.json sauvegardé"
fi
echo "✅ package.json sauvegardé"
echo ""

# Étape 3 : Supprimer node_modules et package-lock.json
echo "🗑️  Suppression de node_modules et package-lock.json..."
rm -rf node_modules
rm -f package-lock.json
echo "✅ Supprimé"
echo ""

# Étape 4 : Réinstallation propre
echo "📦 Installation des dépendances..."
npm install
echo ""

# Étape 5 : Vérification
echo "✅ Vérification des packages extraneous :"
EXTRANEOUS_COUNT=$(npm list --depth=0 2>/dev/null | grep extraneous | wc -l)
echo "Nombre de packages extraneous : $EXTRANEOUS_COUNT"
echo ""

if [ "$EXTRANEOUS_COUNT" -eq 0 ]; then
  echo "🎉 SUCCESS ! Aucun package extraneous."
  echo ""
  echo "🧪 Test du build..."
  npm run build
  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build réussi !"
    echo ""
    echo "📝 Prochaines étapes :"
    echo "  1. ✅ Dépendances nettoyées"
    echo "  2. ⏳ Tests de non-régression (voir PRIORITIES.md)"
    echo "  3. ⏳ Supprimer logs debug"
    echo ""
    echo "🚀 Vous pouvez lancer : npm run dev"
  else
    echo ""
    echo "❌ Build échoué. Vérifier les erreurs ci-dessus."
  fi
else
  echo "⚠️  Il reste $EXTRANEOUS_COUNT packages extraneous."
  echo "Liste :"
  npm list --depth=0 2>/dev/null | grep extraneous
fi

echo ""
echo "💡 Pour restaurer en cas de problème :"
echo "   cp package.json.backup package.json"
echo "   cp package-lock.json.backup package-lock.json"
echo "   npm install"
