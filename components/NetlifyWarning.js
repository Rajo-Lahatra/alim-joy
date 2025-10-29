'use client'
import { useState, useEffect } from 'react'

export default function NetlifyWarning() {
  const [isNetlify, setIsNetlify] = useState(false)
  
  useEffect(() => {
    setIsNetlify(window.location.hostname.includes('netlify.app'))
  }, [])

  if (!isNetlify) return null

  return (
    <div style={{
      background: '#ff6b6b',
      color: 'white',
      padding: '10px',
      textAlign: 'center',
      fontSize: '14px'
    }}>
      ⚠️ Mode Netlify - Si vous voyez des erreurs, vérifiez la console (F12)
    </div>
  )
}