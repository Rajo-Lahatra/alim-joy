'use client'
import { useEffect } from 'react'

export default function Debug() {
  useEffect(() => {
    console.log('=== DEBUG COMPONENT ===')
    console.log('Window defined:', typeof window !== 'undefined')
    console.log('Document defined:', typeof document !== 'undefined')
    console.log('User Agent:', navigator.userAgent)
  }, [])

  return (
    <div style={{
      background: '#ff6b6b',
      color: 'white',
      padding: '10px',
      marginBottom: '1rem',
      borderRadius: '5px'
    }}>
      <strong>Mode Debug</strong> - Vérifiez la console (F12)
    </div>
  )
}