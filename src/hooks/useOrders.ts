import { useQuery } from '@tanstack/react-query'
import ordersService from '@/services/ordersService'

/**
 * Hook to fetch all active orders (not completed or archived)
 * @returns React Query result with orders data, loading state, and error
 */
export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersService.getActiveOrders(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch a single order by ID
 * @param orderId - The order ID to fetch
 * @returns React Query result with order data, loading state, and error
 */
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersService.getOrderById(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch an order with alterations count
 * @param orderId - The order ID to fetch
 * @returns React Query result with order and alterations count data
 */
export function useOrderWithAlterations(orderId: string) {
  return useQuery({
    queryKey: ['order-with-alterations', orderId],
    queryFn: () => ordersService.getOrderWithAlterations(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch an order with job cards count
 * @param orderId - The order ID to fetch
 * @returns React Query result with order and job card count data
 */
export function useOrderWithJobCards(orderId: string) {
  return useQuery({
    queryKey: ['order-with-job-cards', orderId],
    queryFn: () => ordersService.getOrderWithJobCards(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch an order with full job cards data and alterations count
 * @param identifier - The production_po or order_id to fetch
 * @returns React Query result with order, job cards array, and counts
 */
export function useOrderWithJobCardsData(identifier: string) {
  return useQuery({
    queryKey: ['order-with-job-cards-data', identifier],
    queryFn: () => ordersService.getOrderWithJobCardsData(identifier),
    enabled: !!identifier,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch a single job card with related order information
 * @param jobCardId - The job card ID to fetch
 * @returns React Query result with job card and order data
 */
export function useJobCard(jobCardId: string) {
  return useQuery({
    queryKey: ['job-card', jobCardId],
    queryFn: () => ordersService.getJobCardById(jobCardId),
    enabled: !!jobCardId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch all job cards for a specific style/color combination
 * @param style - Style number or name
 * @param color - Color name
 * @returns React Query result with job cards array
 */
export function useJobCardsByStyle(style: string, color: string) {
  return useQuery({
    queryKey: ['job-cards-by-style', style, color],
    queryFn: () => ordersService.getJobCardsByStyle(style, color),
    enabled: !!style && !!color,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
