/**
 * Utility functions for inspection-related operations
 */

/**
 * Generate a unique inspection number based on order ID and date/time
 * @param orderId - The order ID from the order (e.g., "PRD-2025-1002")
 * @returns Formatted inspection number (e.g., INS-1002-17101426)
 */
export function generateInspectionNumber(orderId?: string | null): string {
  const now = new Date()

  // Format date/time as DDMMHHMM (Day/Month/Hour/Minute)
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const dateTimeStr = `${day}${month}${hour}${minute}`

  // Extract just the final number from order ID (e.g., "1002" from "PRD-2025-1002")
  let orderNum = 'UNKNOWN'
  if (orderId) {
    const parts = orderId.split('-')
    if (parts.length >= 1) {
      // Get the last part (the order number)
      orderNum = parts[parts.length - 1]
    } else {
      orderNum = orderId
    }
  }

  return `INS-${orderNum}-${dateTimeStr}`
}
