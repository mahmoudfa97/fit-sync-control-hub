
"use client"

import React, { useRef, useState, useEffect } from "react"
import { CreditCard, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HypPaymentFrameProps {
  paymentUrl: string
  onError: () => void
}

export const HypPaymentFrame: React.FC<HypPaymentFrameProps> = ({
  paymentUrl,
  onError,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeHeight, setIframeHeight] = useState(500)
  const [iframeError, setIframeError] = useState(false)

  // Check iframe loading
  useEffect(() => {
    if (paymentUrl) {
      // If iframe fails to load, show fallback after 10 seconds
      const timeoutId = setTimeout(() => {
        if (!iframeRef.current?.contentWindow?.location) {
          setIframeError(true)
        }
      }, 10000)

      return () => clearTimeout(timeoutId)
    }
  }, [paymentUrl])

  // Handle iframe load error
  const handleIframeError = () => {
    setIframeError(true)
    onError()
  }

  // Open payment in new window
  const openPaymentInNewWindow = () => {
    if (paymentUrl) {
      window.open(paymentUrl, "_blank", "width=800,height=600")
    }
  }

  if (iframeError) {
    return (
      <div className="bg-amber-50 p-4 rounded-lg mb-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">לא ניתן לטעון את מסך התשלום</h4>
            <p className="text-sm text-amber-700 mt-1">
              אנא נסה להמשיך את התשלום בחלון חדש או בחר שיטת תשלום אחרת.
            </p>
            <div className="mt-3">
              <Button onClick={openPaymentInNewWindow} className="mr-2">
                פתח בחלון חדש
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-md overflow-hidden">
        <iframe
          ref={iframeRef}
          src={paymentUrl}
          width="100%"
          height={iframeHeight}
          frameBorder="0"
          allow="payment"
          onLoad={() => setIframeHeight(550)}
          onError={handleIframeError}
        />
      </div>
      <p className="text-sm text-gray-500 mt-3 text-center flex items-center justify-center">
        <CreditCard className="h-4 w-4 mr-1" />
        התשלום מאובטח ומבוצע באמצעות HYP, מערכת סליקה מאובטחת.
      </p>
    </>
  )
}
