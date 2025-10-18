import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import alterationService from '@/services/alterationService'

/**
 * Hook to fetch all alteration templates
 * @returns React Query result with alteration templates array
 */
export function useAlterationTemplates() {
  return useQuery({
    queryKey: ['alteration-templates'],
    queryFn: () => alterationService.getAlterationTemplates(),
    staleTime: 1000 * 60 * 60, // 1 hour (templates don't change often)
  })
}

/**
 * Hook to create a new alteration with automatic cache invalidation
 * @returns Mutation function and state
 */
export function useCreateAlteration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (alteration: Parameters<typeof alterationService.createAlteration>[0]) =>
      alterationService.createAlteration(alteration),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['alterations', variables.job_card_id] })
      queryClient.invalidateQueries({ queryKey: ['inspection', variables.inspection_report_id] })
    },
  })
}
