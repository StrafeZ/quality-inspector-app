/**
 * Utility functions for inspection-related operations
 */

/**
 * Generate a unique inspection number based on production PO and timestamp
 * @param productionPo - The production PO number from the order
 * @returns Formatted inspection number (e.g., INS-ORD-2025-1003-20250110-143052)
 */
export function generateInspectionNumber(productionPo?: string | null): string {
  const now = new Date()

  // Format date as YYYYMMDD
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const dateStr = `${year}${month}${day}`

  // Format time as HHmmss
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const timeStr = `${hours}${minutes}${seconds}`

  // Use production PO or fallback to 'UNKNOWN'
  const po = productionPo || 'UNKNOWN'

  return `INS-${po}-${dateStr}-${timeStr}`
}
