const fs = require('fs');
const path = require('path');

// Déterminer la plateforme
const platform = process.env.VERCEL ? 'vercel' : 'netlify';

console.log(`🔧 Configuration pour: ${platform}`);

// Copier la bonne configuration
const source = `next.config.${platform}.js`;
const target = 'next.config.js';

if (fs.existsSync(source)) {
  fs.copyFileSync(source, target);
  console.log(`✅ Configuration ${platform} appliquée`);
} else {
  console.log(`❌ Fichier ${source} non trouvé`);
}