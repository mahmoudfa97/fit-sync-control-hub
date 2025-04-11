
import { 
  Users, 
  CalendarClock, 
  CreditCard, 
  TrendingUp,
  FileText,
  Receipt,
  AlertTriangle
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatCardWithChart } from "@/components/dashboard/StatCardWithChart";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { MembershipExpiryCard } from "@/components/dashboard/MembershipExpiryCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { CheckInsChart } from "@/components/dashboard/CheckInsChart";
import { CheckInsHourlyForecast } from "@/components/dashboard/CheckInsHourlyForecast";
import { SixMonthsProfit } from "@/components/dashboard/SixMonthsProfit";
import { ActiveMembersByGroup } from "@/components/dashboard/ActiveMembersByGroup";
import { ExpiringMembersCard } from "@/components/dashboard/ExpiringMembersCard";
import { RecentlyAddedMembersCard } from "@/components/dashboard/RecentlyAddedMembersCard";
import { t } from "@/utils/translations";

// Chart data for stat cards
const debtsChartData = [
  { value: 1200 },
  { value: 1800 },
  { value: 1900 },
  { value: 1600 },
  { value: 2200 },
  { value: 2000 },
];

const receiptsChartData = [
  { value: 5400 },
  { value: 6200 },
  { value: 5900 },
  { value: 6800 },
  { value: 7100 },
  { value: 7350 },
];

const invoicesChartData = [
  { value: 6400 },
  { value: 7200 },
  { value: 6900 },
  { value: 7300 },
  { value: 8200 },
  { value: 8850 },
];

const activeMembersData = [
  { value: 1150 },
  { value: 1180 },
  { value: 1210 },
  { value: 1230 },
  { value: 1240 },
  { value: 1247 },
];

export default function Dashboard() {
  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
          <p className="text-muted-foreground">
            {t("welcome")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCardWithChart
          title={t("activeMembers")}
          value="1,247"
          icon={Users}
          trend={{ value: 12, positive: true }}
          chartType="area"
          chartData={activeMembersData}
          chartColor="#3b82f6"
        />
        <StatCard
          title={t("todayCheckIns")}
          value="189"
          icon={CalendarClock}
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          title={t("monthlyRevenue")}
          value={`25,800 ${t("riyal")}`}
          icon={CreditCard}
          trend={{ value: 14, positive: true }}
        />
        <StatCard
          title={t("newSubscriptions")}
          value="24"
          icon={TrendingUp}
          trend={{ value: 2.5, positive: false }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCardWithChart
          title={t("totalDebts")}
          value="-₪2,000.00"
          icon={AlertTriangle}
          trend={{ value: 5, positive: false }}
          chartType="area"
          chartData={debtsChartData}
          chartColor="#ef4444"
        />
        <StatCardWithChart
          title={t("totalReceipts")}
          value="₪7,350.00"
          icon={Receipt}
          trend={{ value: 7, positive: true }}
          chartType="area"
          chartData={receiptsChartData}
          chartColor="#22c55e"
        />
        <StatCardWithChart
          title={t("totalInvoices")}
          value="₪8,850.00"
          icon={FileText}
          trend={{ value: 10, positive: true }}
          chartType="area"
          chartData={invoicesChartData}
          chartColor="#f59e0b"
        />
        <StatCard
          title="השוואה חודשית"
          value="₪1,500.00"
          icon={TrendingUp}
          trend={{ value: 4, positive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <CheckInsHourlyForecast />
        <ExpiringMembersCard />
        <RecentlyAddedMembersCard />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <SixMonthsProfit />
        <ActiveMembersByGroup />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <RevenueChart />
        <MembershipExpiryCard />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <CheckInsChart />
        <RecentActivityCard />
      </div>
    </DashboardShell>
  );
}
