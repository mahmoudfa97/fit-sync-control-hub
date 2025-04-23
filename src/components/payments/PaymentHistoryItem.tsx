"use client"
import { formatDistance } from "date-fns"
import { he } from "date-fns/locale"
import { CreditCard, CheckCircle, AlertCircle, Clock, FileText, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PaymentHistoryItemProps {
  payment: any
  onViewReceipt?: (payment: any) => void
  className?: string
}

export function PaymentHistoryItem({ payment, onViewReceipt, className }: PaymentHistoryItemProps) {
  // Format date
  const formattedDate = payment.payment_date
    ? formatDistance(new Date(payment.payment_date), new Date(), {
        addSuffix: true,
        locale: he,
      })
    : "לא ידוע"

  // Get payment method display info
  const getPaymentMethodInfo = () => {
    switch (payment.payment_method) {
      case "hyp":
        return {
          icon: <CreditCard className="h-4 w-4" />,
          label: "HYP",
          color: "bg-blue-100 text-blue-800",
        }
      case "cash":
        return {
          icon: <CreditCard className="h-4 w-4" />,
          label: "מזומן",
          color: "bg-green-100 text-green-800",
        }
      case "card":
        return {
          icon: <CreditCard className="h-4 w-4" />,
          label: "כרטיס אשראי",
          color: "bg-purple-100 text-purple-800",
        }
      case "bank":
        return {
          icon: <CreditCard className="h-4 w-4" />,
          label: "העברה בנקאית",
          color: "bg-amber-100 text-amber-800",
        }
      case "check":
        return {
          icon: <FileText className="h-4 w-4" />,
          label: "המחאה",
          color: "bg-slate-100 text-slate-800",
        }
      default:
        return {
          icon: <CreditCard className="h-4 w-4" />,
          label: payment.payment_method,
          color: "bg-gray-100 text-gray-800",
        }
    }
  }

  // Get status display info
  const getStatusInfo = () => {
    const isHyp = payment.payment_method === "hyp"

    switch (payment.status) {
      case "paid":
      case "completed":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: "שולם",
          color: "bg-green-100 text-green-800",
        }
      case "pending":
        return {
          icon: <Clock className="h-4 w-4" />,
          label: "ממתין",
          color: "bg-amber-100 text-amber-800",
        }
      case "failed":
      case "canceled":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          label: "נכשל",
          color: "bg-red-100 text-red-800",
        }
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          label: payment.status,
          color: "bg-gray-100 text-gray-800",
        }
    }
  }

  const methodInfo = getPaymentMethodInfo()
  const statusInfo = getStatusInfo()
  const isHyp = payment.payment_method === "hyp"

  // Get potential receipt URL from payment_details for HYP
  const getReceiptUrl = () => {
    if (isHyp && payment.payment_details?.receipt_url) {
      return payment.payment_details.receipt_url
    }

    if (payment.receipt_number) {
      return `/receipts/${payment.receipt_number}.pdf`
    }

    return null
  }

  const receiptUrl = getReceiptUrl()

  return (
    <Card className={cn("w-full transition-all", isHyp && "border-blue-200 shadow-blue-100/50", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{payment.description || "תשלום"}</CardTitle>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Badge variant="outline" className={cn("flex items-center gap-1", methodInfo.color)}>
              {methodInfo.icon}
              <span>{methodInfo.label}</span>
            </Badge>

            <Badge variant="outline" className={cn("flex items-center gap-1", statusInfo.color)}>
              {statusInfo.icon}
              <span>{statusInfo.label}</span>
            </Badge>
          </div>
        </div>
        <CardDescription className="flex items-center pt-1">
          <span>
            {formattedDate} {payment.receipt_number && `• מס' קבלה: ${payment.receipt_number}`}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl font-bold">₪{payment.amount.toLocaleString()}</span>
          </div>

          {isHyp && payment.payment_details?.hyp_payment_id && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="me-1">מזהה תשלום:</span>
                    <span className="font-mono">{payment.payment_details.hyp_payment_id.substring(0, 10)}...</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p dir="ltr">{payment.payment_details.hyp_payment_id}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {isHyp && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md flex items-center text-xs text-blue-700">
            <img src="/abstract-hyp-logo.png" alt="HYP" className="h-4 mr-2 opacity-80" />
            <span>עסקה מאובטחת באמצעות מערכת HYP</span>
          </div>
        )}
      </CardContent>

      {(onViewReceipt || receiptUrl) && (
        <CardFooter className="pt-0 flex justify-end gap-2">
          {onViewReceipt && (
            <Button size="sm" variant="ghost" onClick={() => onViewReceipt(payment)} className="h-8">
              <FileText className="h-4 w-4 mr-1" />
              הצג קבלה
            </Button>
          )}

          {receiptUrl && (
            <Button size="sm" variant="outline" onClick={() => window.open(receiptUrl, "_blank")} className="h-8">
              <Download className="h-4 w-4 mr-1" />
              הורד קבלה
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

export default PaymentHistoryItem
