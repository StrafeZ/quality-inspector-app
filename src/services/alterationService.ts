import { supabase } from '@/lib/supabase'

export interface AlterationTemplate {
  id: string
  alteration_type: string
  alteration_category: string
  description_template: string | null
  severity_default: 'minor' | 'major' | 'critical'
  created_at: string
}

export interface Alteration {
  id: string
  inspection_report_id: string
  job_card_id: string
  stitcher_id?: string | null
  stitcher_name?: string | null
  alteration_type: string
  alteration_category: string
  severity: 'minor' | 'major' | 'critical'
  description: string
  location: string | null
  is_corrected: boolean
  corrected_at?: string | null
  corrected_by?: string | null
  created_at: string
}

const alterationService = {
  /**
   * Fetch all alteration templates grouped by category
   * @returns Promise<AlterationTemplate[]>
   */
  async getAlterationTemplates(): Promise<AlterationTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('alteration_templates')
        .select('*')
        .order('alteration_category', { ascending: true })
        .order('alteration_type', { ascending: true })

      if (error) {
        console.error('Error fetching alteration templates:', error.message)
        return []
      }

      return (data as AlterationTemplate[]) || []
    } catch (error) {
      console.error('Unexpected error fetching alteration templates:', error)
      return []
    }
  },

  /**
   * Create a new alteration
   * @param alteration - Alteration data
   * @returns Promise with new alteration ID or null
   */
  async createAlteration(
    alteration: Omit<Alteration, 'id' | 'created_at' | 'is_corrected'>
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('alterations')
        .insert({
          ...alteration,
          is_corrected: false,
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error creating alteration:', error.message)
        return null
      }

      return data?.id || null
    } catch (error) {
      console.error('Unexpected error creating alteration:', error)
      return null
    }
  },
}

export default alterationService
