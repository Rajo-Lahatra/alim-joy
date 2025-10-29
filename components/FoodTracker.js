'use client'
import { useState, useEffect } from 'react'
import { foodTrackerAPI } from '../lib/supabase'

const daysOfWeek = [
  { name: "Lundi", order: 1 },
  { name: "Mardi", order: 2 },
  { name: "Mercredi", order: 3 },
  { name: "Jeudi", order: 4 },
  { name: "Vendredi", order: 5 },
  { name: "Samedi", order: 6 },
  { name: "Dimanche", order: 7 }
]

const morningOptions = [
  "210ml eau + 7 mesures lait 2ème âge",
  "210ml eau + 7 mesures lait 2ème âge + 1-2 c.à.s céréales"
]

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

const snackOptions = [
  "Laitage bébé + biscuit + fruit",
  "Biberon 210ml + 7 mesures lait + céréales",
  "Purée légumes + biberon 120-150ml lait"
]

export default function FoodTracker() {
  const [currentWeek, setCurrentWeek] = useState('')
  const [weekData, setWeekData] = useState({})
  const [loading, setLoading] = useState(false)
  const [weeksHistory, setWeeksHistory] = useState([])

  // Initialiser la semaine courante (lundi de la semaine actuelle)
  useEffect(() => {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))
    const weekString = monday.toISOString().split('T')[0]
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
      alert('Erreur lors du chargement des données')
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

  const handleWeekChange = (newWeek) => {
    setCurrentWeek(newWeek)
  }

  const getWeekDisplay = (weekString) => {
    const date = new Date(weekString)
    const endDate = new Date(date)
    endDate.setDate(date.getDate() + 6)
    return `Semaine du ${date.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  return (
    <div className="card">
      <div className="week-selector">
        <label htmlFor="week-select">Semaine : </label>
        <select 
          id="week-select"
          value={currentWeek} 
          onChange={(e) => handleWeekChange(e.target.value)}
        >
          {weeksHistory.map(week => (
            <option key={week} value={week}>
              {getWeekDisplay(week)}
            </option>
          ))}
          <option value={currentWeek}>{getWeekDisplay(currentWeek)}</option>
        </select>
        <button 
          className="btn btn-success" 
          onClick={() => handleWeekChange(currentWeek)}
        >
          Actualiser
        </button>
      </div>

      <h2>Tableau de Suivi Hebdomadaire</h2>
      <table>
        <thead>
          <tr>
            <th>Jour</th>
            <th>Matin (Biberon)</th>
            <th>Repas de Midi</th>
            <th>Goûter</th>
            <th>Remarques</th>
          </tr>
        </thead>
        <tbody>
          {daysOfWeek.map(day => (
            <tr key={day.name}>
              <td>{day.name}</td>
              
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
              
              {/* Goûter */}
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
    </div>
  )
}