
import { supabase } from "@/integrations/supabase/client";
import { OrganizationAwareService } from "./OrganizationAwareService";

export class DashboardService {
  static async fetchDashboardData() {
    try {
      const organizationId = await OrganizationAwareService.withOrganizationScope();
      
      // Get current date info
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString();

      // 1. Active Members Count
      const { data: activeMembers, error: activeMembersError } = await supabase
        .from("custom_memberships")
        .select("id, member_id", { count: "exact" })
        .eq("status", "active")
        .eq("organization_id", organizationId)
        .gte("end_date", today);

      if (activeMembersError) throw activeMembersError;

      // 2. Today's Check-ins
      const { data: todayCheckIns, error: todayCheckInsError } = await supabase
        .from("custom_checkins")
        .select("id", { count: "exact" })
        .eq("organization_id", organizationId)
        .gte("check_in_time", `${today}T00:00:00`)
        .lte("check_in_time", `${today}T23:59:59`);

      if (todayCheckInsError) throw todayCheckInsError;

      // 3. Monthly Revenue
      const { data: monthlyRevenue, error: monthlyRevenueError } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "paid")
        .eq("organization_id", organizationId)
        .gte("payment_date", firstDayOfMonth);

      if (monthlyRevenueError) throw monthlyRevenueError;

      // 4. New Subscriptions This Month
      const { data: newSubscriptions, error: newSubscriptionsError } = await supabase
        .from("custom_members")
        .select("id", { count: "exact" })
        .eq("organization_id", organizationId)
        .gte("created_at", firstDayOfMonth);

      if (newSubscriptionsError) throw newSubscriptionsError;

      // 5. Total Debts (Unpaid Payments)
      const { data: totalDebts, error: totalDebtsError } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "pending")
        .eq("organization_id", organizationId);

      if (totalDebtsError) throw totalDebtsError;

      return {
        activeMembers: activeMembers?.length || 0,
        todayCheckIns: todayCheckIns?.length || 0,
        monthlyRevenue: monthlyRevenue?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0,
        newSubscriptions: newSubscriptions?.length || 0,
        totalDebts: totalDebts?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  }
}
