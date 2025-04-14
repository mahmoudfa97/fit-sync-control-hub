"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart } from "@/components/ui/chart"
import { supabase } from "@/integrations/supabase/client"
import { t } from "@/utils/translations"

export function SixMonthsProfit() {
  const [loading, setLoading] = useState(true)
  const [profitData, setProfitData] = useState({
    months: [] as string[],
    revenue: [] as number[],
    expenses: [] as number[],
    profit: [] as number[],
  })

  useEffect(() => {
    async function fetchProfitData() {
      try {
        setLoading(true)

        // Get last 6 months
        const months = Array.from({ length: 6 }, (_, i) => {
          const date = new Date()
          date.setMonth(date.getMonth() - 5 + i)
          return {
            label: date.toLocaleString("default", { month: "short" }),
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            start: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
            end: new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString(),
          }
        })

        // Fetch revenue data (paid payments)
        const { data: revenueData, error: revenueError } = await supabase
          .from("payments")
          .select("amount, payment_date")
          .eq("status", "paid")
          .gte("payment_date", months[0].start)
          .lte("payment_date", months[5].end)

        if (revenueError) throw revenueError

        // Calculate monthly revenue
        const monthlyRevenue = months.map((month) => {
          const monthPayments =
            revenueData?.filter(
              (payment) => payment.payment_date >= month.start && payment.payment_date <= month.end,
            ) || []

          return monthPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
        })

        // For expenses, we'll use a placeholder calculation since we don't have an expenses table
        // In a real app, you would fetch from an expenses table
        const monthlyExpenses = monthlyRevenue.map((revenue) => revenue * 0.6) // Placeholder: 60% of revenue

        // Calculate profit
        const monthlyProfit = monthlyRevenue.map((revenue, i) => revenue - monthlyExpenses[i])

        setProfitData({
          months: months.map((m) => m.label),
          revenue: monthlyRevenue,
          expenses: monthlyExpenses,
          profit: monthlyProfit,
        })
      } catch (error) {
        console.error("Error fetching profit data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfitData()
  }, [])

  // Prepare chart data
  const chartData = {
    labels: profitData.months,
    datasets: [
      {
        label: t("revenue"),
        data: profitData.revenue,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
      },
      {
        label: t("expenses"),
        data: profitData.expenses,
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
      {
        label: t("profit"),
        data: profitData.profit,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  }

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>{t("sixMonthsProfit")}</CardTitle>
        <CardDescription>{t("sixMonthsProfitDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <div className="animate-pulse text-muted-foreground">{t("loading")}</div>
          </div>
        ) : (
          <div className="h-[300px]">
            <LineChart data={chartData} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
