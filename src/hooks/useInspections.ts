import { useQuery } from '@tanstack/react-query'
import inspectionService from '@/services/inspectionService'

/**
 * Hook to check if inspection report exists for a style/color combination
 * @param style - Style name
 * @param color - Color name
 * @returns React Query result with inspection data, loading state, and error
 */
export function useInspectionByStyle(style: string, color: string) {
  return useQuery({
    queryKey: ['inspection-by-style', style, color],
    queryFn: () => inspectionService.getInspectionByStyle(style, color),
    enabled: !!style && !!color,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch a single inspection report with alterations
 * @param inspectionId - The inspection report ID to fetch
 * @returns React Query result with inspection and alterations data
 */
export function useInspectionById(inspectionId: string) {
  return useQuery({
    queryKey: ['inspection', inspectionId],
    queryFn: () => inspectionService.getInspectionById(inspectionId),
    enabled: !!inspectionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to calculate stats for inspection reports of a style/color
 * @param style - Style name
 * @param color - Color name
 * @returns React Query result with inspection stats
 */
export function useInspectionStats(style: string, color: string) {
  return useQuery({
    queryKey: ['inspection-stats', style, color],
    queryFn: () => inspectionService.getInspectionStats(style, color),
    enabled: !!style && !!color,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * Hook to fetch all alterations for a specific job card
 * @param jobCardId - The job card ID to fetch alterations for
 * @returns React Query result with alterations data
 */
export function useAlterationsByJobCard(jobCardId: string) {
  return useQuery({
    queryKey: ['alterations', jobCardId],
    queryFn: () => inspectionService.getAlterationsByJobCard(jobCardId),
    enabled: !!jobCardId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
