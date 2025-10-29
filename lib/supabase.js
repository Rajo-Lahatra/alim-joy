import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Fonctions pour la table food_tracker
export const foodTrackerAPI = {
  // Récupérer les données d'une semaine spécifique
  async getWeekData(weekStart) {
    const { data, error } = await supabase
      .from('food_tracker')
      .select('*')
      .eq('week_start', weekStart)
      .order('day_order', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Sauvegarder ou mettre à jour les données d'un jour
  async saveDayData(dayData) {
    const { data, error } = await supabase
      .from('food_tracker')
      .upsert(dayData, { onConflict: 'week_start,day_name' })
    
    if (error) throw error
    return data
  },

  // Récupérer l'historique des semaines
  async getWeeksHistory() {
    const { data, error } = await supabase
      .from('food_tracker')
      .select('week_start')
      .order('week_start', { ascending: false })
    
    if (error) throw error
    return [...new Set(data.map(item => item.week_start))]
  }
}