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
  "Laitage bébé (yaourt, petit suisse) + biscuit + fruits",
  "Laitage bébé seul",
  "Biscuit + fruits",
  "Compote de fruits maison"
]

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
  const [isClient, setIsClient] = useState(false)
  const [supabaseStatus, setSupabaseStatus] = useState('idle')
  const [weekExistsInSupabase, setWeekExistsInSupabase] = useState(false)

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
      checkWeekExists(currentWeek)
    }
  }, [currentWeek, isClient])

  // Fonction pour créer des données vides
  const createEmptyWeekData = () => {
    const emptyData = {}
    daysOfWeek.forEach(day => {
      emptyData[day.name] = {
        morning: '',
        vegetable: '',
        protein: '',
        fruit_lunch: '',
        snack: '',
        evening: '',
        remarks: ''
      }
    })
    return emptyData
  }

  // Vérifier si la semaine existe dans Supabase
  const checkWeekExists = async (week) => {
    try {
      const exists = await foodTrackerAPI.weekExists(week)
      setWeekExistsInSupabase(exists)
      return exists
    } catch (error) {
      console.error('Erreur vérification semaine:', error)
      setWeekExistsInSupabase(false)
      return false
    }
  }

  // Charger la semaine - sans message d'erreur si pas de données
  const loadWeekData = async () => {
    if (!isClient) return
    
    setLoading(true)
    try {
      const data = await foodTrackerAPI.loadWeek(currentWeek)
      
      if (data) {
        // Données trouvées dans Supabase
        setWeekData(data)
        saveToLocalStorage(data)
        setWeekExistsInSupabase(true)
      } else {
        // Aucune donnée - créer une semaine vide (planification)
        const emptyData = createEmptyWeekData()
        setWeekData(emptyData)
        saveToLocalStorage(emptyData)
        setWeekExistsInSupabase(false)
      }
    } catch (error) {
      console.error('Erreur chargement:', error)
      // En cas d'erreur, charger depuis le localStorage
      loadFromLocalStorage(currentWeek)
      setWeekExistsInSupabase(false)
    }
    setLoading(false)
  }

  const loadFromLocalStorage = (week) => {
    try {
      const saved = localStorage.getItem(`foodTracker-${week}`)
      if (saved) {
        setWeekData(JSON.parse(saved))
      } else {
        // Créer des données vides
        const emptyData = createEmptyWeekData()
        setWeekData(emptyData)
      }
    } catch (error) {
      console.log('Aucune donnée sauvegardée en local')
      const emptyData = createEmptyWeekData()
      setWeekData(emptyData)
    }
  }

  const saveToLocalStorage = (data) => {
    try {
      localStorage.setItem(`foodTracker-${currentWeek}`, JSON.stringify(data))
    } catch (error) {
      console.error('Erreur sauvegarde localStorage:', error)
    }
  }

  const handleInputChange = (dayName, field, value) => {
    const newData = {
      ...weekData,
      [dayName]: {
        ...weekData[dayName],
        [field]: value
      }
    }
    setWeekData(newData)
    saveToLocalStorage(newData)
  }

  const getDayData = (dayName, field) => {
    return weekData[dayName]?.[field] || ''
  }

  // Navigation entre les semaines
  const navigateWeek = (direction) => {
    const currentDate = new Date(currentWeek)
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction * 7))
    const newWeek = getMonday(newDate)
    setCurrentWeek(newWeek)
  }

  const goToCurrentWeek = () => {
    const today = new Date()
    const week = getMonday(today)
    setCurrentWeek(week)
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

  // Fonction pour sauvegarder la semaine
  const saveWeekToSupabase = async () => {
    setSupabaseStatus('loading')
    try {
      const success = await foodTrackerAPI.saveWeek(weekData, currentWeek)
      if (success) {
        setSupabaseStatus('success')
        setWeekExistsInSupabase(true)
        setTimeout(() => setSupabaseStatus('idle'), 3000)
      } else {
        setSupabaseStatus('error')
      }
    } catch (error) {
      console.error('Erreur sauvegarde Supabase:', error)
      setSupabaseStatus('error')
    }
  }

  // Fonction pour réinitialiser la semaine
  const resetWeekInSupabase = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser cette semaine ? Cette action supprimera définitivement les données sur Supabase.')) {
      return
    }

    setSupabaseStatus('loading')
    try {
      const success = await foodTrackerAPI.resetWeek(currentWeek)
      if (success) {
        // Réinitialiser les données locales
        const emptyData = createEmptyWeekData()
        setWeekData(emptyData)
        saveToLocalStorage(emptyData)
        setWeekExistsInSupabase(false)
        setSupabaseStatus('success')
        setTimeout(() => setSupabaseStatus('idle'), 3000)
      } else {
        setSupabaseStatus('error')
      }
    } catch (error) {
      console.error('Erreur réinitialisation Supabase:', error)
      setSupabaseStatus('error')
    }
  }

  // Fonction SIMPLE pour générer le PDF - Impression de toute la page
  const generatePDF = () => {
    window.print()
  }

  // Fonction pour créer une nouvelle semaine
  const createNewWeek = () => {
    const nextWeek = new Date(currentWeek)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const newWeek = getMonday(nextWeek)
    setCurrentWeek(newWeek)
  }

  if (!isClient) {
    return (
      <div className="card">
        <div className="loading">Chargement de l'application...</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card">
        <div className="loading">Chargement des données...</div>
      </div>
    )
  }

  return (
    <div className="card">
      {/* En-tête avec navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem', 
        flexWrap: 'wrap', 
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="btn" 
            onClick={() => navigateWeek(-1)}
            title="Semaine précédente"
            style={{ padding: '0.5rem 1rem' }}
          >
            ← Précédente
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0, color: '#333' }}>{getWeekDisplay(currentWeek)}</h2>
            <div style={{ fontSize: '0.9rem', color: weekExistsInSupabase ? '#28a745' : '#6c757d' }}>
              {weekExistsInSupabase ? '✅ Sauvegardée sur Supabase' : '📝 Semaine en planification'}
            </div>
          </div>
          
          <button 
            className="btn" 
            onClick={() => navigateWeek(1)}
            title="Semaine suivante"
            style={{ padding: '0.5rem 1rem' }}
          >
            Suivante →
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className="btn" 
            onClick={goToCurrentWeek}
            style={{ backgroundColor: '#6c757d', color: 'white', padding: '0.5rem 1rem' }}
          >
            Cette semaine
          </button>
          
          <button 
            className="btn btn-success" 
            onClick={generatePDF}
            style={{ backgroundColor: '#28a745', color: 'white', padding: '0.5rem 1rem' }}
          >
            📄 Imprimer/PDF
          </button>
          
          <button 
            className="btn" 
            onClick={createNewWeek}
            title="Créer une nouvelle semaine"
            style={{ backgroundColor: '#007bff', color: 'white', padding: '0.5rem 1rem' }}
          >
            + Nouvelle semaine
          </button>
        </div>
      </div>

      {/* Section Supabase - Sauvegarde/Réinitialisation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '1rem', 
        marginBottom: '1rem',
        flexWrap: 'wrap',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <button 
          className="btn btn-success" 
          onClick={saveWeekToSupabase}
          disabled={supabaseStatus === 'loading'}
          style={{ 
            backgroundColor: supabaseStatus === 'success' ? '#28a745' : 
                           supabaseStatus === 'error' ? '#dc3545' : '#28a745',
            opacity: supabaseStatus === 'loading' ? 0.6 : 1
          }}
        >
          {supabaseStatus === 'loading' ? '⏳ Sauvegarde...' : 
           supabaseStatus === 'success' ? '✅ Sauvegardé!' :
           supabaseStatus === 'error' ? '❌ Erreur' : '💾 Sauvegarder sur Supabase'}
        </button>

        {weekExistsInSupabase && (
          <button 
            className="btn btn-danger" 
            onClick={resetWeekInSupabase}
            disabled={supabaseStatus === 'loading'}
            style={{ opacity: supabaseStatus === 'loading' ? 0.6 : 1 }}
          >
            {supabaseStatus === 'loading' ? '⏳ Réinitialisation...' : '🗑️ Supprimer de Supabase'}
          </button>
        )}
      </div>

      {/* Indicateur de statut */}
      {supabaseStatus === 'error' && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '0.75rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          textAlign: 'center',
          border: '1px solid #f5c6cb'
        }}>
          ❌ Erreur de connexion à Supabase. Vérifiez votre connexion internet.
        </div>
      )}

      {/* Tableau COMPLET avec toutes les colonnes */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px', backgroundColor: '#4a90e2', color: 'white', textAlign: 'left' }}>Jour</th>
              <th style={{ padding: '12px', backgroundColor: '#4a90e2', color: 'white', textAlign: 'left' }}>Matin</th>
              <th style={{ padding: '12px', backgroundColor: '#4a90e2', color: 'white', textAlign: 'left' }}>Midi</th>
              <th style={{ padding: '12px', backgroundColor: '#4a90e2', color: 'white', textAlign: 'left' }}>Goûter (16h)</th>
              <th style={{ padding: '12px', backgroundColor: '#4a90e2', color: 'white', textAlign: 'left' }}>Soir</th>
              <th style={{ padding: '12px', backgroundColor: '#4a90e2', color: 'white', textAlign: 'left' }}>Remarques</th>
            </tr>
          </thead>
          <tbody>
            {daysOfWeek.map(day => (
              <tr key={day.name} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{day.name}</td>
                
                {/* Matin */}
                <td style={{ padding: '12px' }}>
                  <select 
                    value={getDayData(day.name, 'morning')}
                    onChange={(e) => handleInputChange(day.name, 'morning', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">-- Sélectionner --</option>
                    {morningOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </td>
                
                {/* Midi */}
                <td style={{ padding: '12px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <select 
                      value={getDayData(day.name, 'vegetable')}
                      onChange={(e) => handleInputChange(day.name, 'vegetable', e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value="">-- Légume --</option>
                      {vegetables.map(veg => (
                        <option key={veg} value={veg}>{veg}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <select 
                      value={getDayData(day.name, 'protein')}
                      onChange={(e) => handleInputChange(day.name, 'protein', e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
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
                      onChange={(e) => handleInputChange(day.name, 'fruit_lunch', e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value="">-- Fruit --</option>
                      {fruits.map(fruit => (
                        <option key={fruit} value={fruit}>{fruit}</option>
                      ))}
                    </select>
                  </div>
                </td>
                
                {/* Goûter */}
                <td style={{ padding: '12px' }}>
                  <select 
                    value={getDayData(day.name, 'snack')}
                    onChange={(e) => handleInputChange(day.name, 'snack', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">-- Sélectionner --</option>
                    {snackOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </td>
                
                {/* Soir */}
                <td style={{ padding: '12px' }}>
                  <select 
                    value={getDayData(day.name, 'evening')}
                    onChange={(e) => handleInputChange(day.name, 'evening', e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">-- Sélectionner --</option>
                    {eveningOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </td>
                
                {/* Remarques */}
                <td style={{ padding: '12px' }}>
                  <textarea 
                    value={getDayData(day.name, 'remarks')}
                    onChange={(e) => handleInputChange(day.name, 'remarks', e.target.value)}
                    placeholder="Notes, refus, préférences..."
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
{/* Consignes */}
      <div style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        backgroundColor: '#e8f4fd', 
        borderRadius: '5px', 
        fontSize: '0.9rem',
        borderLeft: '4px solid #4a90e2'
      }}>
        <h4 style={{ marginBottom: '0.5rem', color: '#2c6fb7' }}>Informations importantes :</h4>
        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
          <li><strong>Allaitement</strong> : 5-6 tétées par jour à la demande, terminer par la tétée si elle complète un repas solide</li>
          <li><strong>Légumes</strong> : Cuits sans sel, avec 1 c.à.c d'huile végétale (colza, noix, olive) ou beurre</li>
          <li><strong>Viandes/poissons</strong> : 10g (2 c.à.c), éviter abats et charcuterie (sauf jambon cuit découenné)</li>
          <li><strong>Fruits</strong> : Bien mûrs, crus ou cuits, sans sucre ajouté</li>
        </ul>
      </div>

      {/* Informations importantes */}
      <div style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        backgroundColor: '#e8f4fd', 
        borderRadius: '5px', 
        fontSize: '0.9rem',
        borderLeft: '4px solid #4a90e2'
      }}>
        <h4 style={{ marginBottom: '0.5rem', color: '#2c6fb7' }}>Mode Planification 🗓️</h4>
        <p style={{ marginBottom: '0.5rem' }}>
          <strong>Vous pouvez maintenant planifier les semaines à venir !</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
          <li>Utilisez les flèches pour naviguer entre les semaines</li>
          <li>Planifiez les repas des semaines futures</li>
          <li>Sauvegardez sur Supabase pour ne pas perdre vos planning</li>
          <li>Le bouton "Supprimer" n'apparaît que pour les semaines sauvegardées</li>
        </ul>
      </div>
    </div>
  )
}