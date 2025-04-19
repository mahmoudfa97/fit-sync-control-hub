import { useDashboardPrivacy } from "@/hooks/useDashboardPrivacy"

/**
 * Format a number as currency
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | string): string => {
  if (amount === null || amount === undefined) return "0"

  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  return numAmount.toLocaleString("he-IL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

/**
 * Format a date for display
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return ""

  const dateObj = typeof date === "string" ? new Date(date) : date

  return dateObj.toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Hook to use formatters with privacy settings
 */
export function useFormatters() {
  const { hideNumbers } = useDashboardPrivacy()

  return {
    formatCurrency: (amount: number | string, symbol = "₪"): string => {
      if (hideNumbers) {
        return `${symbol}${"*".repeat(5)}`
      }
      return `${symbol}${formatCurrency(amount)}`
    },

    formatDate: (date: string | Date): string => {
      if (hideNumbers) {
        return "**/**/****"
      }
      return formatDate(date)
    },

    formatNumber: (num: number | string): string => {
      if (hideNumbers) {
        return "*".repeat(String(num).length)
      }
      return String(num)
    },
  }
}
