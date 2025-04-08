
import { 
  Users, 
  CalendarClock, 
  CreditCard, 
  TrendingUp 
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { MembershipExpiryCard } from "@/components/dashboard/MembershipExpiryCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { CheckInsChart } from "@/components/dashboard/CheckInsChart";

export default function Dashboard() {
  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
          <p className="text-muted-foreground">
            مرحبًا بعودتك! إليك ما يحدث في صالتك الرياضية اليوم.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <StatCard
          title="الأعضاء النشطين"
          value="1,247"
          icon={Users}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="تسجيلات الحضور اليوم"
          value="189"
          icon={CalendarClock}
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          title="إيرادات الشهر"
          value="25,800 ريال"
          icon={CreditCard}
          trend={{ value: 14, positive: true }}
        />
        <StatCard
          title="اشتراكات جديدة"
          value="24"
          icon={TrendingUp}
          trend={{ value: 2.5, positive: false }}
        />
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
