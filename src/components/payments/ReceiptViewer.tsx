"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Download, X } from "lucide-react"
import ReceiptService from "@/services/ReceiptService"

interface ReceiptViewerProps {
  paymentId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({ paymentId, open, onOpenChange }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [pdfData, setPdfData] = useState<string | null>(null)
  const [filename, setFilename] = useState<string>("receipt.pdf")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && paymentId) {
      loadReceipt(paymentId)
    } else {
      // Reset state when dialog closes
      setPdfData(null)
      setError(null)
    }
  }, [open, paymentId])

  const loadReceipt = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const { pdfBase64, filename } = await ReceiptService.generateReceipt(id)
      setPdfData(pdfBase64)
      setFilename(filename)
    } catch (error) {
      console.error("Error loading receipt:", error)
      setError("אירעה שגיאה בטעינת הקבלה. נסה שנית מאוחר יותר.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!pdfData) return

    const byteCharacters = atob(pdfData)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: "application/pdf" })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>צפייה בקבלה</span>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-center text-gray-600">טוען קבלה...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-red-600 mb-4">{error}</p>
              <Button onClick={() => loadReceipt(paymentId!)}>נסה שנית</Button>
            </div>
          ) : pdfData ? (
            <div className="flex flex-col">
              <div className="border rounded-md overflow-hidden" style={{ height: "60vh" }}>
                <iframe
                  src={`data:application/pdf;base64,${pdfData}`}
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          {!isLoading && pdfData && (
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              הורד קבלה
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ReceiptViewer
