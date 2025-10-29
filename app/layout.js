import './globals.css'

export const metadata = {
  title: 'Suivi Alimentaire - Joy Nathanaël',
  description: 'Application de suivi alimentaire pour Joy Nathanaël',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                console.error('Erreur globale:', e.error);
                // Vous pouvez aussi envoyer ces erreurs à un service de logging
              });
              
              window.addEventListener('unhandledrejection', function(e) {
                console.error('Promise rejetée:', e.reason);
              });
              
              console.log('Application chargée - version: ${Date.now()}');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}