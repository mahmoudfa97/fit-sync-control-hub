
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/utils/format"
import { t } from "@/utils/translations"
import { Link } from "react-router-dom"
import { AlertTriangle, Loader2 } from "lucide-react"
import { MemberService, type ExpiringMember } from "@/services/MemberService"

export function ExpiringMembersCard() {
  const [loading, setLoading] = useState(true)
  const [expiringMembers, setExpiringMembers] = useState<ExpiringMember[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExpiringMembers()
  }, [])

  async function fetchExpiringMembers() {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching expiring members...")

      // Use the new MemberService method
      const data = await MemberService.fetchExpiringMembers()

      console.log(`Found ${data.length} expiring members`)
      setExpiringMembers(data.slice(0, 5)) // Limit to 5 members for display
    } catch (err) {
      console.error("Error in fetchExpiringMembers:", err)
      setError("Failed to fetch expiring members")
      setExpiringMembers([])
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

  return (
    <Card className="col-span-1 lg:col-span-3">
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
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => fetchExpiringMembers()}>
              נסה שנית
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {expiringMembers.length > 0 ? (
              expiringMembers.map((member) => (
                <div key={member.id}>
                  <div className="flex items-center gap-3">
                    <Avatar>
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
