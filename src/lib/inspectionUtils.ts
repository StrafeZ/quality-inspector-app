/**
 * Utility functions for inspection-related operations
 */

/**
 * Generate a unique inspection number based on order ID and date
 * @param orderId - The order ID from the order (e.g., "ORD-2025-1002")
 * @returns Formatted inspection number (e.g., INS-2025-1002-20250117)
 */
export function generateInspectionNumber(orderId?: string | null): string {
  const now = new Date()

  // Format date as YYYYMMDD
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const dateStr = `${year}${month}${day}`

  // Strip order type prefix (ORD/SMP/PRD) from order ID
  let orderRef = 'UNKNOWN'
  if (orderId) {
    // Remove prefix like "ORD-", "SMP-", "PRD-" to get just "2025-1002"
    const parts = orderId.split('-')
    if (parts.length >= 3) {
      // Join everything after the first prefix part
      orderRef = parts.slice(1).join('-')
    } else {
      orderRef = orderId
    }
  }

  return `INS-${orderRef}-${dateStr}`
}
