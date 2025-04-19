"use client"
// Create a hook that forces re-render when privacy changes
import { useState, useEffect } from "react"

/**
 * Formats a value with privacy masking
 * @param value The value to format
 * @param hideNumbers Whether to hide the value
 * @param maskChar Character to use for masking (default: *)
 * @returns Masked or original value
 */
export const formatPrivateValue = (
  value: string | number | null | undefined,
  hideNumbers: boolean,
  maskChar = "*",
): string => {
  if (value === null || value === undefined) return ""

  // Explicitly check for boolean to avoid any type coercion issues
  if (hideNumbers === true) {
    return maskChar.repeat(String(value).length || 4)
  }

  return String(value)
}

/**
 * Formats a date with privacy masking
 * @param date The date to format
 * @param hideNumbers Whether to hide the date
 * @returns Masked or original date
 */
export const formatPrivateDate = (date: string | Date | null | undefined, hideNumbers: boolean): string => {
  if (!date) return ""

  // Explicitly check for boolean to avoid any type coercion issues
  if (hideNumbers === true) {
    return "**/**/****"
  }

  if (typeof date === "string") {
    return date
  }

  return date.toLocaleDateString()
}

/**
 * Formats an email with privacy masking
 * @param email The email to format
 * @param hideNumbers Whether to hide the email
 * @returns Masked or original email
 */
export const formatPrivateEmail = (email: string | null | undefined, hideNumbers: boolean): string => {
  if (!email) return ""

  // Explicitly check for boolean to avoid any type coercion issues
  if (hideNumbers !== true) return email

  const parts = email.split("@")
  if (parts.length !== 2) return email

  const username = parts[0]
  const domain = parts[1]

  // Show first character and last character of username, hide the rest
  const maskedUsername =
    username.length <= 2
      ? "*".repeat(username.length)
      : `${username[0]}${"*".repeat(username.length - 2)}${username[username.length - 1]}`

  return `${maskedUsername}@${domain}`
}

/**
 * Formats a phone number with privacy masking
 * @param phone The phone number to format
 * @param hideNumbers Whether to hide the phone number
 * @returns Masked or original phone number
 */
export const formatPrivatePhone = (phone: string | null | undefined, hideNumbers: boolean): string => {
  if (!phone) return ""

  // Remove any non-digit characters
  const digitsOnly = phone.replace(/\D/g, "")

  // Explicitly check for boolean to avoid any type coercion issues
  if (hideNumbers === true) {
    return "*".repeat(digitsOnly.length || 10)
  }

  // Format based on length
  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`
  }

  return phone
}


export function usePrivacyState() {
  const [privacyVersion, setPrivacyVersion] = useState(0)

  useEffect(() => {
    const handlePrivacyChange = () => {
      // Increment version to force re-render
      setPrivacyVersion((prev) => prev + 1)
    }

    window.addEventListener("privacy-change", handlePrivacyChange)

    return () => {
      window.removeEventListener("privacy-change", handlePrivacyChange)
    }
  }, [])

  return privacyVersion
}

// Enhanced hook that combines privacy state and formatters
import { useDashboardPrivacy } from "@/hooks/useDashboardPrivacy"

export function usePrivateFormatter() {
  const { hideNumbers } = useDashboardPrivacy()
  const privacyVersion = usePrivacyState() // Force re-render on privacy changes

  return {
    hideNumbers,
    privacyVersion,
    formatValue: (value: string | number | null | undefined, maskChar = "*") =>
      formatPrivateValue(value, hideNumbers, maskChar),
    formatDate: (date: string | Date | null | undefined) => formatPrivateDate(date, hideNumbers),
    formatEmail: (email: string | null | undefined) => formatPrivateEmail(email, hideNumbers),
    formatPhone: (phone: string | null | undefined) => formatPrivatePhone(phone, hideNumbers),
  }
}
