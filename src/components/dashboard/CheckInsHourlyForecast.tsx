"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/integrations/supabase/client"
import { t } from "@/utils/translations"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

export function CheckInsHourlyForecast() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("today")
  const [chartData, setChartData] = useState<Array<{ hour: string; count: number }>>([])

  useEffect(() => {
    async function fetchHourlyData() {
      try {
        setLoading(true)
        console.log("Fetching hourly data...")

        // Get date ranges
        const now = new Date()
        const today = now.toISOString().split("T")[0]

        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split("T")[0]

        const weekStart = new Date(now)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        const weekStartStr = weekStart.toISOString().split("T")[0]

        let dateRange
        if (activeTab === "today") {
          dateRange = {
            start: `${today}T00:00:00`,
            end: `${today}T23:59:59`,
          }
        } else if (activeTab === "yesterday") {
          dateRange = {
            start: `${yesterdayStr}T00:00:00`,
            end: `${yesterdayStr}T23:59:59`,
          }
        } else {
          // thisWeek
          dateRange = {
            start: `${weekStartStr}T00:00:00`,
            end: `${today}T23:59:59`,
          }
        }

        // Fetch check-ins for the selected date range
        const { data, error } = await supabase
          .from("custom_checkins")
          .select("check_in_time")
          .gte("check_in_time", dateRange.start)
          .lte("check_in_time", dateRange.end)

        if (error) {
          console.error("Error fetching data:", error)
          throw error
        }

        console.log(`${activeTab} data:`, data)

        // Process hourly data
        const hourly = Array(24).fill(0)

        data?.forEach((item) => {
          if (item.check_in_time) {
            // Extract hour directly from the ISO string
            const timeStr = item.check_in_time
            const hour = Number.parseInt(timeStr.substring(11, 13), 10)
            hourly[hour]++
          }
        })

        console.log(`Processed ${activeTab} hourly:`, hourly)

        // If this is weekly data and we want to show average
        if (activeTab === "thisWeek") {
          const dayCount = now.getDay() || 7 // 0 is Sunday, so use 7 instead
          hourly.forEach((count, index) => {
            hourly[index] = Math.round(count / dayCount)
          })
        }

        // Format data for the chart
        const formattedData = hourly.map((count, index) => ({
          hour: `${index}:00`,
          count: count,
        }))

        setChartData(formattedData)
      } catch (error) {
        console.error("Error fetching hourly check-in data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHourlyData()
  }, [activeTab]) // Re-fetch when tab changes

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
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="hour"
                  tickFormatter={(value) => value.split(":")[0]}
                  interval={2} // Show every 3rd hour to avoid crowding
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} ${t("checkIns")}`, ""]}
                  labelFormatter={(label) => `${t("hour")}: ${label}`}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name={t("checkIns")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
