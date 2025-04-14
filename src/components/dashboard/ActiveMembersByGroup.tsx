"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart } from "@/components/ui/chart"
import { supabase } from "@/integrations/supabase/client"
import { t } from "@/utils/translations"

export function ActiveMembersByGroup() {
  const [loading, setLoading] = useState(true)
  const [membershipData, setMembershipData] = useState({
    labels: [] as string[],
    counts: [] as number[],
  })

  useEffect(() => {
    async function fetchMembershipData() {
      try {
        setLoading(true)

        // Get current date
        const today = new Date().toISOString().split("T")[0]

        // Fetch active memberships grouped by type
        const { data, error } = await supabase
          .from("memberships")
          .select("membership_type")
          .eq("status", "active")
          .gte("end_date", today)

        if (error) throw error

        // Count memberships by type
        const membershipCounts: Record<string, number> = {}

        data?.forEach((membership) => {
          const type = membership.membership_type || "אחר"
          membershipCounts[type] = (membershipCounts[type] || 0) + 1
        })

        // Sort by count (descending)
        const sortedTypes = Object.entries(membershipCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5) // Top 5 membership types

        setMembershipData({
          labels: sortedTypes.map(([type]) => type),
          counts: sortedTypes.map(([_, count]) => count),
        })
      } catch (error) {
        console.error("Error fetching membership data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembershipData()
  }, [])

  // Prepare chart data
  const chartData = {
    labels: membershipData.labels,
    datasets: [
      {
        label: t("members"),
        data: membershipData.counts,
        backgroundColor: [
          "#3b82f6", // Blue
          "#22c55e", // Green
          "#f59e0b", // Amber
          "#8b5cf6", // Purple
          "#ec4899", // Pink
        ],
        borderWidth: 1,
        borderColor: "#ffffff",
      },
    ],
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>{t("activeMembersByGroup")}</CardTitle>
        <CardDescription>{t("activeMembersByGroupDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <div className="animate-pulse text-muted-foreground">{t("loading")}</div>
          </div>
        ) : (
          <div className="h-[300px] flex justify-center">
            <PieChart data={chartData} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
