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
   * Create a new alteration template
   * @param template - Template data without id and created_at
   * @returns Promise with new template ID or null
   */
  async createTemplate(
    template: Omit<AlterationTemplate, 'id' | 'created_at'>
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('alteration_templates')
        .insert(template)
        .select('id')
        .single()

      if (error) {
        console.error('Error creating template:', error.message)
        return null
      }

      return data?.id || null
    } catch (error) {
      console.error('Unexpected error creating template:', error)
      return null
    }
  },

  /**
   * Update an existing alteration template
   * @param id - Template ID
   * @param updates - Fields to update
   * @returns Promise<boolean> - Success status
   */
  async updateTemplate(
    id: string,
    updates: Partial<Omit<AlterationTemplate, 'id' | 'created_at'>>
  ): Promise<boolean> {
    try {
      console.log('updateTemplate called with:', { id, updates })

      const { data, error } = await supabase
        .from('alteration_templates')
        .update(updates)
        .eq('id', id)
        .select()

      console.log('updateTemplate result:', { data, error })

      if (error) {
        console.error('Error updating template:', error.message)
        return false
      }

      return true
    } catch (error) {
      console.error('Unexpected error updating template:', error)
      return false
    }
  },

  /**
   * Delete an alteration template
   * @param id - Template ID
   * @returns Promise<boolean> - Success status
   */
  async deleteTemplate(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('alteration_templates')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting template:', error.message)
        return false
      }

      return true
    } catch (error) {
      console.error('Unexpected error deleting template:', error)
      return false
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
