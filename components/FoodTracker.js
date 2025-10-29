'use client'
import { useState, useEffect } from 'react'
import { foodTrackerAPI } from '../lib/supabase'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const daysOfWeek = [
  { name: "Lundi", order: 1 },
  { name: "Mardi", order: 2 },
  { name: "Mercredi", order: 3 },
  { name: "Jeudi", order: 4 },
  { name: "Vendredi", order: 5 },
  { name: "Samedi", order: 6 },
  { name: "Dimanche", order: 7 }
]

// Options pour le matin
const morningOptions = [
  "210ml eau + 7 mesures lait 2ème âge",
  "210ml eau + 7 mesures lait 2ème âge + 1-2 c.à.s céréales"
]

// Options pour le repas de midi
const vegetables = [
  "Carottes", "Haricots verts", "Épinards", "Courgettes", 
  "Blanc de poireaux", "Potirons", "Betteraves rouges", 
  "Brocolis", "Tomates", "Bettes (limité)", "Endives (jeunes, limité)", 
  "Petits pois (extra-fins, limité)"
]

const proteins = [
  "10g viande rouge", "10g viande blanche", "10g jambon cuit découenné",
  "10g poisson maigre", "10g poisson gras", "10g œuf cuit dur (jaune seulement)"
]

const fruits = [
  "Pomme", "Poire", "Banane", "Pêche", "Abricot", 
  "Compote maison (sans sucre)", "Petit pot de fruits"
]

// Options pour le goûter (16h)
const snackOptions = [
  "Laitage bébé (yaourt, petit suisse) + biscuit + fruits",
  "Laitage bébé seul",
  "Biscuit + fruits",
  "Compote de fruits maison"
]

// Options pour le repas du soir
const eveningOptions = [
  "Biberon de 210ml eau + 7 mesures lait 2ème âge + 1-2 c.à.s céréales",
  "Biberon de soupe avec 5 mesures de lait 2ème âge",
  "Purée de légumes + fromage râpé + biberon 120-150ml lait",
  "Petit pot légumes + biberon lait"
]

export default function FoodTracker() {
  const [currentWeek, setCurrentWeek] = useState('')
  const [weekData, setWeekData] = useState({})
  const [loading, setLoading] = useState(false)
  const [weeksHistory, setWeeksHistory] = useState([])
  const [generatingPDF, setGeneratingPDF] = useState(false)

  // Fonction pour obtenir le lundi d'une semaine
  const getMonday = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff)).toISOString().split('T')[0]
  }

  // Initialiser la semaine courante
  useEffect(() => {
    const today = new Date()
    const weekString = getMonday(today)
    setCurrentWeek(weekString)
  }, [])

  // Charger les données de la semaine
  useEffect(() => {
    if (currentWeek) {
      loadWeekData()
      loadWeeksHistory()
    }
  }, [currentWeek])

  const loadWeekData = async () => {
    setLoading(true)
    try {
      const data = await foodTrackerAPI.getWeekData(currentWeek)
      const dataMap = {}
      data.forEach(item => {
        dataMap[item.day_name] = item
      })
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
    try {
      const history = await foodTrackerAPI.getWeeksHistory()
      setWeeksHistory(history)
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error)
    }
  }

  const saveDayData = async (dayName, field, value) => {
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
    const date = new Date(weekString)
    const endDate = new Date(date)
    endDate.setDate(date.getDate() + 6)
    return `Semaine du ${date.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`
  }

  // Fonction pour générer le PDF avec jsPDF et html2canvas
  const generatePDF = async () => {
    setGeneratingPDF(true)
    try {
      // Créer un élément temporaire pour la capture
      const element = document.createElement('div')
      element.style.position = 'absolute'
      element.style.left = '-9999px'
      element.style.top = '0'
      element.style.width = '1000px' // Plus large pour accommoder les nouvelles colonnes
      element.style.backgroundColor = 'white'
      element.style.padding = '20px'
      
      // Cloner et styliser le tableau pour le PDF
      const originalTable = document.getElementById('food-tracker-table')
      const tableClone = originalTable.cloneNode(true)
      
      // Appliquer des styles pour le PDF
      tableClone.style.width = '100%'
      tableClone.style.fontSize = '10px' // Plus petit pour accommoder plus de colonnes
      tableClone.style.borderCollapse = 'collapse'
      
      // Styliser les cellules
      const cells = tableClone.querySelectorAll('th, td')
      cells.forEach(cell => {
        cell.style.border = '1px solid #ddd'
        cell.style.padding = '6px'
        cell.style.textAlign = 'left'
      })
      
      // Styliser les en-têtes
      const headers = tableClone.querySelectorAll('th')
      headers.forEach(header => {
        header.style.backgroundColor = '#4a90e2'
        header.style.color = 'white'
        header.style.fontWeight = 'bold'
      })
      
      // Créer le contenu HTML pour le PDF
      element.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #333; margin-bottom: 10px; font-size: 20px;">Suivi Alimentaire de Joy Nathanaël</h1>
          <h2 style="color: #666; margin-bottom: 5px; font-size: 16px;">${getWeekDisplay(currentWeek)}</h2>
          <p style="color: #999; font-size: 12px;">Basé sur les recommandations du Dr AIDIBE KADRA Sarah</p>
        </div>
        ${tableClone.outerHTML}
        <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
          <p>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
      `
      
      document.body.appendChild(element)
      
      // Capturer l'élément avec html2canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Meilleure qualité
        useCORS: true,
        logging: false
      })
      
      const imgData = canvas.toDataURL('image/png')
      
      // Créer le PDF en orientation paysage pour accommoder plus de colonnes
      const pdf = new jsPDF('l', 'mm', 'a4')
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`suivi-alimentaire-${currentWeek}.pdf`)
      
      // Nettoyer l'élément temporaire
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

  if (loading) {
    return <div className="loading">Chargement...</div>
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
          
          <h2 style={{ margin: 0 }}>{getWeekDisplay(currentWeek)}</h2>
          
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
          >
            Cette semaine
          </button>
          
          <button 
            className="btn btn-success" 
            onClick={generatePDF}
            disabled={generatingPDF}
          >
            {generatingPDF ? '⏳ Génération...' : '📄 Télécharger PDF'}
          </button>
          
          <button 
            className="btn" 
            onClick={createNewWeek}
            title="Créer une nouvelle semaine"
          >
            + Nouvelle semaine
          </button>
        </div>
      </div>

      {/* Sélecteur de semaine rapide */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="week-select">Aller à une semaine spécifique : </label>
        <select 
          id="week-select"
          value={currentWeek} 
          onChange={(e) => setCurrentWeek(e.target.value)}
          style={{ marginLeft: '0.5rem' }}
        >
          {weeksHistory.map(week => (
            <option key={week} value={week}>
              {getWeekDisplay(week)}
            </option>
          ))}
          <option value={currentWeek}>{getWeekDisplay(currentWeek)} (actuelle)</option>
        </select>
      </div>

      <table id="food-tracker-table">
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