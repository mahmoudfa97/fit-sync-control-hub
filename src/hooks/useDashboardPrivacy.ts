import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
let globalHideNumbers = false


export function useDashboardPrivacy() {
  const [hideNumbers, setHideNumbers] = useState(globalHideNumbers)
  const { toast } = useToast()
// Listen for privacy changes from other components
useEffect(() => {
  const handlePrivacyChange = (event: CustomEvent) => {
    const newValue = event.detail?.hideNumbers
    if (typeof newValue === "boolean" && newValue !== hideNumbers) {
      setHideNumbers(newValue)
    }
  }

  // Add event listener
  window.addEventListener("privacy-change", handlePrivacyChange as EventListener)

  // Clean up
  return () => {
    window.removeEventListener("privacy-change", handlePrivacyChange as EventListener)
  }
}, [hideNumbers])

const toggleNumberVisibility = useCallback(() => {
  const newState = !hideNumbers

  // Update global state
  globalHideNumbers = newState

  // Update component state
  setHideNumbers(newState)

  // Show toast notification
  toast({
    title: newState ? "מספרים מוסתרים" : "מספרים גלויים",
    description: newState ? "כל המספרים והתאריכים מוסתרים כעת" : "כל המספרים והתאריכים גלויים כעת",
    duration: 2000,
  })

  // Dispatch a custom event so other components can react to the change
  window.dispatchEvent(
    new CustomEvent("privacy-change", {
      detail: { hideNumbers: newState },
    }),
  )

  // Force a re-render of the entire application
  setTimeout(() => {
    window.dispatchEvent(new Event("resize"))
  }, 10)
}, [hideNumbers, toast])

  return { hideNumbers, toggleNumberVisibility }
}
