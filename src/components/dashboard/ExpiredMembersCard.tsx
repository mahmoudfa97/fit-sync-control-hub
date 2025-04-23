"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/utils/format"
import { t } from "@/utils/translations"
import { Link } from "react-router-dom"
import { AlertCircle, Loader2 } from "lucide-react"
import { MemberService, type ExpiringMember } from "@/services/MemberService"

export function ExpiredMembersCard() {
  const [loading, setLoading] = useState(true)
  const [expiredMembers, setExpiredMembers] = useState<ExpiringMember[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExpiredMembers()
  }, [])

  async function fetchExpiredMembers() {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching expired members...")

      // Use the new MemberService method
      const data = await MemberService.fetchExpiredMembers()

      console.log(`Found ${data.length} expired members`)
      setExpiredMembers(data.slice(0, 5)) // Limit to 5 members for display
    } catch (err) {
      console.error("Error in fetchExpiredMembers:", err)
      setError("Failed to fetch expired members")
      setExpiredMembers([])
    } finally {
      setLoading(false)
    }
  }

  // Get initials from name and last_name
  const getInitials = (name: string, lastName: string | null) => {
    const firstInitial = name ? name[0] : ""
    const lastInitial = lastName ? lastName[0] : ""
    return `${firstInitial}${lastInitial}`
  }

  const handleUpdateStatus = async (membershipId: string) => {
    try {
      await MemberService.updateMembershipToExpired(membershipId)
      // Refresh the list after updating
      fetchExpiredMembers()
    } catch (error) {
      console.error("Error updating membership status:", error)
      setError("Failed to update membership status")
    }
  }

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("expiredMembers")}</CardTitle>
            <CardDescription>{t("expiredMembersDescription")}</CardDescription>
          </div>
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => fetchExpiredMembers()}>
              נסה שנית
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {expiredMembers.length > 0 ? (
              expiredMembers.map((member) => (
                <div key={member.id}>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {member.avatar_url ? (
                        <AvatarImage src={member.avatar_url || "/placeholder.svg"} alt={member.name} />
                      ) : null}
                      <AvatarFallback className="bg-red-100 text-red-800">
                        {getInitials(member.name, member.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{`${member.name} ${member.last_name || ""}`}</div>
                      <div className="text-xs text-muted-foreground truncate">{member.membership.membership_type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatDate(member.membership.end_date)}</div>
                      <div className="text-xs text-red-600">{t("expired")}</div>
                    </div>
                  </div>
                  {member.membership.status === "active" && (
                    <div className="mt-2 flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(member.membership.id)}>
                        עדכן לפג תוקף
                      </Button>
                    </div>
                  )}
                  <Separator className="mt-4" />
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">{t("noExpiredMembers")}</div>
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
