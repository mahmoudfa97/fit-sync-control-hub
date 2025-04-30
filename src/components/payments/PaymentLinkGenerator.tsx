"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EnhancedHypPaymentService } from "@/services/EnhancedHypPaymentService"
import { Loader2, Copy, Check, Link } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaymentLinkGeneratorProps {
  memberId?: string
  memberName?: string
  memberEmail?: string
  memberPhone?: string
  defaultAmount?: number
  defaultDescription?: string
}

export default function PaymentLinkGenerator({
  memberId = "",
  memberName = "",
  memberEmail = "",
  memberPhone = "",
  defaultAmount = 0,
  defaultDescription = "תשלום מנוי",
}: PaymentLinkGeneratorProps) {
  const { toast } = useToast()
  const [amount, setAmount] = useState(defaultAmount.toString())
  const [description, setDescription] = useState(defaultDescription)
  const [customerName, setCustomerName] = useState(memberName)
  const [customerEmail, setCustomerEmail] = useState(memberEmail)
  const [customerPhone, setCustomerPhone] = useState(memberPhone)
  const [loading, setLoading] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerateLink = async () => {
    try {
      setLoading(true)

      if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
        toast({
          title: "שגיאה",
          description: "אנא הזן סכום תקין",
          variant: "destructive",
        })
        return
      }

      const result = await EnhancedHypPaymentService.createPaymentLink({
        amount: Number.parseFloat(amount),
        description,
        customerId: memberId,
        customerName,
        customerEmail,
        customerPhone,
        metadata: {
          source: "payment_link_generator",
          memberId,
        },
      })

      if (result.success && result.paymentUrl) {
        setPaymentUrl(result.paymentUrl)
        toast({
          title: "קישור נוצר בהצלחה",
          description: "קישור התשלום נוצר בהצלחה",
        })
      } else {
        toast({
          title: "שגיאה",
          description: "אירעה שגיאה ביצירת קישור התשלום",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating payment link:", error)
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה ביצירת קישור התשלום",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (paymentUrl) {
      navigator.clipboard.writeText(paymentUrl)
      setCopied(true)
      toast({
        title: "הקישור הועתק",
        description: "קישור התשלום הועתק ללוח",
      })

      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleReset = () => {
    setPaymentUrl(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>יצירת קישור תשלום</CardTitle>
        <CardDescription>צור קישור תשלום שניתן לשלוח ללקוח באימייל או בהודעה</CardDescription>
      </CardHeader>
      <CardContent>
        {paymentUrl ? (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-md border">
              <Label className="text-sm text-gray-500 mb-1 block">קישור תשלום:</Label>
              <div className="flex items-center">
                <Input value={paymentUrl} readOnly className="flex-1 mr-2" />
                <Button size="sm" variant="outline" onClick={handleCopyLink} className="flex items-center">
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? "הועתק" : "העתק"}
                </Button>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                צור קישור חדש
              </Button>

              <Button onClick={() => window.open(paymentUrl, "_blank")} className="flex items-center">
                <Link className="h-4 w-4 mr-1" />
                פתח קישור
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">סכום (₪)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerName">שם הלקוח</Label>
                <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerEmail">אימייל</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">טלפון</Label>
                <Input id="customerPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        )}
      </CardContent>
      {!paymentUrl && (
        <CardFooter className="flex justify-end">
          <Button onClick={handleGenerateLink} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            צור קישור תשלום
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
