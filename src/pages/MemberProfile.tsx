"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Phone,
  CreditCard,
  RefreshCw,
  Edit,
  MessageSquare,
  CalendarClock,
  History,
  ClipboardList,
  ShieldCheck,
  ArrowLeft,
  Mail,
  User,
  Calendar,
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { AddSubscriptionDialog } from "../components/members/AddSubscriptionDialog"
import type { Tables } from "@/integrations/supabase/types"
import { MemberProfileActions } from "@/components/members/MemberProfileActions"
import { MemberProfileTabs } from "@/components/members/MemberProfileTabs"
import { Separator } from "@/components/ui/separator"
import { t } from "@/utils/translations"
import { useAppSelector } from "@/hooks/redux"

// Use the types from your constants file
type Profile = Tables<"custom_members">
type Membership = Tables<"memberships">
type CheckIn = Tables<"checkins">
type Payment = Tables<"payments">
type AccessCard = Tables<"access_cards">

export default function MemberProfile() {
  const { memberId } = useParams()
  const { toast } = useToast()

  // State for member data
  const {members} = useAppSelector((state) => state.members)
  const [profile, setProfile] = useState(null)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [accessCards, setAccessCards] = useState<AccessCard[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateMembershipOpen, setIsCreateMembershipOpen] = useState(false)

  // UI state
  const [activeTab, setActiveTab] = useState("memberships")
  const [currentFilter, setCurrentFilter] = useState("active") // active or inactive
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  // Fetch member profile data
  useEffect(() => {
    async function fetchMemberData() {
      try {
        setLoading(true)

        // Fetch profile data
        const profile= members.find((member) => member.id === memberId)

        if (!profile) throw Error

        setProfile({ ...profile })

        // Fetch access cards
        const { data: accessCardsData, error: accessCardsError } = await supabase
          .from("access_cards")
          .select("*")
          .eq("member_id", memberId)

        if (accessCardsError) throw accessCardsError

        setAccessCards(accessCardsData || [])

        // Fetch check-ins
        const { data: checkInsData, error: checkInsError } = await supabase
          .from("checkins")
          .select("*")
          .eq("member_id", memberId)
          .order("check_in_time", { ascending: false })
          .limit(10)

        if (checkInsError) throw checkInsError

        setCheckIns(checkInsData || [])

        // Fetch payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select("*")
          .eq("member_id", memberId)
          .order("payment_date", { ascending: false })
          .limit(10)

        if (paymentsError) throw paymentsError

        setPayments(paymentsData || [])
      } catch (error: any) {
        console.error("Error fetching member data:", error)
        toast({
          title: "שגיאה בטעינת הנתונים",
          description: "לא ניתן לטעון את פרטי הלקוח",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (memberId) {
      fetchMemberData()
    }
  }, [memberId, toast])

  // Fetch memberships with pagination and filtering
  useEffect(() => {
    async function fetchMemberships() {
      try {
        // Create base query
        let query = supabase.from("memberships").select("*", { count: "exact" }).eq("member_id", memberId)

        // Apply status filter
        if (currentFilter === "active") {
          query = query.eq("status", "active")
        } else if (currentFilter === "inactive") {
          query = query.neq("status", "active")
        }

        // Apply search if provided
        if (searchQuery) {
          query = query.ilike("membership_type", `%${searchQuery}%`)
        }

        // Apply pagination
        const from = (page - 1) * perPage
        const to = from + perPage - 1

        // Execute query
        const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to)

        if (error) throw error

        setMemberships(data || [])
        setTotalCount(count || 0)
      } catch (error: any) {
        console.error("Error fetching memberships:", error)
        toast({
          title: "שגיאה בטעינת המנויים",
          description: "לא ניתן לטעון את נתוני המנויים",
          variant: "destructive",
        })
      }
    }

    if (memberId) {
      fetchMemberships()
    }
  }, [memberId, page, perPage, currentFilter, searchQuery, toast])

  // Get initials from name and last_name
  const getInitials = (name: string, lastName: string | null) => {
    const firstInitial = name ? name[0] : ""
    const lastInitial = lastName ? lastName[0] : ""
    return `${firstInitial}${lastInitial}`
  }

  // Format relative time (today, yesterday, or date)
  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return "-"

    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "היום"
    if (diffDays === 1) return "אתמול"

    return new Date(dateStr).toLocaleDateString("he-IL")
  }

  // Format date and time
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "-"

    const date = new Date(dateStr)
    const timeStr = date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
    const dateStr2 = date.toLocaleDateString("he-IL")
    return `${timeStr}, ${dateStr2}`
  }

  // Handle membership refresh/renewal
  const handleRenewMembership = async (membershipId: string) => {
    try {
      const membership = memberships.find((m) => m.id === membershipId)
      if (!membership) return

      // Calculate new dates based on current membership
      const startDate = new Date()
      let endDate: Date | null = null

      if (membership.end_date) {
        const duration = new Date(membership.end_date).getTime() - new Date(membership.start_date).getTime()
        endDate = new Date(startDate.getTime() + duration)
      }

      const { error } = await supabase.from("memberships").insert({
        member_id: memberId as string,
        membership_type: membership.membership_type,
        start_date: startDate.toISOString(),
        end_date: endDate ? endDate.toISOString() : null,
        status: "active",
        payment_status: "pending",
      })

      if (error) throw error

      toast({
        title: "המנוי חודש בהצלחה",
        description: "נוצר מנוי חדש בהתבסס על המנוי הקודם",
      })

      // Refresh memberships list
      fetchMemberships()
    } catch (error: any) {
      console.error("Error renewing membership:", error)
      toast({
        title: "שגיאה בחידוש המנוי",
        description: error.message || "אירעה שגיאה בעת חידוש המנוי",
        variant: "destructive",
      })
    }
  }

  // Function to fetch memberships (used after creating a new one)
  const fetchMemberships = async () => {
    try {
      let query = supabase.from("custom_memberships").select("*", { count: "exact" }).eq("member_id", memberId)

      if (currentFilter === "active") {
        query = query.eq("status", "active")
      } else if (currentFilter === "inactive") {
        query = query.neq("status", "active")
      }

      if (searchQuery) {
        query = query.ilike("membership_type", `%${searchQuery}%`)
      }

      const from = (page - 1) * perPage
      const to = from + perPage - 1

      const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to)

      if (error) throw error

      setMemberships(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error("Error fetching memberships:", error)
    }
  }

  const fetchMember = async () => {
    try {
      setLoading(true)
      console.log("Making Supabase request for member:", memberId)

      const { data, error } = await supabase.from("custom_members").select("*").eq("id", memberId).single()

      if (error) {
        console.error("Supabase error:", error)
        toast({
          title: "Error Fetching Member",
          description: "An error occurred while fetching the member data.",
          variant: "destructive",
        })
        throw error
      }

      console.log("Member data received:", data)
      setProfile({ ...data })
    } catch (error) {
      console.error("Error fetching member:", error)
      toast({
        title: "Error Fetching Member",
        description: "An error occurred while fetching the member data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // If member not found, show error state
  if (!profile && !loading) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center p-12">
          <h2 className="text-2xl font-bold mb-4">לקוח לא נמצא</h2>
          <p className="text-muted-foreground mb-6">המזהה שביקשת לא נמצא במערכת</p>
          <Button asChild>
            <Link to="/members">חזרה לרשימת הלקוחות</Link>
          </Button>
        </div>
      </DashboardShell>
    )
  }

  // Get last check-in date
  const lastCheckIn = checkIns.length > 0 ? checkIns[0].check_in_time : null

  return (
    <DashboardShell>
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link to="/members">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{t("MemberProfile")}</h1>
      </div>
      <MemberProfileActions
        memberId={profile?.id}
        memberName={`${profile?.name} ${profile?.last_name || ""}`}
        onRefresh={() => fetchMember()}
      />
    </div>

    <div className="grid gap-6 md:grid-cols-4">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>{t("memberDetails")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="text-xl">{getInitials(profile?.name, profile?.last_name)}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{`${profile?.name} ${profile?.last_name || ""}`}</h2>
            <p className="text-sm text-muted-foreground">
              {t("memberSince")} {formatDateTime(profile?.created_at)}
            </p>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">{t("email")}</p>
                <p className="text-sm">{profile?.email || t("notProvided")}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck  className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">{t("insurance")}</p>
                <p className="text-sm">{profile?.hasInsurance ? (
                  <>
                  <span className="text-sm text-muted-foreground"> {t("from")}</span>
                  <span className="text-sm">{profile?.insuranceStartDate} </span>
                  <span className="text-sm text-muted-foreground">{t("until")}</span>
                  <span className="text-sm">{profile?.insuranceEndDate}</span>
                  </>
                ): (
                  <span className="text-sm">{t("notProvided")}</span>)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">{t("phone")}</p>
                <p className="text-sm">{profile?.phone || t("notProvided")}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">{t("gender")}</p>
                <p className="text-sm">{profile?.gender ? profile.gender : t("notProvided")}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">{t("dateOfBirth")}</p>
                <p className="text-sm">{profile?.dateOfBirth || t("notProvided")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="md:col-span-3">
        <MemberProfileTabs memberId={profile?.id} />
      </div>
    </div>
  </DashboardShell>
  )
}
