export default function Header() {
  return (
    <header>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '1rem',
        padding: '1rem',
        flexWrap: 'wrap'
      }}>
        {/* Logo */}
        <img 
          src="/logo.png" 
          alt="Logo Suivi Alimentaire" 
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
        
        {/* Titre */}
        <div style={{ textAlign: 'center', minWidth: '300px' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: 'clamp(1.4rem, 4vw, 1.8rem)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            Suivi Alimentaire de Joy Nathanaël RAKOTOSOLOFO
          </h1>
          <p style={{ 
            margin: '0.5rem 0 0 0',
            fontSize: 'clamp(0.9rem, 3vw, 1rem)',
            opacity: 0.9
          }}>
            Basé sur les recommandations du Dr AIDIBE KADRA Sarah
          </p>
        </div>
      </div>
    </header>
  )
}