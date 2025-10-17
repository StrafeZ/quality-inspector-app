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
  style_name: string | null
  fabric_type: string | null
  color: string | null
  created_at: string
}

export interface JobCard {
  job_card_id: string
  order_id: string
  serial_no: number
  size: string | null
  color: string | null
  status: string | null
  created_at: string
  updated_at: string | null
}

export interface OrderWithJobCards extends Order {
  jobCardsCount: number
}

const ordersService = {
  /**
   * Fetches all active orders (not completed or archived) with job card counts
   * @returns Promise<OrderWithJobCards[]> - Array of active orders with job card counts
   */
  async getActiveOrders(): Promise<OrderWithJobCards[]> {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .not('status', 'in', '(completed,archived)')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching active orders:', error.message)
        return []
      }

      // Fetch job card counts for each order
      const ordersWithCounts = await Promise.all(
        (orders || []).map(async (order: Order) => {
          const { count } = await supabase
            .from('job_cards')
            .select('*', { count: 'exact', head: true })
            .eq('order_id', order.order_id)

          return {
            ...order,
            jobCardsCount: count || 0,
          } as OrderWithJobCards
        })
      )

      return ordersWithCounts
    } catch (error) {
      console.error('Unexpected error fetching active orders:', error)
      return []
    }
  },

  /**
   * Fetches a single order by production_po or order_id
   * @param identifier - The production_po or order_id to fetch
   * @returns Promise<Order | null> - The order or null if not found
   */
  async getOrderById(identifier: string): Promise<Order | null> {
    try {
      // Try to fetch by production_po first (for URLs like PRD-2025-011)
      let { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('production_po', identifier)
        .single()

      // If not found, try by order_id (UUID)
      if (error || !data) {
        const result = await supabase
          .from('orders')
          .select('*')
          .eq('order_id', identifier)
          .single()
        data = result.data
        error = result.error
      }

      if (error) {
        console.error(`Error fetching order ${identifier}:`, error.message)
        return null
      }

      return data as Order
    } catch (error) {
      console.error(`Unexpected error fetching order ${identifier}:`, error)
      return null
    }
  },

  /**
   * Fetches an order with alterations and job cards counts
   * @param identifier - The production_po or order_id to fetch
   * @returns Promise with order, alterations count, and job cards count, or null if not found
   */
  async getOrderWithAlterations(
    identifier: string
  ): Promise<{ order: Order; alterationsCount: number; jobCardsCount: number } | null> {
    try {
      // First fetch the order (resolves production_po OR order_id)
      const order = await this.getOrderById(identifier)
      if (!order) return null

      // Fetch alterations count using the order's UUID
      const { count: alterationsCount, error: alterationsError } = await supabase
        .from('alterations')
        .select('*', { count: 'exact', head: true })
        .eq('order_id', order.order_id)

      if (alterationsError) {
        console.error(
          `Error fetching alterations count for order ${order.order_id}:`,
          alterationsError.message
        )
      }

      // Fetch job cards count using the order's UUID
      const { count: jobCardsCount, error: jobCardsError } = await supabase
        .from('job_cards')
        .select('*', { count: 'exact', head: true })
        .eq('order_id', order.order_id)

      if (jobCardsError) {
        console.error(
          `Error fetching job cards count for order ${order.order_id}:`,
          jobCardsError.message
        )
      }

      return {
        order,
        alterationsCount: alterationsCount ?? 0,
        jobCardsCount: jobCardsCount ?? 0,
      }
    } catch (error) {
      console.error(
        `Unexpected error fetching order with alterations ${identifier}:`,
        error
      )
      return null
    }
  },

  /**
   * Fetches an order with job cards count
   * @param identifier - The production_po or order_id to fetch
   * @returns Promise with order and job card count, or null if not found
   */
  async getOrderWithJobCards(
    identifier: string
  ): Promise<{ order: Order; jobCardCount: number } | null> {
    try {
      // First fetch the order (resolves production_po OR order_id)
      const order = await this.getOrderById(identifier)
      if (!order) return null

      // Then fetch job cards count using the order's UUID
      const { count, error: countError } = await supabase
        .from('job_cards')
        .select('*', { count: 'exact', head: true })
        .eq('order_id', order.order_id)

      if (countError) {
        console.error(
          `Error fetching job cards count for order ${order.order_id}:`,
          countError.message
        )
        return {
          order,
          jobCardCount: 0,
        }
      }

      return {
        order,
        jobCardCount: count ?? 0,
      }
    } catch (error) {
      console.error(
        `Unexpected error fetching order with job cards ${identifier}:`,
        error
      )
      return null
    }
  },

  /**
   * Fetches an order with full job cards data and alterations count
   * @param identifier - The production_po or order_id to fetch
   * @returns Promise with order, job cards array, and counts, or null if not found
   */
  async getOrderWithJobCardsData(
    identifier: string
  ): Promise<{
    order: Order
    jobCards: JobCard[]
    jobCardsCount: number
    alterationsCount: number
  } | null> {
    try {
      // First fetch the order (resolves production_po OR order_id)
      const order = await this.getOrderById(identifier)
      if (!order) return null

      // Fetch actual job cards using the order's UUID
      const { data: jobCards, error: jobCardsError } = await supabase
        .from('job_cards')
        .select('*')
        .eq('order_id', order.order_id)
        .order('serial_no', { ascending: true })

      if (jobCardsError) {
        console.error(
          `Error fetching job cards for order ${order.order_id}:`,
          jobCardsError.message
        )
      }

      // Fetch alterations count using the order's UUID
      const { count: alterationsCount, error: alterationsError } = await supabase
        .from('alterations')
        .select('*', { count: 'exact', head: true })
        .eq('order_id', order.order_id)

      if (alterationsError) {
        console.error(
          `Error fetching alterations count for order ${order.order_id}:`,
          alterationsError.message
        )
      }

      return {
        order,
        jobCards: (jobCards as JobCard[]) || [],
        jobCardsCount: jobCards?.length || 0,
        alterationsCount: alterationsCount ?? 0,
      }
    } catch (error) {
      console.error(
        `Unexpected error fetching order with job cards data ${identifier}:`,
        error
      )
      return null
    }
  },
}

export default ordersService
