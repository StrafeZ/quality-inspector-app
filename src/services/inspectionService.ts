import { supabase } from '@/lib/supabase'

export interface InspectionReport {
  id: string
  job_card_id: string
  inspector_id: string
  inspector_name: string
  inspection_date: string
  inspection_number: string
  overall_status: 'pass' | 'pass_with_notes' | 'minor_alterations' | 'major_alterations' | 'reject'
  general_notes: string | null
  inspector_comments: string | null
  email_sent: boolean
  customer: string
  style: string
  color: string
  size: string
  serial_no: string
  created_at: string
}

export interface Alteration {
  id: string
  inspection_report_id: string
  job_card_id: string
  stitcher_id: string
  stitcher_name: string
  alteration_type: string
  alteration_category: string
  severity: 'minor' | 'major' | 'critical'
  description: string
  location: string | null
  is_corrected: boolean
  created_at: string
}

const inspectionService = {
  /**
   * Check if inspection report exists for a style/color combination
   * @param style - Style name
   * @param color - Color name
   * @returns Promise<InspectionReport | null> - First matching inspection or null
   */
  async getInspectionByStyle(
    style: string,
    color: string
  ): Promise<InspectionReport | null> {
    try {
      const { data, error } = await supabase
        .from('inspection_reports')
        .select('*')
        .eq('style', style)
        .eq('color', color)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error(
          `Error fetching inspection for style ${style}, color ${color}:`,
          error.message
        )
        return null
      }

      return data as InspectionReport
    } catch (error) {
      console.error(
        `Unexpected error fetching inspection for style ${style}, color ${color}:`,
        error
      )
      return null
    }
  },

  /**
   * Fetch single inspection report with alterations
   * @param inspectionId - Inspection report ID
   * @returns Promise with inspection and alterations array
   */
  async getInspectionById(
    inspectionId: string
  ): Promise<{ inspection: InspectionReport; alterations: Alteration[] } | null> {
    try {
      // Fetch inspection report
      const { data: inspection, error: inspectionError } = await supabase
        .from('inspection_reports')
        .select('*')
        .eq('id', inspectionId)
        .single()

      if (inspectionError) {
        console.error(
          `Error fetching inspection ${inspectionId}:`,
          inspectionError.message
        )
        return null
      }

      // Fetch alterations for this inspection
      const { data: alterations, error: alterationsError } = await supabase
        .from('alterations')
        .select('*')
        .eq('inspection_report_id', inspectionId)
        .order('created_at', { ascending: false })

      if (alterationsError) {
        console.error(
          `Error fetching alterations for inspection ${inspectionId}:`,
          alterationsError.message
        )
      }

      return {
        inspection: inspection as InspectionReport,
        alterations: (alterations as Alteration[]) || [],
      }
    } catch (error) {
      console.error(
        `Unexpected error fetching inspection ${inspectionId}:`,
        error
      )
      return null
    }
  },

  /**
   * Get all inspection reports for a style/color combination
   * @param style - Style name
   * @param color - Color name
   * @returns Promise<InspectionReport[]> - Array of inspections
   */
  async getInspectionsByStyle(
    style: string,
    color: string
  ): Promise<InspectionReport[]> {
    try {
      const { data, error } = await supabase
        .from('inspection_reports')
        .select('*')
        .eq('style', style)
        .eq('color', color)
        .order('created_at', { ascending: false })

      if (error) {
        console.error(
          `Error fetching inspections for style ${style}, color ${color}:`,
          error.message
        )
        return []
      }

      return (data as InspectionReport[]) || []
    } catch (error) {
      console.error(
        `Unexpected error fetching inspections for style ${style}, color ${color}:`,
        error
      )
      return []
    }
  },

  /**
   * Fetch all alterations for a specific job card
   * @param jobCardId - Job card ID
   * @returns Promise<Alteration[]> - Array of alterations
   */
  async getAlterationsByJobCard(jobCardId: string): Promise<Alteration[]> {
    try {
      const { data, error } = await supabase
        .from('alterations')
        .select('*')
        .eq('job_card_id', jobCardId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error(
          `Error fetching alterations for job card ${jobCardId}:`,
          error.message
        )
        return []
      }

      return (data as Alteration[]) || []
    } catch (error) {
      console.error(
        `Unexpected error fetching alterations for job card ${jobCardId}:`,
        error
      )
      return []
    }
  },

  /**
   * Calculate stats for inspection reports of a style/color
   * @param style - Style name
   * @param color - Color name
   * @returns Promise with stats object
   */
  async getInspectionStats(
    style: string,
    color: string
  ): Promise<{
    totalInspections: number
    passRate: number
    totalAlterations: number
    pendingCorrections: number
  }> {
    try {
      // Fetch all inspections for style/color
      const { data: inspections, error: inspectionsError } = await supabase
        .from('inspection_reports')
        .select('*')
        .eq('style', style)
        .eq('color', color)

      if (inspectionsError) {
        console.error(
          `Error fetching inspection stats for style ${style}, color ${color}:`,
          inspectionsError.message
        )
        return {
          totalInspections: 0,
          passRate: 0,
          totalAlterations: 0,
          pendingCorrections: 0,
        }
      }

      const totalInspections = inspections?.length || 0
      const passCount =
        inspections?.filter((i: InspectionReport) => i.overall_status === 'pass').length || 0
      const passRate = totalInspections > 0 ? (passCount / totalInspections) * 100 : 0

      // Fetch alterations for all inspections
      const inspectionIds = inspections?.map((i: InspectionReport) => i.id) || []
      let totalAlterations = 0
      let pendingCorrections = 0

      if (inspectionIds.length > 0) {
        const { data: alterations, error: alterationsError } = await supabase
          .from('alterations')
          .select('*')
          .in('inspection_report_id', inspectionIds)

        if (alterationsError) {
          console.error(
            `Error fetching alterations for inspection stats:`,
            alterationsError.message
          )
        } else {
          totalAlterations = alterations?.length || 0
          pendingCorrections =
            alterations?.filter((a: Alteration) => !a.is_corrected).length || 0
        }
      }

      return {
        totalInspections,
        passRate: Math.round(passRate),
        totalAlterations,
        pendingCorrections,
      }
    } catch (error) {
      console.error(
        `Unexpected error calculating inspection stats for style ${style}, color ${color}:`,
        error
      )
      return {
        totalInspections: 0,
        passRate: 0,
        totalAlterations: 0,
        pendingCorrections: 0,
      }
    }
  },
}

export default inspectionService
