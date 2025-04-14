/**
 * Format a number as currency
 * @param value Number to format
 * @param decimals Number of decimal places
 * @returns Formatted currency string without currency symbol
 */
export function formatCurrency(value: number, decimals = 2): string {
  return value.toLocaleString("he-IL", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format a date to a readable string
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  if (!date) return ""
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("he-IL")
}

/**
 * Format a date and time to a readable string
 * @param date Date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | Date): string {
  if (!date) return ""
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleString("he-IL")
}

/**
 * Format a relative time (today, yesterday, or date)
 * @param dateStr Date string to format
 * @returns Formatted relative time string
 */
export function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return ""

  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "היום"
  if (diffDays === 1) return "אתמול"

  return date.toLocaleDateString("he-IL")
}
