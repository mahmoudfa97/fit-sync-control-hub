"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart } from "@/components/ui/chart"
import { supabase } from "@/integrations/supabase/client"
import { t } from "@/utils/translations"

export function CheckInsHourlyForecast() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("today")
  const [hourlyData, setHourlyData] = useState({
    today: Array(24).fill(0),
    yesterday: Array(24).fill(0),
    thisWeek: Array(24).fill(0),
  })

  useEffect(() => {
    async function fetchHourlyData() {
      try {
        setLoading(true)

        // Get date ranges
        const now = new Date()
        const today = now.toISOString().split("T")[0]

        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split("T")[0]

        const weekStart = new Date(now)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        const weekStartStr = weekStart.toISOString().split("T")[0]

        // Fetch today's check-ins
        const { data: todayData, error: todayError } = await supabase
          .from("checkins")
          .select("check_in_time")
          .gte("check_in_time", `${today}T00:00:00`)
          .lte("check_in_time", `${today}T23:59:59`)

        if (todayError) throw todayError

        // Fetch yesterday's check-ins
        const { data: yesterdayData, error: yesterdayError } = await supabase
          .from("checkins")
          .select("check_in_time")
          .gte("check_in_time", `${yesterdayStr}T00:00:00`)
          .lte("check_in_time", `${yesterdayStr}T23:59:59`)

        if (yesterdayError) throw yesterdayError

        // Fetch this week's check-ins
        const { data: weekData, error: weekError } = await supabase
          .from("checkins")
          .select("check_in_time")
          .gte("check_in_time", `${weekStartStr}T00:00:00`)
          .lte("check_in_time", `${today}T23:59:59`)

        if (weekError) throw weekError

        // Process hourly data
        const todayHourly = processHourlyData(todayData || [])
        const yesterdayHourly = processHourlyData(yesterdayData || [])
        const weekHourly = processHourlyData(weekData || [])

        setHourlyData({
          today: todayHourly,
          yesterday: yesterdayHourly,
          thisWeek: weekHourly.map((count) => Math.round(count / (now.getDay() || 7))), // Average per day
        })
      } catch (error) {
        console.error("Error fetching hourly check-in data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHourlyData()
  }, [])

  // Process check-in data into hourly counts
  const processHourlyData = (data: any[]): number[] => {
    const hourly = Array(24).fill(0)

    data.forEach((item) => {
      if (item.check_in_time) {
        const hour = new Date(item.check_in_time).getHours()
        hourly[hour]++
      }
    })

    return hourly
  }

  // Prepare chart data
  const chartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: t("checkIns"),
        data: hourlyData[activeTab as keyof typeof hourlyData],
        backgroundColor: "#3b82f6",
        borderRadius: 4,
      },
    ],
  }

  return (
    <Card className="col-span-1 lg:col-span-5">
      <CardHeader className="pb-2">
        <CardTitle>{t("checkInsHourlyForecast")}</CardTitle>
        <CardDescription>{t("checkInsHourlyForecastDescription")}</CardDescription>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">{t("today")}</TabsTrigger>
            <TabsTrigger value="yesterday">{t("yesterday")}</TabsTrigger>
            <TabsTrigger value="thisWeek">{t("thisWeekAvg")}</TabsTrigger>
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
