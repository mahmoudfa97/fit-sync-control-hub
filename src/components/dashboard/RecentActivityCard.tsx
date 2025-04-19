"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/integrations/supabase/client"
import { t } from "@/utils/translations"
import { Link } from "react-router-dom"
import { Activity } from "lucide-react"

interface ActivityItem {
  id: string
  type: "checkin" | "payment" | "membership"
  timestamp: string
  profile: {
    id: string
    name: string
    last_name: string | null
    avatar_url: string | null
  }
  details: string
}

export function RecentActivityCard() {
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState<ActivityItem[]>([])

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        setLoading(true)

        // Fetch recent check-ins
        const { data: checkinsData, error: checkinsError } = await supabase
          .from("checkins")
          .select(`
            id,
            check_in_time,
            member_id,
            profiles(id, name, last_name, avatar_url)
          `)
          .order("check_in_time", { ascending: false })
          .limit(5)

        if (checkinsError) throw checkinsError

        // Fetch recent payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select(`
            id,
            payment_date,
            amount,
            payment_method,
            member_id,
            profiles(id, name, last_name, avatar_url)
          `)
          .eq("status", "paid")
          .order("payment_date", { ascending: false })
          .limit(5)

        if (paymentsError) throw paymentsError

        // Fetch recent memberships
        const { data: membershipsData, error: membershipsError } = await supabase
          .from("memberships")
          .select(`
            id,
            created_at,
            membership_type,
            member_id,
            profiles(id, name, last_name, avatar_url)
          `)
          .order("created_at", { ascending: false })
          .limit(5)

        if (membershipsError) throw membershipsError

        // Format check-ins
        const checkinActivities: ActivityItem[] = (checkinsData || []).map((checkin) => ({
          id: `checkin-${checkin.id}`,
          type: "checkin",
          timestamp: checkin.check_in_time,
          profile: {
            id: checkin.profiles.id,
            name: checkin.profiles.name,
            last_name: checkin.profiles.last_name,
            avatar_url: checkin.profiles.avatar_url,
          },
          details: t("checkedIn"),
        }))

        // Format payments
        const paymentActivities: ActivityItem[] = (paymentsData || []).map((payment) => ({
          id: `payment-${payment.id}`,
          type: "payment",
          timestamp: payment.payment_date,
          profile: {
            id: payment.profiles.id,
            name: payment.profiles.name,
            last_name: payment.profiles.last_name,
            avatar_url: payment.profiles.avatar_url,
          },
          details: `${t("paid")} ${payment.amount} ${t("riyal")} ${t("via")} ${payment.payment_method}`,
        }))

        // Format memberships
        const membershipActivities: ActivityItem[] = (membershipsData || []).map((membership) => ({
          id: `membership-${membership.id}\`,  = (membershipsData || []).map((membership) => ({
          id: \`membership-${membership.id}`,
          type: "membership",
          timestamp: membership.created_at,
          profile: {
            id: membership.profiles.id,
            name: membership.profiles.name,
            last_name: membership.profiles.last_name,
            avatar_url: membership.profiles.avatar_url,
          },
          details: `${t("joined")} ${membership.membership_type} ${t("membership")}`,
        }))

        // Combine all activities and sort by timestamp
        const allActivities = [...checkinActivities, ...paymentActivities, ...membershipActivities]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5) // Take only the 5 most recent activities

        setActivities(allActivities)
      } catch (error) {
        console.error("Error fetching recent activity:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentActivity()
  }, [])

  // Get initials from name and last_name
  const getInitials = (name: string, lastName: string | null) => {
    const firstInitial = name ? name[0] : ""
    const lastInitial = lastName ? lastName[0] : ""
    return `${firstInitial}${lastInitial}`
  }

  // Get activity icon color based on type
  const getActivityColor = (type: string) => {
    switch (type) {
      case "checkin":
        return "bg-blue-100 text-blue-800"
      case "payment":
        return "bg-green-100 text-green-800"
      case "membership":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("recentActivity")}</CardTitle>
            <CardDescription>{t("recentActivityDescription")}</CardDescription>
          </div>
          <Activity className="h-5 w-5 opacity-70" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-pulse text-muted-foreground">{t("loading")}</div>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id}>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {activity.profile.avatar_url ? (
                        <AvatarImage src={activity.profile.avatar_url || "/placeholder.svg"} />
                      ) : null}
                      <AvatarFallback className={getActivityColor(activity.type)}>
                        {getInitials(activity.profile.name, activity.profile.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">
                        {`${activity.profile.name} ${activity.profile.last_name || ""}`}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{activity.details}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{activity.timestamp}</div>
                    </div>
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">{t("noRecentActivity")}</div>
            )}
          </div>
        )}
        <Button variant="ghost" className="w-full mt-4 text-primary" asChild>
          <Link to="/activity">{t("viewAll")}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
