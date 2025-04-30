"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PaymentCancelPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    // Clear any payment-related data from localStorage
    localStorage.removeItem("hyp_transaction_id")
    localStorage.removeItem("hyp_payment_id")

    // Show toast notification
    toast({
      title: "התשלום בוטל",
      description: "התשלום בוטל על ידך. ניתן לנסות שוב בכל עת.",
      variant: "destructive",
    })
  }, [])

  const handleReturnToApp = () => {
    navigate("/dashboard")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">התשלום בוטל</CardTitle>
          <CardDescription className="text-center">התשלום בוטל על ידך</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-center text-gray-600 mb-4">התשלום בוטל. ניתן לנסות שוב בכל עת או לבחור אמצעי תשלום אחר.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleReturnToApp}>חזור למערכת</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
