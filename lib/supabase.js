import { createClient } from '@supabase/supabase-js'

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client Supabase conditionnel
let supabaseClient = null

if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseClient

// API pour la gestion des semaines
export const foodTrackerAPI = {
  // Sauvegarder toute une semaine
  async saveWeek(weekData, weekStart) {
    if (!supabaseClient) {
      console.warn('Supabase non disponible')
      return false
    }

    try {
      // Préparer les données pour l'upsert
      const records = Object.entries(weekData).map(([dayName, dayData]) => ({
        week_start: weekStart,
        day_name: dayName,
        day_order: getDayOrder(dayName),
        morning: dayData.morning || '',
        vegetable: dayData.vegetable || '',
        protein: dayData.protein || '',
        fruit_lunch: dayData.fruit_lunch || '',
        snack: dayData.snack || '',
        evening: dayData.evening || '',
        remarks: dayData.remarks || '',
        updated_at: new Date().toISOString()
      }))

      const { error } = await supabaseClient
        .from('food_tracker')
        .upsert(records, { onConflict: 'week_start,day_name' })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur sauvegarde semaine:', error)
      return false
    }
  },

  // Charger une semaine
  async loadWeek(weekStart) {
    if (!supabaseClient) {
      console.warn('Supabase non disponible')
      return null
    }

    try {
      const { data, error } = await supabaseClient
        .from('food_tracker')
        .select('*')
        .eq('week_start', weekStart)
        .order('day_order', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        const weekData = {}
        data.forEach(day => {
          weekData[day.day_name] = {
            morning: day.morning,
            vegetable: day.vegetable,
            protein: day.protein,
            fruit_lunch: day.fruit_lunch,
            snack: day.snack,
            evening: day.evening,
            remarks: day.remarks
          }
        })
        return weekData
      }
      return null
    } catch (error) {
      console.error('Erreur chargement semaine:', error)
      return null
    }
  },

  // Réinitialiser une semaine (supprimer)
  async resetWeek(weekStart) {
    if (!supabaseClient) {
      console.warn('Supabase non disponible')
      return false
    }

    try {
      const { error } = await supabaseClient
        .from('food_tracker')
        .delete()
        .eq('week_start', weekStart)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erreur réinitialisation semaine:', error)
      return false
    }
  },

  // Obtenir l'historique des semaines
  async getWeeksHistory() {
    if (!supabaseClient) {
      console.warn('Supabase non disponible')
      return []
    }

    try {
      const { data, error } = await supabaseClient
        .from('food_tracker')
        .select('week_start')
        .order('week_start', { ascending: false })

      if (error) throw error
      return [...new Set(data.map(item => item.week_start))]
    } catch (error) {
      console.error('Erreur historique:', error)
      return []
    }
  }
}

// Fonction utilitaire pour l'ordre des jours
function getDayOrder(dayName) {
  const days = {
    'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4,
    'Vendredi': 5, 'Samedi': 6, 'Dimanche': 7
  }
  return days[dayName] || 0
}