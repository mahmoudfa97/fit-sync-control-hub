"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink, AlertCircle } from "lucide-react"
import { EnhancedHypPaymentService } from "@/services/EnhancedHypPaymentService"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface PaymentHistoryTableProps {
  memberId: string
}

export default function PaymentHistoryTable({ memberId }: PaymentHistoryTableProps) {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true)
        const data = await EnhancedHypPaymentService.getMemberPayments(memberId)
        setPayments(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching payments:", err)
        setError("אירעה שגיאה בטעינת היסטוריית התשלומים")
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [memberId])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">שולם</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            ממתין
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">נכשל</Badge>
      case "canceled":
        return <Badge variant="secondary">בוטל</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewReceipt = async (paymentId: string) => {
    try {
      const receiptUrl = await EnhancedHypPaymentService.getReceiptUrl(paymentId)
      if (receiptUrl) {
        window.open(receiptUrl, "_blank")
      } else {
        alert("לא נמצאה קבלה לתשלום זה")
      }
    } catch (err) {
      console.error("Error getting receipt:", err)
      alert("אירעה שגיאה בטעינת הקבלה")
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 border rounded-md bg-red-50">
        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="text-center p-6 border rounded-md bg-gray-50">
        <p className="text-gray-500">לא נמצאו תשלומים עבור חבר זה</p>
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>תאריך</TableHead>
            <TableHead>סכום</TableHead>
            <TableHead>תיאור</TableHead>
            <TableHead>סטטוס</TableHead>
            <TableHead>אמצעי תשלום</TableHead>
            <TableHead>פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                {payment.payment_date ? format(new Date(payment.payment_date), "dd/MM/yyyy") : "לא זמין"}
              </TableCell>
              <TableCell>{payment.amount ? `₪${payment.amount.toFixed(2)}` : "לא זמין"}</TableCell>
              <TableCell>{payment.description || "תשלום"}</TableCell>
              <TableCell>{getStatusBadge(payment.status)}</TableCell>
              <TableCell>
                {payment.payment_method === "hyp" ? (
                  <div className="flex items-center">
                    <span>כרטיס אשראי</span>
                    {payment.payment_details?.payment_details?.hypDetails?.transactionId && (
                      <span className="text-xs text-gray-500 ml-2">
                        (עסקה: {payment.payment_details.payment_details.hypDetails.transactionId.slice(-6)})
                      </span>
                    )}
                  </div>
                ) : (
                  payment.payment_method || "לא זמין"
                )}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {payment.status === "paid" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                      onClick={() => handleViewReceipt(payment.id)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      קבלה
                    </Button>
                  )}
                  {payment.payment_details?.receipt_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center"
                      onClick={() => window.open(payment.payment_details.receipt_url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
