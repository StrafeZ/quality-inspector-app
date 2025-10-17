import { supabase } from '@/lib/supabase'

export interface Order {
  id: number
  order_id: string
  customer_name: string
  style_name: string
  color: string | null
  sizes: string | null
  stitcher_rate: number | null
  fuser_rate: number | null
  order_date: string | null
  delivery_date: string | null
  status: string | null
  created_at: string
  updated_at: string | null
  sheets_row_number: number | null
  order_type: string
  sample_purpose: string | null
  leather_type: string | null
  lot_number: string | null
  leather_description: string | null
  customer_id: string | null
  production_order_id: string | null
  created_from: string | null
  job_cards_pdf_url: string | null
}

export interface JobCard {
  id: string
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
  inspectionStatus: 'not_started' | 'in_progress' | 'pass' | 'pass_with_notes' | 'minor_alterations' | 'major_alterations' | 'reject'
  inspectionId: string | null
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

      // Fetch job card counts and inspection status for each order
      const ordersWithCounts = await Promise.all(
        (orders || []).map(async (order: Order) => {
          const { count } = await supabase
            .from('job_cards')
            .select('*', { count: 'exact', head: true })
            .eq('order_id', order.order_id)

          // Fetch most recent inspection for this order
          const { data: inspection } = await supabase
            .from('inspection_reports')
            .select('id, overall_status')
            .eq('order_id', order.order_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          return {
            ...order,
            jobCardsCount: count || 0,
            inspectionStatus: inspection?.overall_status || 'not_started',
            inspectionId: inspection?.id || null,
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
   * Fetches a single order by order_id
   * @param identifier - The order_id to fetch
   * @returns Promise<Order | null> - The order or null if not found
   */
  async getOrderById(identifier: string): Promise<Order | null> {
    try {
      // Fetch by order_id
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', identifier)
        .single()

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

  /**
   * Fetches a single job card by ID with related order information
   * @param jobCardId - The job card ID to fetch
   * @returns Promise with job card and order data, or null if not found
   */
  async getJobCardById(
    jobCardId: string
  ): Promise<{ jobCard: JobCard; order: Order } | null> {
    try {
      // Fetch the job card
      const { data: jobCard, error: jobCardError } = await supabase
        .from('job_cards')
        .select('*')
        .eq('id', jobCardId)
        .single()

      if (jobCardError || !jobCard) {
        console.error(`Error fetching job card ${jobCardId}:`, jobCardError?.message)
        return null
      }

      // Fetch the related order using the job card's order_id
      const order = await this.getOrderById(jobCard.order_id)

      if (!order) {
        console.error(`Order not found for job card ${jobCardId}`)
        return null
      }

      return {
        jobCard: jobCard as JobCard,
        order,
      }
    } catch (error) {
      console.error(`Unexpected error fetching job card ${jobCardId}:`, error)
      return null
    }
  },

  /**
   * Fetches all job cards for a specific style/color combination
   * @param style - Style number or name
   * @param color - Color name
   * @returns Promise with array of job cards and their orders
   */
  async getJobCardsByStyle(
    style: string,
    color: string
  ): Promise<JobCard[]> {
    try {
      // First, find all orders with this style
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('order_id')
        .or(`style_number.eq.${style},style_name.eq.${style}`)

      if (ordersError) {
        console.error(`Error fetching orders for style ${style}:`, ordersError.message)
        return []
      }

      if (!orders || orders.length === 0) {
        return []
      }

      const orderIds = orders.map((order: { order_id: string }) => order.order_id)

      // Fetch all job cards for these orders with matching color
      const { data: jobCards, error: jobCardsError } = await supabase
        .from('job_cards')
        .select('*')
        .in('order_id', orderIds)
        .eq('color', color)
        .order('serial_no', { ascending: true })

      if (jobCardsError) {
        console.error(
          `Error fetching job cards for style ${style}, color ${color}:`,
          jobCardsError.message
        )
        return []
      }

      return (jobCards as JobCard[]) || []
    } catch (error) {
      console.error(
        `Unexpected error fetching job cards for style ${style}, color ${color}:`,
        error
      )
      return []
    }
  },
}

export default ordersService
