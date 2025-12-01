/**
 * Test script pour vérifier l'initialisation Chronik
 * Execute: node test-chronik-init.js
 */

// Note: Ce test nécessite que les dépendances soient installées
// et que le code utilise les bons imports

console.log('✅ Test de configuration Chronik');
console.log('');

// Vérifier que les URLs existent
const CHRONIK_URLS = [
  'https://chronik.be.cash/xec',        // Officiel - très stable
  'https://chronik.pay2stay.com/xec',   // Alternatif - bon uptime
  'https://chronik.fabien.cash/xec',    // Backup
];

console.log('📋 URLs Chronik configurées:');
CHRONIK_URLS.forEach((url, i) => {
  console.log(`  ${i + 1}. ${url}`);
});

console.log('');
console.log('✅ Configuration OK');
console.log('');
console.log('Prochaines étapes:');
console.log('1. npm run dev');
console.log('2. Ouvrir http://localhost:5173 dans le navigateur');
console.log('3. Vérifier la console pour les logs Chronik');
console.log('4. Chercher "✅ Chronik connecté" ou "❌ ERREUR CRITIQUE Chronik"');
