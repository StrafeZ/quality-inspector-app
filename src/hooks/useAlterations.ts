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
    staleTime: 1000 * 60 * 5, // 5 minutes
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

/**
 * Hook to create a new alteration template
 * @returns Mutation function and state
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (template: Parameters<typeof alterationService.createTemplate>[0]) =>
      alterationService.createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alteration-templates'] })
    },
  })
}

/**
 * Hook to update an alteration template
 * @returns Mutation function and state
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof alterationService.updateTemplate>[1] }) =>
      alterationService.updateTemplate(id, updates),
    onSuccess: () => {
      // Force refetch by invalidating and refetching
      queryClient.invalidateQueries({ queryKey: ['alteration-templates'] })
      queryClient.refetchQueries({ queryKey: ['alteration-templates'] })
    },
  })
}

/**
 * Hook to delete an alteration template
 * @returns Mutation function and state
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => alterationService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alteration-templates'] })
    },
  })
}
