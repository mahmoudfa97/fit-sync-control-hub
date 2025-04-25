"use client"

import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardShell } from "@/components/layout/DashboardShell"
import PaymentReportPage from "./PaymentReportPage"
import FinancialDocumentsReport from "./FinancialDocumentsReport"
import DebtsReport from "./DebtsReport"
import { supabase } from "@/integrations/supabase/client"

interface FinanceSummary {
  totalPayments: number
  totalInvoices: number
  totalDebts: number
  revenueThisMonth: number
}

export default function FinanceReportsPage() {
  const location = useLocation()
  const paymentReportRef = useRef<HTMLDivElement>(null)
  const financialDocumentsRef = useRef<HTMLDivElement>(null)
  const debtsReportRef = useRef<HTMLDivElement>(null)
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary>({
    totalPayments: 0,
    totalInvoices: 0,
    totalDebts: 0,
    revenueThisMonth: 0,
  })
  const [loading, setLoading] = useState(true)

  // Determine which tab to show based on the hash
  const getDefaultTab = () => {
    const hash = decodeURIComponent(location.hash.replace("#", ""))

    if (hash === "דוח תקבולים") return "payments"
    if (hash === "דוח מסמכים פיננסים") return "documents"
    if (hash === "דוח חובות") return "debts"

    return "payments" // Default tab
  }

  // Fetch summary data for the finance reports
  const fetchFinanceSummary = async () => {
    try {
      setLoading(true)

      // Get total payments
      const { count: paymentsCount, error: paymentsError } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })

      if (paymentsError) throw paymentsError

      // Get total revenue this month
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

      const { data: monthlyPayments, error: monthlyError } = await supabase
        .from("payments")
        .select("amount")
        .gte("payment_date", firstDayOfMonth)
        .lte("payment_date", lastDayOfMonth)

      if (monthlyError) throw monthlyError

      const revenueThisMonth = monthlyPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0

      // Calculate total debts (simplified approach)
      // In a real implementation, this would be more complex based on your business logic
      const { data: membersData, error: membersError } = await supabase.from("custom_members").select(`
          id,
          custom_memberships (
            membership_type
          ),
          payments (
            amount
          )
        `)

      if (membersError) throw membersError

      let totalDebts = 0

      membersData?.forEach((member) => {
        const memberships = member.custom_memberships || []
        const payments = member.payments || []

        // Calculate expected payment based on membership type
        const expectedPayment = memberships.length > 0 ? (memberships[0].membership_type === "premium" ? 200 : 100) : 0

        // Calculate actual payment
        const actualPayment = payments.reduce((sum, payment) => sum + payment.amount, 0)

        // Add to total debts if there's a shortfall
        if (expectedPayment > actualPayment) {
          totalDebts += expectedPayment - actualPayment
        }
      })

      // Get total invoices (assuming you have an invoices table or using payment records as invoices)
      // For this example, we'll use the same count as payments
      const totalInvoices = paymentsCount || 0

      setFinanceSummary({
        totalPayments: paymentsCount || 0,
        totalInvoices,
        totalDebts,
        revenueThisMonth,
      })
    } catch (error) {
      console.error("Error fetching finance summary:", error)
    } finally {
      setLoading(false)
    }
  }

  // Scroll to the appropriate section when hash changes
  useEffect(() => {
    const hash = decodeURIComponent(location.hash.replace("#", ""))

    if (hash === "דוח תקבולים" && paymentReportRef.current) {
      paymentReportRef.current.scrollIntoView({ behavior: "smooth" })
    } else if (hash === "דוח מסמכים פיננסים" && financialDocumentsRef.current) {
      financialDocumentsRef.current.scrollIntoView({ behavior: "smooth" })
    } else if (hash === "דוח חובות" && debtsReportRef.current) {
      debtsReportRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [location.hash])

  // Fetch summary data on component mount
  useEffect(() => {
    fetchFinanceSummary()
  }, [])

  return (
    <DashboardShell>
      <div className="container px-4 py-6 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">דוחות פיננסיים</h1>
        </div>

        {/* Finance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-muted-foreground">סה"כ תקבולים</div>
            <div className="text-2xl font-bold">{loading ? "טוען..." : financeSummary.totalPayments}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-muted-foreground">סה"כ חשבוניות</div>
            <div className="text-2xl font-bold">{loading ? "טוען..." : financeSummary.totalInvoices}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-muted-foreground">סה"כ חובות</div>
            <div className="text-2xl font-bold text-red-600">
              ₪{loading ? "טוען..." : financeSummary.totalDebts.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-muted-foreground">הכנסות החודש</div>
            <div className="text-2xl font-bold text-green-600">
              ₪{loading ? "טוען..." : financeSummary.revenueThisMonth.toLocaleString()}
            </div>
          </div>
        </div>

        <Tabs defaultValue={getDefaultTab()} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="payments">דוח תקבולים</TabsTrigger>
            <TabsTrigger value="documents">דוח מסמכים פיננסים</TabsTrigger>
            <TabsTrigger value="debts">דוח חובות</TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <div ref={paymentReportRef}>
              <PaymentReportPage />
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div ref={financialDocumentsRef}>
              <FinancialDocumentsReport />
            </div>
          </TabsContent>

          <TabsContent value="debts">
            <div ref={debtsReportRef}>
              <DebtsReport />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
