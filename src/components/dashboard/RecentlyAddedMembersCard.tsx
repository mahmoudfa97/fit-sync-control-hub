"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { t } from "@/utils/translations"
import { UserPlus } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Link } from "react-router-dom"

interface RecentMember {
  id: string
  name: string
  last_name: string
  email: string
  avatar_url: string | null
  created_at: string
  membership_type?: string
}

export function RecentlyAddedMembersCard() {
  const [recentMembers, setRecentMembers] = useState<RecentMember[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchRecentMembers() {
      try {
        // First, fetch profiles without the problematic join
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select(`
            id,
            name,
            last_name,
            email,
            avatar_url,
            created_at
          `)
          .order("created_at", { ascending: false })
          .limit(4)

        if (profilesError) {
          throw profilesError
        }

        // If we need membership data, fetch it separately
        const membersWithMembership = await Promise.all(
          profilesData.map(async (profile) => {
            try {
              const { data: membershipData, error: membershipError } = await supabase
                .from("memberships")
                .select("membership_type")
                .eq("member_id", profile.id)
                .maybeSingle()

              if (membershipError) {
                console.warn(`Error fetching membership for profile ${profile.id}:`, membershipError)
              }

              return {
                ...profile,
                membership_type: membershipData?.membership_type || "בסיסי",
              }
            } catch (err) {
              console.warn(`Error processing membership for profile ${profile.id}:`, err)
              return {
                ...profile,
                membership_type: "בסיסי",
              }
            }
          }),
        )

        setRecentMembers(membersWithMembership)
      } catch (error) {
        console.error("Error fetching recent members:", error)
        toast({
          title: "שגיאה בטעינת הנתונים",
          description: "לא ניתן לטעון את החברים האחרונים שנוספו",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRecentMembers()
  }, [toast])

  // Get initials from name and last_name
  const getInitials = (name: string, lastName: string | null) => {
    const firstInitial = name ? name[0] : ""
    const lastInitial = lastName ? lastName[0] : ""
    return `${firstInitial}${lastInitial}`
  }

  // Format relative time (today, yesterday, or date)
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "היום"
    if (diffDays === 1) return "אתמול"

    return new Date(dateStr).toLocaleDateString("he-IL")
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("recentlyAddedMembers")}</CardTitle>
            <CardDescription>לקוחות חדשים שהצטרפו לאחרונה</CardDescription>
          </div>
          <UserPlus className="h-5 w-5 opacity-70" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-pulse text-muted-foreground">טוען...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {recentMembers.length > 0 ? (
              recentMembers.map((member) => (
                <div key={member.id}>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {member.avatar_url ? <AvatarImage src={member.avatar_url || "/placeholder.svg"} /> : null}
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(member.name, member.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{`${member.name} ${member.last_name || ""}`}</div>
                      <div className="text-xs text-muted-foreground truncate">{member.membership_type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatRelativeTime(member.created_at)}</div>
                      <div className="text-xs text-muted-foreground">הצטרף/ה</div>
                    </div>
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">אין חברים חדשים להצגה</div>
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
