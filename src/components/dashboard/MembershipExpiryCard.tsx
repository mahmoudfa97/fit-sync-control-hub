"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/integrations/supabase/client"
import { formatDate } from "@/utils/format"
import { t } from "@/utils/translations"
import { Link } from "react-router-dom"

interface ExpiringMembership {
  id: string
  end_date: string
  membership_type: string
  profile: {
    id: string
    name: string
    last_name: string | null
    avatar_url: string | null
  }
}

export function MembershipExpiryCard() {
  const [loading, setLoading] = useState(true)
  const [expiringMemberships, setExpiringMemberships] = useState<ExpiringMembership[]>([])

  useEffect(() => {
    async function fetchExpiringMemberships() {
      try {
        setLoading(true)

        // Get current date
        const today = new Date()

        // Get date 30 days from now
        const thirtyDaysFromNow = new Date(today)
        thirtyDaysFromNow.setDate(today.getDate() + 30)

        // Format dates for query
        const todayStr = today.toISOString().split("T")[0]
        const futureStr = thirtyDaysFromNow.toISOString().split("T")[0]

        // Fetch memberships expiring in the next 30 days
        const { data, error } = await supabase
          .from("memberships")
          .select(`
            id,
            end_date,
            membership_type,
            profile:profiles(id, name, last_name, avatar_url)
          `)
          .eq("status", "active")
          .gte("end_date", todayStr)
          .lte("end_date", futureStr)
          .order("end_date")
          .limit(5)

        if (error) throw error

        setExpiringMemberships(data as ExpiringMembership[])
      } catch (error) {
        console.error("Error fetching expiring memberships:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpiringMemberships()
  }, [])

  // Get initials from name and last_name
  const getInitials = (name: string, lastName: string | null) => {
    const firstInitial = name ? name[0] : ""
    const lastInitial = lastName ? lastName[0] : ""
    return `${firstInitial}${lastInitial}`
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>{t("expiringMemberships")}</CardTitle>
        <CardDescription>{t("expiringMembershipsDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-pulse text-muted-foreground">{t("loading")}</div>
          </div>
        ) : (
          <div className="space-y-4">
            {expiringMemberships.length > 0 ? (
              expiringMemberships.map((membership) => (
                <div key={membership.id}>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {membership.profile.avatar_url ? (
                        <AvatarImage src={membership.profile.avatar_url || "/placeholder.svg"} />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(membership.profile.name, membership.profile.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">
                        {`${membership.profile.name} ${membership.profile.last_name || ""}`}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{membership.membership_type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatDate(membership.end_date)}</div>
                      <div className="text-xs text-muted-foreground">{t("expiryDate")}</div>
                    </div>
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">{t("noExpiringMemberships")}</div>
            )}
          </div>
        )}
        <Button variant="ghost" className="w-full mt-4 text-primary" asChild>
          <Link to="/memberships">{t("viewAll")}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
