"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, Phone, Calendar, User, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { MemberProfileActions } from "@/components/members/MemberProfileActions"
import { MemberProfileTabs } from "@/components/members/MemberProfileTabs"
import { t } from "@/utils/translations"
import { toast } from "sonner"

interface Member {
  id: string
  name: string
  last_name: string | null
  email: string | null
  phone: string | null
  gender: string | null
  dateOfBirth: string | null
  created_at: string
}

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      console.log("Fetching member with ID:", id)
      fetchMember(id)
    } else {
      console.error("No member ID provided in route parameters")
      setLoading(false)
    }
  }, [id])

  const fetchMember = async (memberId: string) => {
    try {
      setLoading(true)
      console.log("Making Supabase request for member:", memberId)

      const { data, error } = await supabase.from("custom_members").select("*").eq("id", memberId).single()

      if (error) {
        console.error("Supabase error:", error)
        toast.error(t("errorFetchingMember"))
        throw error
      }

      console.log("Member data received:", data)
      setMember(data)
    } catch (error) {
      console.error("Error fetching member:", error)
      toast.error(t("errorFetchingMember"))
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string, lastName: string | null) => {
    const firstInitial = name ? name[0] : ""
    const lastInitial = lastName ? lastName[0] : ""
    return `${firstInitial}${lastInitial}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardShell>
    )
  }

  if (!member) {
    return (
      <DashboardShell>
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-2">{t("memberNotFound")}</h2>
          <p className="text-muted-foreground mb-4">{t("memberNotFoundDesc")}</p>
          <Button asChild>
            <Link to="/members">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToMembers")}
            </Link>
          </Button>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/members">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{t("memberProfile")}</h1>
        </div>
        <MemberProfileActions
          memberId={member.id}
          memberName={`${member.name} ${member.last_name || ""}`}
          onRefresh={() => fetchMember(member.id)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t("memberInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-xl">{getInitials(member.name, member.last_name)}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{`${member.name} ${member.last_name || ""}`}</h2>
              <p className="text-sm text-muted-foreground">
                {t("memberSince", { date: formatDate(member.created_at) })}
              </p>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("email")}</p>
                  <p className="text-sm">{member.email || t("notProvided")}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("phone")}</p>
                  <p className="text-sm">{member.phone || t("notProvided")}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("gender")}</p>
                  <p className="text-sm">{member.gender ? t(member.gender) : t("notProvided")}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t("dateOfBirth")}</p>
                  <p className="text-sm">{member.dateOfBirth || t("notProvided")}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3">
          <MemberProfileTabs memberId={member.id} />
        </div>
      </div>
    </DashboardShell>
  )
}
