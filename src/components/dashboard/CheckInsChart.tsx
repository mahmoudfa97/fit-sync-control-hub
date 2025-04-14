"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart } from "@/components/ui/chart"
import { supabase } from "@/integrations/supabase/client"
import { t } from "@/utils/translations"

export function CheckInsChart() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("week")
  const [checkInData, setCheckInData] = useState({
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
    async function fetchCheckInData() {
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

        // Fetch check-in data
        const { data, error } = await supabase
          .from("checkins")
          .select("check_in_time")
          .gte("check_in_time", yearStart.toISOString())
          .order("check_in_time")

        if (error) throw error

        // Process weekly data
        const weekLabels = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now)
          date.setDate(date.getDate() - 6 + i)
          return date.toLocaleDateString("he-IL", { weekday: "short" })
        })

        const weekData = Array(7).fill(0)
        data?.forEach((checkIn) => {
          const checkInDate = new Date(checkIn.check_in_time)
          if (checkInDate >= weekStart) {
            const dayIndex = Math.floor((checkInDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24))
            if (dayIndex >= 0 && dayIndex < 7) {
              weekData[dayIndex]++
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
        data?.forEach((checkIn) => {
          const checkInDate = new Date(checkIn.check_in_time)
          if (checkInDate >= monthStart) {
            const dayIndex = Math.floor((checkInDate.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24))
            if (dayIndex >= 0 && dayIndex < 30) {
              monthData[dayIndex]++
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
        data?.forEach((checkIn) => {
          const checkInDate = new Date(checkIn.check_in_time)
          if (checkInDate >= yearStart) {
            const monthIndex = (checkInDate.getMonth() - yearStart.getMonth() + 12) % 12
            if (monthIndex >= 0 && monthIndex < 12) {
              yearData[monthIndex]++
            }
          }
        })

        setCheckInData({
          week: { labels: weekLabels, data: weekData },
          month: { labels: monthLabels, data: monthData },
          year: { labels: yearLabels, data: yearData },
        })
      } catch (error) {
        console.error("Error fetching check-in data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCheckInData()
  }, [])

  // Prepare chart data
  const chartData = {
    labels: checkInData[activeTab as keyof typeof checkInData].labels,
    datasets: [
      {
        label: t("checkIns"),
        data: checkInData[activeTab as keyof typeof checkInData].data,
        backgroundColor: "#3b82f6",
        borderRadius: 4,
      },
    ],
  }

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader className="pb-2">
        <CardTitle>{t("checkInsOverTime")}</CardTitle>
        <CardDescription>{t("checkInsOverTimeDescription")}</CardDescription>
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
