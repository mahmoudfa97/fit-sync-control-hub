"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart } from "@/components/ui/chart"
import { supabase } from "@/integrations/supabase/client"
import { t } from "@/utils/translations"

export function RevenueChart() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("week")
  const [revenueData, setRevenueData] = useState({
    week: {
      labels: [] as string[],
      data: [] as number[],
    },
    month: {
      labels: [] as string[],
      data: [] as number[],
    },
    year: {
      labels: [] as string[],
      data: [] as number[],
    },
  })

  useEffect(() => {
    async function fetchRevenueData() {
      try {
        setLoading(true)

        // Get date ranges
        const now = new Date()

        // Week: last 7 days
        const weekStart = new Date(now)
        weekStart.setDate(weekStart.getDate() - 6)

        // Month: last 30 days
        const monthStart = new Date(now)
        monthStart.setDate(monthStart.getDate() - 29)

        // Year: last 12 months
        const yearStart = new Date(now)
        yearStart.setMonth(yearStart.getMonth() - 11)

        // Fetch revenue data
        const { data, error } = await supabase
          .from("payments")
          .select("amount, payment_date")
          .eq("status", "paid")
          .gte("payment_date", yearStart.toISOString())
          .order("payment_date")

        if (error) throw error

        // Process weekly data
        const weekLabels = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now)
          date.setDate(date.getDate() - 6 + i)
          return date.toLocaleDateString("he-IL", { weekday: "short" })
        })

        const weekData = Array(7).fill(0)
        data?.forEach((payment) => {
          const paymentDate = new Date(payment.payment_date)
          if (paymentDate >= weekStart) {
            const dayIndex = Math.floor((paymentDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24))
            if (dayIndex >= 0 && dayIndex < 7) {
              weekData[dayIndex] += payment.amount || 0
            }
          }
        })

        // Process monthly data
        const monthLabels = Array.from({ length: 30 }, (_, i) => {
          const date = new Date(now)
          date.setDate(date.getDate() - 29 + i)
          return date.getDate().toString()
        })

        const monthData = Array(30).fill(0)
        data?.forEach((payment) => {
          const paymentDate = new Date(payment.payment_date)
          if (paymentDate >= monthStart) {
            const dayIndex = Math.floor((paymentDate.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24))
            if (dayIndex >= 0 && dayIndex < 30) {
              monthData[dayIndex] += payment.amount || 0
            }
          }
        })

        // Process yearly data
        const yearLabels = Array.from({ length: 12 }, (_, i) => {
          const date = new Date(now)
          date.setMonth(date.getMonth() - 11 + i)
          return date.toLocaleString("default", { month: "short" })
        })

        const yearData = Array(12).fill(0)
        data?.forEach((payment) => {
          const paymentDate = new Date(payment.payment_date)
          if (paymentDate >= yearStart) {
            const monthIndex = (paymentDate.getMonth() - yearStart.getMonth() + 12) % 12
            if (monthIndex >= 0 && monthIndex < 12) {
              yearData[monthIndex] += payment.amount || 0
            }
          }
        })

        setRevenueData({
          week: { labels: weekLabels, data: weekData },
          month: { labels: monthLabels, data: monthData },
          year: { labels: yearLabels, data: yearData },
        })
      } catch (error) {
        console.error("Error fetching revenue data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRevenueData()
  }, [])

  // Prepare chart data
  const chartData = {
    labels: revenueData[activeTab as keyof typeof revenueData].labels,
    datasets: [
      {
        label: t("revenue"),
        data: revenueData[activeTab as keyof typeof revenueData].data,
        backgroundColor: "#22c55e",
        borderRadius: 4,
      },
    ],
  }

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader className="pb-2">
        <CardTitle>{t("revenueOverTime")}</CardTitle>
        <CardDescription>{t("revenueOverTimeDescription")}</CardDescription>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">{t("week")}</TabsTrigger>
            <TabsTrigger value="month">{t("month")}</TabsTrigger>
            <TabsTrigger value="year">{t("year")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <div className="animate-pulse text-muted-foreground">{t("loading")}</div>
          </div>
        ) : (
          <div className="h-[300px]">
            <BarChart data={chartData} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
