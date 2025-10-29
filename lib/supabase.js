import { createClient } from '@supabase/supabase-js'

// Variables d'environnement avec fallback pour Netlify
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Client Supabase conditionnel
let supabaseClient = null

if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
} else if (typeof window !== 'undefined') {
  console.warn('Variables Supabase manquantes')
}

export const supabase = supabaseClient

// API avec gestion d'erreurs améliorée
export const foodTrackerAPI = {
  async getWeekData(weekStart) {
    if (!supabaseClient) {
      console.warn('Supabase non disponible')
      return []
    }

    try {
      const { data, error } = await supabaseClient
        .from('food_tracker')
        .select('*')
        .eq('week_start', weekStart)
        .order('day_order', { ascending: true })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur Supabase:', error)
      return []
    }
  },

  async saveDayData(dayData) {
    if (!supabaseClient) {
      console.warn('Supabase non disponible')
      return null
    }

    try {
      const { data, error } = await supabaseClient
        .from('food_tracker')
        .upsert(dayData, { onConflict: 'week_start,day_name' })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur Supabase:', error)
      return null
    }
  },

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
      return [...new Set((data || []).map(item => item.week_start))]
    } catch (error) {
      console.error('Erreur Supabase:', error)
      return []
    }
  }
}