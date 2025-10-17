import { supabase } from '@/lib/supabase'

export interface Order {
  order_id: string
  order_name: string
  customer_name: string
  order_type: string
  total_quantity: number
  delivery_date: string | null
  production_po: string | null
  customer_po: string | null
  status: string
  style_number: string | null
  fabric_type: string | null
  color: string | null
  created_at: string
}

const ordersService = {
  /**
   * Fetches all active orders (not completed or archived)
   * @returns Promise<Order[]> - Array of active orders
   */
  async getActiveOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .not('status', 'in', '(completed,archived)')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching active orders:', error.message)
        return []
      }

      return data as Order[]
    } catch (error) {
      console.error('Unexpected error fetching active orders:', error)
      return []
    }
  },

  /**
   * Fetches a single order by ID
   * @param orderId - The order ID to fetch
   * @returns Promise<Order | null> - The order or null if not found
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single()

      if (error) {
        console.error(`Error fetching order ${orderId}:`, error.message)
        return null
      }

      return data as Order
    } catch (error) {
      console.error(`Unexpected error fetching order ${orderId}:`, error)
      return null
    }
  },

  /**
   * Fetches an order with alterations count
   * @param orderId - The order ID to fetch
   * @returns Promise with order and alterations count, or null if not found
   */
  async getOrderWithAlterations(
    orderId: string
  ): Promise<{ order: Order; alterationsCount: number } | null> {
    try {
      // First fetch the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single()

      if (orderError) {
        console.error(`Error fetching order ${orderId}:`, orderError.message)
        return null
      }

      // Then fetch alterations count for this order
      const { count, error: countError } = await supabase
        .from('alterations')
        .select('*', { count: 'exact', head: true })
        .eq('order_id', orderId)

      if (countError) {
        console.error(
          `Error fetching alterations count for order ${orderId}:`,
          countError.message
        )
        return {
          order: orderData as Order,
          alterationsCount: 0,
        }
      }

      return {
        order: orderData as Order,
        alterationsCount: count ?? 0,
      }
    } catch (error) {
      console.error(
        `Unexpected error fetching order with alterations ${orderId}:`,
        error
      )
      return null
    }
  },

  /**
   * Fetches an order with job cards count
   * @param orderId - The order ID to fetch
   * @returns Promise with order and job card count, or null if not found
   */
  async getOrderWithJobCards(
    orderId: string
  ): Promise<{ order: Order; jobCardCount: number } | null> {
    try {
      // First fetch the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single()

      if (orderError) {
        console.error(`Error fetching order ${orderId}:`, orderError.message)
        return null
      }

      // Then fetch job cards count
      const { count, error: countError } = await supabase
        .from('job_cards')
        .select('*', { count: 'exact', head: true })
        .eq('order_id', orderId)

      if (countError) {
        console.error(
          `Error fetching job cards count for order ${orderId}:`,
          countError.message
        )
        return {
          order: orderData as Order,
          jobCardCount: 0,
        }
      }

      return {
        order: orderData as Order,
        jobCardCount: count ?? 0,
      }
    } catch (error) {
      console.error(
        `Unexpected error fetching order with job cards ${orderId}:`,
        error
      )
      return null
    }
  },
}

export default ordersService
