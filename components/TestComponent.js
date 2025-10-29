'use client'
import { useState, useEffect } from 'react'

export default function TestComponent() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div>Chargement du test...</div>
  }

  return (
    <div className="card" style={{ border: '2px solid red', backgroundColor: '#fff0f0' }}>
      <h2>🧪 Test Component - Si vous voyez ceci, React fonctionne</h2>
      <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
        <button className="btn" style={{ backgroundColor: 'blue', color: 'white' }}>
          Bouton Test 1
        </button>
        <button className="btn btn-success">
          Bouton Test 2
        </button>
        <button className="btn btn-danger">
          Bouton Test 3
        </button>
      </div>
      <p>Date actuelle: {new Date().toLocaleString('fr-FR')}</p>
    </div>
  )
}