"use client"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, ChevronRight, UserCheck, UserX, Users } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { format, subMonths } from "date-fns"
import * as ReportsService from "@/services/ReportsService"

interface MemberAttendanceData {
  id: string
  name: string
  last_name: string
  email: string
  phone: string
  total_checkins: number
  last_checkin: string
  subscription_type: string
  subscription_status: "active" | "expired" | "pending"
  avg_weekly_visits: number
}

interface NewMembersData {
  id: string
  name: string
  last_name: string
  email: string
  phone: string
  join_date: string
  subscription_type: string
  referred_by: string
  source: string
}

interface MembershipStatusData {
  id: string
  name: string
  last_name: string
  email: string
  phone: string
  subscription_type: string
  start_date: string
  end_date: string
  status: "active" | "expired" | "pending"
  renewal_probability: number
}

interface MembersSummary {
  totalMembers: number
  activeMembers: number
  expiredMembers: number
  newMembersThisMonth: number
}

export default function MembersReportsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("attendance")
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [attendanceData, setAttendanceData] = useState<MemberAttendanceData[]>([])
  const [newMembersData, setNewMembersData] = useState<NewMembersData[]>([])
  const [membershipStatusData, setMembershipStatusData] = useState<MembershipStatusData[]>([])
  const [membersSummary, setMembersSummary] = useState<MembersSummary>({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    newMembersThisMonth: 0,
  })

  // Fetch summary data
  const fetchSummaryData = async () => {
    try {
      // Get current date and first day of month
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      // Get all members with their memberships
      const { data: membersData, error: membersError } = await supabase.from("custom_members").select(`
          id,
          created_at,
          custom_memberships (
            status,
            end_date
          )
        `)

      if (membersError) throw membersError

      // Calculate summary data
      const totalMembers = membersData?.length || 0

      let activeMembers = 0
      let expiredMembers = 0
      let newMembersThisMonth = 0

      membersData?.forEach((member) => {
        // Check if member was created this month
        if (member.created_at && new Date(member.created_at) >= firstDayOfMonth) {
          newMembersThisMonth++
        }

        // Get latest membership status
        const memberships = member.custom_memberships || []
        if (memberships.length > 0) {
          const latestMembership = memberships.sort(
            (a, b) => new Date(b.end_date || "").getTime() - new Date(a.end_date || "").getTime(),
          )[0]

          if (latestMembership.status === "active") {
            activeMembers++
          } else if (latestMembership.status === "expired") {
            expiredMembers++
          }
        }
      })

      setMembersSummary({
        totalMembers,
        activeMembers,
        expiredMembers,
        newMembersThisMonth,
      })
    } catch (error) {
      console.error("Error fetching summary data:", error)
    }
  }

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    try {
      setLoadingData(true)

      // Get members with their check-ins and memberships
      const { data: membersData, error: membersError } = await supabase
        .from("custom_members")
        .select(`
          id,
          name,
          last_name,
          email,
          phone,
          custom_checkins (
            check_in_time
          ),
          custom_memberships (
            membership_type,
            status,
            end_date
          )
        `)
        .order("name")

      if (membersError) throw membersError

      // Transform data
      const transformedData: MemberAttendanceData[] = (membersData || []).map((member) => {
        const checkins = member.custom_checkins || []
        const memberships = member.custom_memberships || []

        // Get latest membership
        const latestMembership =
          memberships.length > 0
            ? memberships.sort((a, b) => new Date(b.end_date || "").getTime() - new Date(a.end_date || "").getTime())[0]
            : null

        // Calculate total check-ins
        const totalCheckins = checkins.length

        // Get last check-in date
        const lastCheckin =
          checkins.length > 0
            ? checkins.sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime())[0]
                .check_in_time
            : new Date().toISOString()

        // Calculate average weekly visits (last 4 weeks)
        const fourWeeksAgo = subMonths(new Date(), 1)
        const recentCheckins = checkins.filter((c) => new Date(c.check_in_time) >= fourWeeksAgo)
        const avgWeeklyVisits = recentCheckins.length / 4

        return {
          id: member.id,
          name: member.name,
          last_name: member.last_name || "",
          email: member.email || "",
          phone: member.phone || "",
          total_checkins: totalCheckins,
          last_checkin: lastCheckin,
          subscription_type: latestMembership?.membership_type || "standard",
          subscription_status: (latestMembership?.status as "active" | "expired" | "pending") || "expired",
          avg_weekly_visits: avgWeeklyVisits,
        }
      })

      setAttendanceData(transformedData)
    } catch (error) {
      console.error("Error fetching attendance data:", error)
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  // Fetch new members data
  const fetchNewMembersData = async () => {
    try {
      setLoadingData(true)

      // Get members created in the last 3 months
      const threeMonthsAgo = subMonths(new Date(), 3)

      const { data: membersData, error: membersError } = await supabase
        .from("custom_members")
        .select(`
          id,
          name,
          last_name,
          email,
          phone,
          created_at,
          custom_memberships (
            membership_type
          )
        `)
        .gte("created_at", format(threeMonthsAgo, "yyyy-MM-dd"))
        .order("created_at", { ascending: false })

      if (membersError) throw membersError

      // Transform data
      const transformedData: NewMembersData[] = (membersData || []).map((member) => {
        const memberships = member.custom_memberships || []

        // Get subscription type from membership
        const subscriptionType = memberships.length > 0 ? memberships[0].membership_type : "standard"

        return {
          id: member.id,
          name: member.name,
          last_name: member.last_name || "",
          email: member.email || "",
          phone: member.phone || "",
          join_date: member.created_at || new Date().toISOString(),
          subscription_type: subscriptionType,
          referred_by: "", // This would need to come from a referral system
          source: "אתר אינטרנט", // This would need to come from a tracking system
        }
      })

      setNewMembersData(transformedData)
    } catch (error) {
      console.error("Error fetching new members data:", error)
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  // Fetch membership status data
  const fetchMembershipStatusData = async () => {
    try {
      setLoadingData(true)

      // Get members with their memberships and check-ins
      const { data: membersData, error: membersError } = await supabase
        .from("custom_members")
        .select(`
          id,
          name,
          last_name,
          email,
          phone,
          custom_memberships (
            membership_type,
            start_date,
            end_date,
            status
          ),
          custom_checkins (
            check_in_time
          )
        `)
        .order("name")

      if (membersError) throw membersError

      // Transform data
      const transformedData: MembershipStatusData[] = (membersData || []).map((member) => {
        const memberships = member.custom_memberships || []
        const checkins = member.custom_checkins || []

        // Get latest membership
        const latestMembership =
          memberships.length > 0
            ? memberships.sort((a, b) => new Date(b.end_date || "").getTime() - new Date(a.end_date || "").getTime())[0]
            : null

        // Calculate renewal probability based on check-in frequency
        // This is a simplified calculation - in a real app, you'd use more factors
        let renewalProbability = 0.5 // Default 50%

        if (latestMembership) {
          // More recent check-ins increase renewal probability
          const recentCheckins = checkins.filter((c) => new Date(c.check_in_time) >= subMonths(new Date(), 1)).length

          // Adjust probability based on check-ins
          if (recentCheckins > 12) renewalProbability = 0.9
          else if (recentCheckins > 8) renewalProbability = 0.8
          else if (recentCheckins > 4) renewalProbability = 0.7
          else if (recentCheckins > 0) renewalProbability = 0.6
          else renewalProbability = 0.4

          // Adjust based on membership status
          if (latestMembership.status === "expired") {
            renewalProbability *= 0.7 // Reduce probability for expired memberships
          }
        }

        return {
          id: member.id,
          name: member.name,
          last_name: member.last_name || "",
          email: member.email || "",
          phone: member.phone || "",
          subscription_type: latestMembership?.membership_type || "standard",
          start_date: latestMembership?.start_date || new Date().toISOString(),
          end_date: latestMembership?.end_date || new Date().toISOString(),
          status: (latestMembership?.status as "active" | "expired" | "pending") || "expired",
          renewal_probability: renewalProbability,
        }
      })

      setMembershipStatusData(transformedData)
    } catch (error) {
      console.error("Error fetching membership status data:", error)
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  // Generate report
  const handleGenerateReport = async () => {
    try {
      setLoading(true)

      // In a real implementation, this would call your report generation service
       await ReportsService.generateMembersMainReport()

      setTimeout(() => {
        toast({
          title: "הדוח נוצר בהצלחה",
          description: "הקובץ הורד למחשב שלך",
        })
        setLoading(false)
      }, 1500)
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "שגיאה ביצירת הדוח",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  // Load data when tab changes
  useEffect(() => {
    fetchSummaryData()

    if (activeTab === "attendance") {
      fetchAttendanceData()
    } else if (activeTab === "new-members") {
      fetchNewMembersData()
    } else if (activeTab === "membership-status") {
      fetchMembershipStatusData()
    }
  }, [activeTab])

  return (
    <DashboardShell>
      <div className="container px-4 py-6 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">דוחות מנויים</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <UserCheck className="h-8 w-8 mb-2 text-green-500" />
              <div className="text-3xl font-bold">{membersSummary.activeMembers}</div>
              <div className="text-sm text-muted-foreground">מנויים פעילים</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Users className="h-8 w-8 mb-2 text-blue-500" />
              <div className="text-3xl font-bold">{membersSummary.newMembersThisMonth}</div>
              <div className="text-sm text-muted-foreground">מנויים חדשים החודש</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <UserX className="h-8 w-8 mb-2 text-red-500" />
              <div className="text-3xl font-bold">{membersSummary.expiredMembers}</div>
              <div className="text-sm text-muted-foreground">מנויים שפג תוקפם</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="attendance" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="attendance">דוח נוכחות</TabsTrigger>
            <TabsTrigger value="new-members">מנויים חדשים</TabsTrigger>
            <TabsTrigger value="membership-status">סטטוס מנויים</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">דוח נוכחות מנויים</h2>
                  <Button onClick={handleGenerateReport} disabled={loading}>
                    {loading ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2">⏳</span>
                        מייצר דוח...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Download className="ml-2 h-4 w-4" />
                        הורד דוח
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="searchTerm">חיפוש</Label>
                    <Input id="searchTerm" placeholder="חיפוש לפי שם, אימייל, טלפון..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subscriptionType">סוג מנוי</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="subscriptionType">
                        <SelectValue placeholder="כל סוגי המנויים" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">כל סוגי המנויים</SelectItem>
                        <SelectItem value="standard">רגיל</SelectItem>
                        <SelectItem value="premium">פרימיום</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activityLevel">רמת פעילות</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="activityLevel">
                        <SelectValue placeholder="כל רמות הפעילות" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">כל רמות הפעילות</SelectItem>
                        <SelectItem value="high">פעילות גבוהה (3+ בשבוע)</SelectItem>
                        <SelectItem value="medium">פעילות בינונית (1-2 בשבוע)</SelectItem>
                        <SelectItem value="low">פעילות נמוכה (פחות מ-1 בשבוע)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table dir="rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">שם</TableHead>
                      <TableHead className="text-right">טלפון</TableHead>
                      <TableHead className="text-right">סוג מנוי</TableHead>
                      <TableHead className="text-right">סטטוס</TableHead>
                      <TableHead className="text-right">סה"כ כניסות</TableHead>
                      <TableHead className="text-right">כניסה אחרונה</TableHead>
                      <TableHead className="text-right">ממוצע שבועי</TableHead>
                      <TableHead className="text-right">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingData ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <span className="animate-spin inline-block mr-2">⏳</span> טוען נתונים...
                        </TableCell>
                      </TableRow>
                    ) : attendanceData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          לא נמצאו נתונים
                        </TableCell>
                      </TableRow>
                    ) : (
                      attendanceData.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{`${member.name} ${member.last_name}`}</TableCell>
                          <TableCell>{member.phone}</TableCell>
                          <TableCell>{member.subscription_type === "premium" ? "פרימיום" : "רגיל"}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                member.subscription_status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : member.subscription_status === "expired"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {member.subscription_status === "active"
                                ? "פעיל"
                                : member.subscription_status === "expired"
                                  ? "פג תוקף"
                                  : "ממתין"}
                            </span>
                          </TableCell>
                          <TableCell>{member.total_checkins}</TableCell>
                          <TableCell>{new Date(member.last_checkin).toLocaleDateString("he-IL")}</TableCell>
                          <TableCell>{member.avg_weekly_visits.toFixed(1)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="new-members" className="space-y-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">דוח מנויים חדשים</h2>
                  <Button onClick={handleGenerateReport} disabled={loading}>
                    {loading ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2">⏳</span>
                        מייצר דוח...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Download className="ml-2 h-4 w-4" />
                        הורד דוח
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateRange">טווח תאריכים</Label>
                    <div className="flex space-x-2 space-x-reverse">
                      <Input id="startDate" type="date" className="w-1/2" />
                      <Input id="endDate" type="date" className="w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source">מקור הרשמה</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="source">
                        <SelectValue placeholder="כל המקורות" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">כל המקורות</SelectItem>
                        <SelectItem value="referral">הפניה</SelectItem>
                        <SelectItem value="facebook">פייסבוק</SelectItem>
                        <SelectItem value="instagram">אינסטגרם</SelectItem>
                        <SelectItem value="website">אתר אינטרנט</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subscriptionType">סוג מנוי</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="subscriptionType">
                        <SelectValue placeholder="כל סוגי המנויים" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">כל סוגי המנויים</SelectItem>
                        <SelectItem value="standard">רגיל</SelectItem>
                        <SelectItem value="premium">פרימיום</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table dir="rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">שם</TableHead>
                      <TableHead className="text-right">טלפון</TableHead>
                      <TableHead className="text-right">אימייל</TableHead>
                      <TableHead className="text-right">תאריך הצטרפות</TableHead>
                      <TableHead className="text-right">סוג מנוי</TableHead>
                      <TableHead className="text-right">הופנה על ידי</TableHead>
                      <TableHead className="text-right">מקור</TableHead>
                      <TableHead className="text-right">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingData ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <span className="animate-spin inline-block mr-2">⏳</span> טוען נתונים...
                        </TableCell>
                      </TableRow>
                    ) : newMembersData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          לא נמצאו נתונים
                        </TableCell>
                      </TableRow>
                    ) : (
                      newMembersData.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{`${member.name} ${member.last_name}`}</TableCell>
                          <TableCell>{member.phone}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>{new Date(member.join_date).toLocaleDateString("he-IL")}</TableCell>
                          <TableCell>{member.subscription_type === "premium" ? "פרימיום" : "רגיל"}</TableCell>
                          <TableCell>{member.referred_by || "-"}</TableCell>
                          <TableCell>{member.source}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="membership-status" className="space-y-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">דוח סטטוס מנויים</h2>
                  <Button onClick={handleGenerateReport} disabled={loading}>
                    {loading ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2">⏳</span>
                        מייצר דוח...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Download className="ml-2 h-4 w-4" />
                        הורד דוח
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">סטטוס מנוי</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="status">
                        <SelectValue placeholder="כל הסטטוסים" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">כל הסטטוסים</SelectItem>
                        <SelectItem value="active">פעיל</SelectItem>
                        <SelectItem value="expired">פג תוקף</SelectItem>
                        <SelectItem value="pending">ממתין</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryRange">תאריך פקיעת תוקף</Label>
                    <div className="flex space-x-2 space-x-reverse">
                      <Input id="expiryStartDate" type="date" className="w-1/2" />
                      <Input id="expiryEndDate" type="date" className="w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="renewalProbability">סיכוי לחידוש</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="renewalProbability">
                        <SelectValue placeholder="כל הסיכויים" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">כל הסיכויים</SelectItem>
                        <SelectItem value="high">גבוה (75%+)</SelectItem>
                        <SelectItem value="medium">בינוני (40%-75%)</SelectItem>
                        <SelectItem value="low">נמוך (פחות מ-40%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table dir="rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">שם</TableHead>
                      <TableHead className="text-right">טלפון</TableHead>
                      <TableHead className="text-right">סוג מנוי</TableHead>
                      <TableHead className="text-right">תאריך התחלה</TableHead>
                      <TableHead className="text-right">תאריך סיום</TableHead>
                      <TableHead className="text-right">סטטוס</TableHead>
                      <TableHead className="text-right">סיכוי לחידוש</TableHead>
                      <TableHead className="text-right">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingData ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <span className="animate-spin inline-block mr-2">⏳</span> טוען נתונים...
                        </TableCell>
                      </TableRow>
                    ) : membershipStatusData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          לא נמצאו נתונים
                        </TableCell>
                      </TableRow>
                    ) : (
                      membershipStatusData.map((member) => (
                        <TableRow
                          key={member.id}
                          className={
                            member.status === "expired"
                              ? "bg-red-50"
                              : member.status === "pending"
                                ? "bg-yellow-50"
                                : ""
                          }
                        >
                          <TableCell>{`${member.name} ${member.last_name}`}</TableCell>
                          <TableCell>{member.phone}</TableCell>
                          <TableCell>{member.subscription_type === "premium" ? "פרימיום" : "רגיל"}</TableCell>
                          <TableCell>{new Date(member.start_date).toLocaleDateString("he-IL")}</TableCell>
                          <TableCell>{new Date(member.end_date).toLocaleDateString("he-IL")}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                member.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : member.status === "expired"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {member.status === "active" ? "פעיל" : member.status === "expired" ? "פג תוקף" : "ממתין"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`${
                                member.renewal_probability >= 0.75
                                  ? "text-green-600"
                                  : member.renewal_probability >= 0.4
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {Math.round(member.renewal_probability * 100)}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
