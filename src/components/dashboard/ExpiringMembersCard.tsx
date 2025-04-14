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
import { AlertTriangle } from "lucide-react"

interface ExpiringMember {
  id: string
  name: string
  last_name: string | null
  avatar_url: string | null
  membership: {
    id: string
    end_date: string
    membership_type: string
  }
}

export function ExpiringMembersCard() {
  const [loading, setLoading] = useState(true)
  const [expiringMembers, setExpiringMembers] = useState<ExpiringMember[]>([])

  useEffect(() => {
    async function fetchExpiringMembers() {
      try {
        setLoading(true)

        // Get current date
        const today = new Date()

        // Get date 7 days from now
        const sevenDaysFromNow = new Date(today)
        sevenDaysFromNow.setDate(today.getDate() + 7)

        // Format dates for query
        const todayStr = today.toISOString().split("T")[0]
        const futureStr = sevenDaysFromNow.toISOString().split("T")[0]

        // Fetch members with memberships expiring in the next 7 days
        const { data, error } = await supabase
          .from("profiles")
          .select(`
            id,
            name,
            last_name,
            avatar_url,
            membership:memberships(id, end_date, membership_type)
          `)
          .eq("membership.status", "active")
          .gte("membership.end_date", todayStr)
          .lte("membership.end_date", futureStr)
          .order("membership(end_date)")
          .limit(5)

        if (error) throw error

        // Filter out profiles without memberships and format data
        const formattedData = data
          .filter((profile) => profile.membership && profile.membership.length > 0)
          .map((profile) => ({
            id: profile.id,
            name: profile.name,
            last_name: profile.last_name,
            avatar_url: profile.avatar_url,
            membership: profile.membership[0],
          }))

        setExpiringMembers(formattedData)
      } catch (error) {
        console.error("Error fetching expiring members:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpiringMembers()
  }, [])

  // Get initials from name and last_name
  const getInitials = (name: string, lastName: string | null) => {
    const firstInitial = name ? name[0] : ""
    const lastInitial = lastName ? lastName[0] : ""
    return `${firstInitial}${lastInitial}`
  }

  return (
    <Card className="col-span-1 lg:col-span-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("expiringMembers")}</CardTitle>
            <CardDescription>{t("expiringMembersDescription")}</CardDescription>
          </div>
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-pulse text-muted-foreground">{t("loading")}</div>
          </div>
        ) : (
          <div className="space-y-4">
            {expiringMembers.length > 0 ? (
              expiringMembers.map((member) => (
                <div key={member.id}>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {member.avatar_url ? <AvatarImage src={member.avatar_url || "/placeholder.svg"} /> : null}
                      <AvatarFallback className="bg-amber-100 text-amber-800">
                        {getInitials(member.name, member.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{`${member.name} ${member.last_name || ""}`}</div>
                      <div className="text-xs text-muted-foreground truncate">{member.membership.membership_type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatDate(member.membership.end_date)}</div>
                      <div className="text-xs text-amber-600">{t("expiresSoon")}</div>
                    </div>
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">{t("noExpiringMembers")}</div>
            )}
          </div>
        )}
        <Button variant="ghost" className="w-full mt-4 text-primary" asChild>
          <Link to="/members">{t("viewAll")}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
