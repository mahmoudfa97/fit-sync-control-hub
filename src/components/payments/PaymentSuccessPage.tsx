"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { EnhancedHypPaymentService } from "@/services/EnhancedHypPaymentService"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2, XCircle, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processPayment = async () => {
      try {
        setLoading(true)

        // Get the secretTransactionId from localStorage
        const secretTransactionId = localStorage.getItem("hyp_transaction_id")
        const paymentId = localStorage.getItem("hyp_payment_id")

        if (!secretTransactionId || !paymentId) {
          setError("לא נמצאו פרטי תשלום. אנא נסה שנית.")
          setSuccess(false)
          return
        }

        // Get customer details from localStorage or session
        // In a real app, you might want to fetch this from your backend
        const customerName = localStorage.getItem("customer_name") || "לקוח"
        const customerEmail = localStorage.getItem("customer_email") || ""
        const description = localStorage.getItem("payment_description") || "תשלום מנוי"

        // Validate the payment
        const result = await EnhancedHypPaymentService.handlePaymentSuccess(
          secretTransactionId,
          paymentId,
          {
            name: customerName,
            email: customerEmail,
          },
          description,
        )

        if (result.success) {
          setSuccess(true)
          setReceiptUrl(result.receiptUrl || null)

          toast({
            title: "התשלום הושלם בהצלחה",
            description: "התשלום עבור המנוי התקבל בהצלחה",
          })
        } else {
          setSuccess(false)
          setError("אירעה שגיאה באימות התשלום. אנא פנה לשירות הלקוחות.")
        }
      } catch (error) {
        console.error("Error processing payment:", error)
        setSuccess(false)
        setError("אירעה שגיאה בעיבוד התשלום. אנא פנה לשירות הלקוחות.")
      } finally {
        setLoading(false)
        // Clear the stored transaction ID
        localStorage.removeItem("hyp_transaction_id")
        localStorage.removeItem("hyp_payment_id")
      }
    }

    processPayment()
  }, [])

  const handleViewReceipt = () => {
    if (receiptUrl) {
      window.open(receiptUrl, "_blank")
    }
  }

  const handleReturnToApp = () => {
    navigate("/dashboard")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">סטטוס תשלום</CardTitle>
          <CardDescription className="text-center">
            {loading ? "מעבד את התשלום..." : success ? "התשלום הושלם בהצלחה" : "אירעה שגיאה בתשלום"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {loading ? (
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          ) : success ? (
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
          )}

          <p className="text-center text-gray-600 mb-4">
            {loading
              ? "אנא המתן בזמן שאנו מעבדים את התשלום שלך..."
              : success
                ? "התשלום עבור המנוי התקבל בהצלחה. תודה!"
                : error || "אירעה שגיאה בעת ביצוע התשלום. אנא פנה לשירות הלקוחות."}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          {success && receiptUrl && (
            <Button onClick={handleViewReceipt} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              צפה בקבלה
            </Button>
          )}
          <Button onClick={handleReturnToApp} variant={success ? "outline" : "default"}>
            חזור למערכת
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
