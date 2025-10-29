const fs = require('fs')
const path = require('path')

console.log('🔧 Vérification de la configuration de build...')

// Vérifier les variables d'environnement
const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']
const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.warn('⚠️ Variables d\'environnement manquantes:', missingVars)
} else {
  console.log('✅ Variables d\'environnement OK')
}

// Vérifier la structure des dossiers
const requiredDirs = ['app', 'components', 'lib']
const missingDirs = requiredDirs.filter(dir => !fs.existsSync(dir))

if (missingDirs.length > 0) {
  console.error('❌ Dossiers manquants:', missingDirs)
  process.exit(1)
} else {
  console.log('✅ Structure des dossiers OK')
}

console.log('✅ Configuration de build vérifiée')