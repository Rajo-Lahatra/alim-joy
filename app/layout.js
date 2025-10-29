import './globals.css'

export const metadata = {
  title: 'Suivi Alimentaire - Joy Nathanaël',
  description: 'Application de suivi alimentaire pour Joy Nathanaël',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}