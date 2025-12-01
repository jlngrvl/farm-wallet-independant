# ✅ Checklist - Priorité n°1 : Nettoyage Dépendances

**Date** : 1er décembre 2025  
**Tâche** : Nettoyer les packages extraneous et stabiliser le projet

---

## 📋 Étapes à Suivre

### Étape 1 : Préparation (2 min)

- [ ✅] Lire ce document
- [ ] S'assurer que tous les changements sont commités (git status)
- [ ] Fermer le dev server si actif (Ctrl+C dans le terminal)

---

### Étape 2 : Nettoyage Automatique (5-10 min)

**Option A : Script automatique (recommandé)**

```bash
# Rendre le script exécutable
chmod +x scripts/clean-dependencies.sh

# Exécuter le nettoyage
./scripts/clean-dependencies.sh
```

**Option B : Commandes manuelles**

```bash
# 1. Sauvegarder
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup

# 2. Supprimer
rm -rf node_modules package-lock.json

# 3. Réinstaller
npm install

# 4. Vérifier
npm list --depth=0 | grep extraneous
# Devrait retourner : (rien)
```

**Cocher quand fait** :
- [ ✅] ✅ Script exécuté OU commandes manuelles exécutées
- [ ✅] ✅ Aucun package extraneous

---

### Étape 3 : Vérification Build (2 min)

```bash
# Test du build
npm run build
```

**Attendu** : Build réussi sans erreur

**Cocher** :
- [ ✅] ✅ Build réussi
- [✅ ] ✅ Pas d'erreurs affichées
- [✅ ] ✅ Dossier `dist/` créé

---

### Étape 4 : Vérification Dev Server (2 min)

```bash
# Lancer le dev server
npm run dev
```

**Attendu** : Server démarre sur http://localhost:5173

**Cocher** :
- [ ✅] ✅ Dev server démarre sans erreur
- [✅ ] ✅ Aucun warning lié à Tailwind/PostCSS
- [ ✅] ✅ Application s'affiche correctement dans le navigateur

---

### Étape 5 : Tests de Base (5 min)

**Dans le navigateur (http://localhost:5173)** :

**Pages Publiques** :
- [ ✅] `/` - DirectoryPage s'affiche
- [ ✅] `/faq` - FAQ s'affiche
- [ ✅] `/farmer-info` - Farmer Info s'affiche

**Thème** :
- [ ✅] Toggle Dark/Light mode fonctionne
- [ ✅] Couleurs changent correctement

**i18n** :
- [✅ ] Switch FR/EN fonctionne
- [✅ ] Textes changent de langue

**Responsive** :
- [✅ ] Ouvrir DevTools (F12)
- [ ✅] Mode responsive (Ctrl+Shift+M)
- [ ✅] Tester à 375px (mobile)
- [ ✅] Tester à 768px (tablet)
- [✅ ] Layout s'adapte correctement

---

### Étape 6 : Vérification Packages (2 min)

```bash
# Liste des dépendances propres
npm list --depth=0 2>/dev/null | head -40
```

**Vérifier qu'il N'Y A PAS** :
- ❌ `tailwindcss`
- ❌ `autoprefixer`
- ❌ `@tailwindcss/postcss`
- ❌ `eslint-plugin-storybook`

**Vérifier qu'il Y A** :
- ✅ `react@19.1.0` (ou similaire)
- ✅ `vite@6.x`
- ✅ `jotai@2.x`
- ✅ `chronik-client@2.x`
- ✅ `ecash-lib@4.x`

**Cocher** :
- [ ✅] ✅ Pas de packages Tailwind
- [✅ ] ✅ Toutes les dépendances principales présentes

---

### Étape 7 : Commit (3 min)

```bash
# Vérifier les changements
git status

# Ajouter les changements
git add .

# Commit
git commit -m "chore: clean extraneous dependencies (Priority #1)

- Removed extraneous packages (Tailwind, PostCSS, etc.)
- Reinstalled node_modules cleanly
- Verified build and dev server
- All tests passing

Refs: PRIORITIES.md Phase 1"

# Push (optionnel)
git push origin main
```

**Cocher** :
- [ ] ✅ Changements commités
- [ ] ✅ (Optionnel) Changements pushés

---

## 📊 Résumé

### Avant Nettoyage
- ❌ ~30 packages extraneous
- ❌ Tailwind/PostCSS/Autoprefixer présents
- ⚠️ Confusion possible

### Après Nettoyage
- ✅ 0 packages extraneous
- ✅ Dépendances propres et exactes
- ✅ Build OK
- ✅ Dev server OK
- ✅ Application fonctionnelle

---

## 🎯 Statut Final

**Priorité n°1 : Nettoyage Dépendances**
- [ ] ✅ TERMINÉ

**Prochaine Priorité** : Tests de non-régression (voir PRIORITIES.md)

---

## 🆘 En Cas de Problème

### Build échoue après nettoyage

```bash
# Restaurer
cp package.json.backup package.json
cp package-lock.json.backup package-lock.json
npm install

# Analyser l'erreur
npm run build 2>&1 | tee build-error.log
```

### Dev server ne démarre pas

```bash
# Vérifier les ports
lsof -i :5173

# Tuer le processus si nécessaire
kill -9 <PID>

# Relancer
npm run dev
```

### Application ne s'affiche pas

1. Vider le cache navigateur (Ctrl+Shift+R)
2. Vérifier la console (F12)
3. Vérifier qu'aucune erreur dans le terminal

---

## ✅ Validation Complète

**Toutes les cases cochées ci-dessus ?**

→ **Priorité n°1 TERMINÉE !** 🎉

**Prochaine étape** : Voir `PRIORITIES.md` Section 2 (Tests de non-régression)

---

**Dernière mise à jour** : 1er décembre 2025
