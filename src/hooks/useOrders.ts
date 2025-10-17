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
