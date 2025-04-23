"use client"

import { useState, useEffect } from "react"
import { Users, CalendarClock, CreditCard, TrendingUp, FileText, Receipt, AlertTriangle } from "lucide-react"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { StatCard } from "@/components/dashboard/StatCard"
import { StatCardWithChart } from "@/components/dashboard/StatCardWithChart"
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard"
import { MembershipExpiryCard } from "@/components/dashboard/MembershipExpiryCard"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { CheckInsChart } from "@/components/dashboard/CheckInsChart"
import { CheckInsHourlyForecast } from "@/components/dashboard/CheckInsHourlyForecast"
import { SixMonthsProfit } from "@/components/dashboard/SixMonthsProfit"
import { ActiveMembersByGroup } from "@/components/dashboard/ActiveMembersByGroup"
import { ExpiringMembersCard } from "@/components/dashboard/ExpiringMembersCard"
import { RecentlyAddedMembersCard } from "@/components/dashboard/RecentlyAddedMembersCard"
import { t } from "@/utils/translations"
import { supabase } from "@/integrations/supabase/client"
import { useDashboardPrivacy } from "@/hooks/useDashboardPrivacy"
import { formatPrivateValue } from "@/utils/formatters"
import { ExpiredMembersCard } from "@/components/dashboard/ExpiredMembersCard"

export default function Dashboard() {
  // State for dashboard data
  const { hideNumbers } = useDashboardPrivacy();
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    activeMembers: {
      count: 0,
      trend: 0,
      chartData: [] as { value: number }[],
    },
    todayCheckIns: {
      count: 0,
      trend: 0,
    },
    monthlyRevenue: {
      amount: 0,
      trend: 0,
    },
    newSubscriptions: {
      count: 0,
      trend: 0,
    },
    totalDebts: {
      amount: 0,
      trend: 0,
      chartData: [] as { value: number }[],
    },
    totalReceipts: {
      amount: 0,
      trend: 0,
      chartData: [] as { value: number }[],
    },
    totalInvoices: {
      amount: 0,
      trend: 0,
      chartData: [] as { value: number }[],
    },
    monthlyComparison: {
      amount: 0,
      trend: 0,
    },
  })

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      try {
        // Get current date info
        const now = new Date()
        const today = now.toISOString().split("T")[0]
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString()

        // 1. Active Members Count
        const { data: activeMembers, error: activeMembersError } = await supabase
          .from("custom_memberships")
          .select("id, member_id", { count: "exact" })
          .eq("status", "active")
          .gte("end_date", today)

        if (activeMembersError) throw activeMembersError

        // 2. Active Members Trend (last 6 months)
        const { data: activeMembersTrend, error: activeMembersTrendError } = await supabase
          .from("custom_memberships")
          .select("created_at")
          .eq("status", "active")
          .gte("created_at", sixMonthsAgo)
          .order("created_at")

        if (activeMembersTrendError) throw activeMembersTrendError

        // Process active members trend data for chart
        const activeMembersChartData = processMonthlyTrendData(activeMembersTrend || [])

        // 3. Today's Check-ins
        const { data: todayCheckIns, error: todayCheckInsError } = await supabase
          .from("custom_checkins")
          .select("id", { count: "exact" })
          .gte("check_in_time", `${today}T00:00:00`)
          .lte("check_in_time", `${today}T23:59:59`)

        if (todayCheckInsError) throw todayCheckInsError

        // 4. Yesterday's Check-ins (for trend)
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split("T")[0]

        const { data: yesterdayCheckIns, error: yesterdayCheckInsError } = await supabase
          .from("custom_checkins")
          .select("id", { count: "exact" })
          .gte("check_in_time", `${yesterdayStr}T00:00:00`)
          .lte("check_in_time", `${yesterdayStr}T23:59:59`)

        if (yesterdayCheckInsError) throw yesterdayCheckInsError

        // 5. Monthly Revenue
        const { data: monthlyRevenue, error: monthlyRevenueError } = await supabase
          .from("payments")
          .select("amount")
          .eq("status", "paid")
          .gte("payment_date", firstDayOfMonth)

        if (monthlyRevenueError) throw monthlyRevenueError

        const totalMonthlyRevenue = monthlyRevenue?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

        // 6. Last Month Revenue (for trend)
        const { data: lastMonthRevenue, error: lastMonthRevenueError } = await supabase
          .from("payments")
          .select("amount")
          .eq("status", "paid")
          .gte("payment_date", lastMonth)
          .lt("payment_date", firstDayOfMonth)

        if (lastMonthRevenueError) throw lastMonthRevenueError

        const totalLastMonthRevenue = lastMonthRevenue?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
        const revenueTrend =
          totalLastMonthRevenue > 0
            ? ((totalMonthlyRevenue - totalLastMonthRevenue) / totalLastMonthRevenue) * 100
            : 100

        // 7. New Subscriptions This Month
        const { data: newSubscriptions, error: newSubscriptionsError } = await supabase
          .from("custom_members")
          .select("id", { count: "exact" })
          .gte("created_at", firstDayOfMonth)

        if (newSubscriptionsError) throw newSubscriptionsError

        // 8. New Subscriptions Last Month (for trend)
        const { data: lastMonthSubscriptions, error: lastMonthSubscriptionsError } = await supabase
          .from("custom_members")
          .select("id", { count: "exact" })
          .gte("created_at", lastMonth)
          .lt("created_at", firstDayOfMonth)

        if (lastMonthSubscriptionsError) throw lastMonthSubscriptionsError

        const subscriptionsTrend =
          lastMonthSubscriptions?.length > 0
            ? ((newSubscriptions?.length - lastMonthSubscriptions?.length) / lastMonthSubscriptions?.length) * 100
            : 100

        // 9. Total Debts (Unpaid Payments)
        const { data: totalDebts, error: totalDebtsError } = await supabase
          .from("payments")
          .select("amount")
          .eq("status", "pending")

        if (totalDebtsError) throw totalDebtsError

        const debtsAmount = totalDebts?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

        // 10. Total Receipts (Paid Payments)
        const { data: totalReceipts, error: totalReceiptsError } = await supabase
          .from("payments")
          .select("amount, payment_date")
          .eq("status", "paid")
          .order("payment_date")

        if (totalReceiptsError) throw totalReceiptsError

        const receiptsAmount = totalReceipts?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

        // 11. Total Invoices (All Payments)
        const { data: totalInvoices, error: totalInvoicesError } = await supabase
          .from("payments")
          .select("amount, payment_date")
          .order("payment_date")

        if (totalInvoicesError) throw totalInvoicesError

        const invoicesAmount = totalInvoices?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

        // Process monthly trend data for charts
        const debtsChartData = processMonthlyAmountData(totalDebts || [], "amount", 6)
        const receiptsChartData = processMonthlyAmountData(totalReceipts || [], "amount", 6)
        const invoicesChartData = processMonthlyAmountData(totalInvoices || [], "amount", 6)

        // 12. Monthly Comparison (This month vs last month)
        const monthlyComparison = totalMonthlyRevenue - totalLastMonthRevenue
        const monthlyComparisonTrend =
          totalLastMonthRevenue > 0 ? (monthlyComparison / totalLastMonthRevenue) * 100 : 100

        // Update dashboard data
        setDashboardData({
          activeMembers: {
            count: activeMembers?.length || 0,
            trend: calculateTrend(activeMembers?.length || 0, activeMembersChartData[4]?.value || 0),
            chartData: activeMembersChartData,
          },
          todayCheckIns: {
            count: todayCheckIns?.length || 0,
            trend: calculateTrend(todayCheckIns?.length || 0, yesterdayCheckIns?.length || 0),
          },
          monthlyRevenue: {
            amount: totalMonthlyRevenue,
            trend: revenueTrend,
          },
          newSubscriptions: {
            count: newSubscriptions?.length || 0,
            trend: subscriptionsTrend,
          },
          totalDebts: {
            amount: debtsAmount,
            trend: calculateTrend(debtsChartData[5]?.value || 0, debtsChartData[4]?.value || 0),
            chartData: debtsChartData,
          },
          totalReceipts: {
            amount: receiptsAmount,
            trend: calculateTrend(receiptsChartData[5]?.value || 0, receiptsChartData[4]?.value || 0),
            chartData: receiptsChartData,
          },
          totalInvoices: {
            amount: invoicesAmount,
            trend: calculateTrend(invoicesChartData[5]?.value || 0, invoicesChartData[4]?.value || 0),
            chartData: invoicesChartData,
          },
          monthlyComparison: {
            amount: monthlyComparison,
            trend: monthlyComparisonTrend,
          },
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Helper function to calculate trend percentage
  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  // Helper function to process monthly trend data for charts
  const processMonthlyTrendData = (data: any[]): { value: number }[] => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - 5 + i)
      return date.toISOString().substring(0, 7) // YYYY-MM format
    })

    const monthCounts = last6Months.map((month) => {
      const count = data.filter((item) => item.created_at.startsWith(month)).length
      return { value: count }
    })

    return monthCounts
  }

  // Helper function to process monthly amount data for charts
  const processMonthlyAmountData = (data: any[], amountField: string, months: number): { value: number }[] => {
    const lastMonths = Array.from({ length: months }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (months - 1) + i)
      return date.toISOString().substring(0, 7) // YYYY-MM format
    })

    const monthlyAmounts = lastMonths.map((month) => {
      const amount = data
        .filter((item) => item.payment_date?.startsWith(month))
        .reduce((sum, item) => sum + (item[amountField] || 0), 0)
      return { value: amount }
    })

    return monthlyAmounts
  }

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
          <p className="text-muted-foreground">{t("welcome")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCardWithChart
          title={t("activeMembers")}
          value={loading ? "..." : dashboardData.activeMembers.count.toString()}
          icon={Users}
          trend={{
            value: loading ? 0 : Math.round(dashboardData.activeMembers.trend * 10) / 10,
            positive: dashboardData.activeMembers.trend >= 0,
          }}
          chartType="area"
          chartData={dashboardData.activeMembers.chartData}
          chartColor="#3b82f6"
          valueIsRaw={true}
        />
        <StatCard
          title={t("todayCheckIns")}
          value={loading ? "..." : dashboardData.todayCheckIns.count.toString()}
          icon={CalendarClock}
          trend={{
            value: loading ? 0 : Math.round(dashboardData.todayCheckIns.trend * 10) / 10,
            positive: dashboardData.todayCheckIns.trend >= 0,
          }}
          valueIsRaw={true}
        />
        <StatCard
          title={t("monthlyRevenue")}
          value={loading ? "..." : formatPrivateValue(dashboardData.monthlyRevenue.amount, hideNumbers)}
          icon={CreditCard}
          trend={{
            value: loading ? 0 : Math.round(dashboardData.monthlyRevenue.trend * 10) / 10,
            positive: dashboardData.monthlyRevenue.trend >= 0,
          }}
        />
        <StatCard
          title={t("newSubscriptions")}
          value={loading ? "..." : dashboardData.newSubscriptions.count.toString()}
          icon={TrendingUp}
          trend={{
            value: loading ? 0 : Math.round(dashboardData.newSubscriptions.trend * 10) / 10,
            positive: dashboardData.newSubscriptions.trend >= 0,
          }}
          valueIsRaw={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCardWithChart
          title={t("totalDebts")}
          value={loading ? "..." : `-${formatPrivateValue(dashboardData.totalDebts.amount, hideNumbers)}`}
          icon={AlertTriangle}
          trend={{
            value: loading ? 0 : Math.round(dashboardData.totalDebts.trend * 10) / 10,
            positive: dashboardData.totalDebts.trend < 0, // For debts, negative trend is positive
          }}
          chartType="area"
          chartData={dashboardData.totalDebts.chartData}
          chartColor="#ef4444"
        />
        <StatCardWithChart
          title={t("totalReceipts")}
          value={loading ? "..." : formatPrivateValue(dashboardData.totalReceipts.amount, hideNumbers)}
          icon={Receipt}
          trend={{
            value: loading ? 0 : Math.round(dashboardData.totalReceipts.trend * 10) / 10,
            positive: dashboardData.totalReceipts.trend >= 0,
          }}
          chartType="area"
          chartData={dashboardData.totalReceipts.chartData}
          chartColor="#22c55e"
        />
        <StatCardWithChart
          title={t("totalInvoices")}
          value={loading ? "..." : formatPrivateValue(dashboardData.totalInvoices.amount, hideNumbers)}
          icon={FileText}
          trend={{
            value: loading ? 0 : Math.round(dashboardData.totalInvoices.trend * 10) / 10,
            positive: dashboardData.totalInvoices.trend >= 0,
          }}
          chartType="area"
          chartData={dashboardData.totalInvoices.chartData}
          chartColor="#f59e0b"
        />
        <StatCard
          title={t("monthlyComparison")}
          value={loading ? "..." : formatPrivateValue(dashboardData.monthlyComparison.amount, hideNumbers)}
          icon={TrendingUp}
          trend={{
            value: loading ? 0 : Math.round(dashboardData.monthlyComparison.trend * 10) / 10,
            positive: dashboardData.monthlyComparison.trend >= 0,
          }}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        
        <CheckInsHourlyForecast />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <ExpiringMembersCard />
        <RecentActivityCard />
        <ExpiredMembersCard />
        <RecentlyAddedMembersCard />
        <CheckInsChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <SixMonthsProfit />
        <ActiveMembersByGroup />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <RevenueChart />
        <MembershipExpiryCard />
      </div>

      
    </DashboardShell>
  )
}

