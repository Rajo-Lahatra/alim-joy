'use client'
import { useState, useEffect } from 'react'
import { foodTrackerAPI } from '../lib/supabase'

// Import conditionnel pour éviter les erreurs côté serveur
let jsPDF, html2canvas
if (typeof window !== 'undefined') {
  import('jspdf').then(module => jsPDF = module.default)
  import('html2canvas').then(module => html2canvas = module.default)
}

const daysOfWeek = [
  { name: "Lundi", order: 1 },
  { name: "Mardi", order: 2 },
  { name: "Mercredi", order: 3 },
  { name: "Jeudi", order: 4 },
  { name: "Vendredi", order: 5 },
  { name: "Samedi", order: 6 },
  { name: "Dimanche", order: 7 }
]

// ... (gardez le reste des options comme avant)

export default function FoodTracker() {
  const [currentWeek, setCurrentWeek] = useState('')
  const [weekData, setWeekData] = useState({})
  const [loading, setLoading] = useState(true)
  const [weeksHistory, setWeeksHistory] = useState([])
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // S'assurer que nous sommes côté client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fonction pour obtenir le lundi d'une semaine
  const getMonday = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff)).toISOString().split('T')[0]
  }

  // Initialiser la semaine courante
  useEffect(() => {
    if (isClient) {
      const today = new Date()
      const weekString = getMonday(today)
      setCurrentWeek(weekString)
    }
  }, [isClient])

  // Charger les données de la semaine
  useEffect(() => {
    if (currentWeek && isClient) {
      loadWeekData()
      loadWeeksHistory()
    }
  }, [currentWeek, isClient])

  const loadWeekData = async () => {
    if (!isClient) return
    
    setLoading(true)
    try {
      const data = await foodTrackerAPI.getWeekData(currentWeek)
      const dataMap = {}
      if (data) {
        data.forEach(item => {
          dataMap[item.day_name] = item
        })
      }
      setWeekData(dataMap)
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      // Créer une structure vide pour la nouvelle semaine
      const emptyData = {}
      daysOfWeek.forEach(day => {
        emptyData[day.name] = {
          week_start: currentWeek,
          day_name: day.name,
          day_order: day.order
        }
      })
      setWeekData(emptyData)
    }
    setLoading(false)
  }

  const loadWeeksHistory = async () => {
    if (!isClient) return
    
    try {
      const history = await foodTrackerAPI.getWeeksHistory()
      setWeeksHistory(history || [])
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error)
      setWeeksHistory([])
    }
  }

  const saveDayData = async (dayName, field, value) => {
    if (!isClient) return
    
    const dayData = weekData[dayName] || {
      week_start: currentWeek,
      day_name: dayName,
      day_order: daysOfWeek.find(d => d.name === dayName).order
    }

    const updatedData = {
      ...dayData,
      [field]: value,
      updated_at: new Date().toISOString()
    }

    try {
      await foodTrackerAPI.saveDayData(updatedData)
      setWeekData(prev => ({
        ...prev,
        [dayName]: updatedData
      }))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const getDayData = (dayName, field) => {
    return weekData[dayName]?.[field] || ''
  }

  // Navigation entre les semaines
  const navigateWeek = (direction) => {
    const currentDate = new Date(currentWeek)
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction * 7))
    setCurrentWeek(getMonday(newDate))
  }

  const goToCurrentWeek = () => {
    const today = new Date()
    setCurrentWeek(getMonday(today))
  }

  // Fonction pour formater l'affichage de la semaine
  const getWeekDisplay = (weekString) => {
    try {
      const date = new Date(weekString)
      const endDate = new Date(date)
      endDate.setDate(date.getDate() + 6)
      return `Semaine du ${date.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`
    } catch (error) {
      return "Semaine en cours"
    }
  }

  // Fonction pour générer le PDF avec jsPDF et html2canvas
  const generatePDF = async () => {
    if (!isClient || !jsPDF || !html2canvas) {
      alert('Fonction PDF non disponible')
      return
    }

    setGeneratingPDF(true)
    try {
      // Import dynamique pour éviter les erreurs de bundle
      const { default: jsPDF } = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')

      // Le reste de votre code PDF ici...
      const element = document.createElement('div')
      element.style.position = 'absolute'
      element.style.left = '-9999px'
      element.style.top = '0'
      element.style.width = '1000px'
      element.style.backgroundColor = 'white'
      element.style.padding = '20px'
      
      // ... (gardez le reste du code PDF comme avant)

      document.body.appendChild(element)
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      })
      
      const imgData = canvas.toDataURL('image/png')
      
      const pdf = new jsPDF('l', 'mm', 'a4')
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`suivi-alimentaire-${currentWeek}.pdf`)
      
      document.body.removeChild(element)
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      alert('Erreur lors de la génération du PDF')
    } finally {
      setGeneratingPDF(false)
    }
  }

  // Fonction pour créer une nouvelle semaine
  const createNewWeek = () => {
    const nextWeek = new Date(currentWeek)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const newWeekString = getMonday(nextWeek)
    setCurrentWeek(newWeekString)
  }

  if (!isClient) {
    return <div className="loading">Chargement de l'application...</div>
  }

  if (loading) {
    return <div className="loading">Chargement des données...</div>
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="btn" 
            onClick={() => navigateWeek(-1)}
            title="Semaine précédente"
          >
            ←
          </button>
          
          <h2 style={{ margin: 0, color: '#333' }}>{getWeekDisplay(currentWeek)}</h2>
          
          <button 
            className="btn" 
            onClick={() => navigateWeek(1)}
            title="Semaine suivante"
          >
            →
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className="btn" 
            onClick={goToCurrentWeek}
            style={{ backgroundColor: '#6c757d', color: 'white' }}
          >
            Cette semaine
          </button>
          
          <button 
            className="btn btn-success" 
            onClick={generatePDF}
            disabled={generatingPDF}
            style={{ backgroundColor: generatingPDF ? '#6c757d' : '#28a745', color: 'white' }}
          >
            {generatingPDF ? '⏳ Génération...' : '📄 Télécharger PDF'}
          </button>
          
          <button 
            className="btn" 
            onClick={createNewWeek}
            title="Créer une nouvelle semaine"
            style={{ backgroundColor: '#007bff', color: 'white' }}
          >
            + Nouvelle semaine
          </button>
        </div>
      </div>

      {/* Sélecteur de semaine rapide */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <label htmlFor="week-select" style={{ fontWeight: 'bold' }}>Aller à une semaine spécifique :</label>
        <select 
          id="week-select"
          value={currentWeek} 
          onChange={(e) => setCurrentWeek(e.target.value)}
          style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          {weeksHistory && weeksHistory.map(week => (
            <option key={week} value={week}>
              {getWeekDisplay(week)}
            </option>
          ))}
          <option value={currentWeek}>{getWeekDisplay(currentWeek)} (actuelle)</option>
        </select>
      </div>

      <table id="food-tracker-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Jour</th>
            <th>Matin</th>
            <th>Midi</th>
            <th>Goûter (16h)</th>
            <th>Soir</th>
            <th>Remarques</th>
          </tr>
        </thead>
        <tbody>
          {daysOfWeek.map(day => (
            <tr key={day.name}>
              <td><strong>{day.name}</strong></td>
              
              {/* Matin */}
              <td>
                <select 
                  value={getDayData(day.name, 'morning')}
                  onChange={(e) => saveDayData(day.name, 'morning', e.target.value)}
                >
                  <option value="">-- Sélectionner --</option>
                  {morningOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </td>
              
              {/* Repas de Midi */}
              <td>
                <div style={{ marginBottom: '5px' }}>
                  <select 
                    value={getDayData(day.name, 'vegetable')}
                    onChange={(e) => saveDayData(day.name, 'vegetable', e.target.value)}
                  >
                    <option value="">-- Légume --</option>
                    {vegetables.map(veg => (
                      <option key={veg} value={veg}>{veg}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '5px' }}>
                  <select 
                    value={getDayData(day.name, 'protein')}
                    onChange={(e) => saveDayData(day.name, 'protein', e.target.value)}
                  >
                    <option value="">-- Viande/Poisson --</option>
                    {proteins.map(protein => (
                      <option key={protein} value={protein}>{protein}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select 
                    value={getDayData(day.name, 'fruit_lunch')}
                    onChange={(e) => saveDayData(day.name, 'fruit_lunch', e.target.value)}
                  >
                    <option value="">-- Fruit --</option>
                    {fruits.map(fruit => (
                      <option key={fruit} value={fruit}>{fruit}</option>
                    ))}
                  </select>
                </div>
              </td>
              
              {/* Goûter (16h) */}
              <td>
                <select 
                  value={getDayData(day.name, 'snack')}
                  onChange={(e) => saveDayData(day.name, 'snack', e.target.value)}
                >
                  <option value="">-- Sélectionner --</option>
                  {snackOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </td>
              
              {/* Soir */}
              <td>
                <select 
                  value={getDayData(day.name, 'evening')}
                  onChange={(e) => saveDayData(day.name, 'evening', e.target.value)}
                >
                  <option value="">-- Sélectionner --</option>
                  {eveningOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </td>
              
              {/* Remarques */}
              <td>
                <textarea 
                  value={getDayData(day.name, 'remarks')}
                  onChange={(e) => saveDayData(day.name, 'remarks', e.target.value)}
                  placeholder="Notes, refus, préférences..."
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Légende et informations importantes */}
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '5px', fontSize: '0.9rem' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>Informations importantes :</h4>
        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
          <li><strong>Allaitement</strong> : 5-6 tétées par jour à la demande, terminer par la tétée si elle complète un repas solide</li>
          <li><strong>Légumes</strong> : Cuits sans sel, avec 1 c.à.c d'huile végétale (colza, noix, olive) ou beurre</li>
          <li><strong>Viandes/poissons</strong> : 10g (2 c.à.c), éviter abats et charcuterie (sauf jambon cuit découenné)</li>
          <li><strong>Fruits</strong> : Bien mûrs, crus ou cuits, sans sucre ajouté</li>
        </ul>
      </div>
    </div>
  )
}