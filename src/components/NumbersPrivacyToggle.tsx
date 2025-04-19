"use client"

import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboardPrivacy } from "@/hooks/useDashboardPrivacy"
import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function NumbersPrivacyToggle() {
  const { hideNumbers, toggleNumberVisibility } = useDashboardPrivacy()
  const [isActive, setIsActive] = useState(false)

  // Add animation effect when toggled
  useEffect(() => {
    setIsActive(true)
    const timer = setTimeout(() => setIsActive(false), 500)
    return () => clearTimeout(timer)
  }, [hideNumbers])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleNumberVisibility}
            className={isActive ? "animate-pulse" : ""}
          >
            {hideNumbers ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            <span className="sr-only">{hideNumbers ? "הצג מספרים" : "הסתר מספרים"}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{hideNumbers ? "הצג מספרים" : "הסתר מספרים"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
