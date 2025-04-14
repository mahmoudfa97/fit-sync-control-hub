"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { Card, CardContent } from "@/components/ui/card"
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
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

// Define interfaces for our data types
interface Profile {
  id: string
  name: string
  last_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  created_at: string
}

interface Membership {
  id: string
  profile_id: string
  membership_type: string
  start_date: string
  end_date: string | null
  status: string
  payment_status: string
  created_at: string
}

interface CheckIn {
  id: string
  profile_id: string
  check_in_time: string
  notes: string | null
}

interface Payment {
  id: string
  profile_id: string
  amount: number
  payment_method: string
  payment_date: string
  status: string
  description: string | null
  receipt_number: string | null
}

export default function MemberProfile() {
  const { memberId } = useParams()
  const { toast } = useToast()

  // State for member data
  const [profile, setProfile] = useState<Profile | null>(null)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

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
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", memberId)
          .single()

        if (profileError) throw profileError

        setProfile(profileData)

        // Fetch memberships
        const { data: membershipsData, error: membershipsError } = await supabase
          .from("memberships")
          .select("*")
          .eq("profile_id", memberId)
          .order("created_at", { ascending: false })

        if (membershipsError) throw membershipsError

        setMemberships(membershipsData || [])

        // Fetch check-ins
        const { data: checkInsData, error: checkInsError } = await supabase
          .from("checkins")
          .select("*")
          .eq("profile_id", memberId)
          .order("check_in_time", { ascending: false })
          .limit(10)

        if (checkInsError) throw checkInsError

        setCheckIns(checkInsData || [])

        // Fetch payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select("*")
          .eq("profile_id", memberId)
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
        let query = supabase.from("memberships").select("*", { count: "exact" }).eq("profile_id", memberId)

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
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "היום"
    if (diffDays === 1) return "אתמול"

    return new Date(dateStr).toLocaleDateString("he-IL")
  }

  // Format date and time
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const timeStr = date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
    const dateStr2 = date.toLocaleDateString("he-IL")
    return `${timeStr}, ${dateStr2}`
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/members" className="text-muted-foreground hover:text-foreground ml-2">
            ראשי
          </Link>
          <span className="text-muted-foreground mx-2">/</span>
          <span>פרופיל לקוח</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Main content area - 3 columns */}
        <div className="col-span-1 md:col-span-3">
          <Card className="mb-6">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start bg-white border-b rounded-none h-14 p-0 gap-8">
                  <TabsTrigger
                    value="memberships"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-4"
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      מנויים
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="payments"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-4"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      תשלומים ומעקב
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="checkins"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-4"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4" />
                      היסטוריית כניסות
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-4"
                  >
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      הנהלת חשבונות
                    </div>
                  </TabsTrigger>
                </TabsList>

                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <Button
                      variant="default"
                      className="bg-primary text-white"
                      onClick={() => {
                        // Handle new membership creation
                        // You could navigate to a form or open a modal
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      מנוי חדש
                    </Button>

                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="חיפוש במנויים..."
                        className="pl-10 w-[250px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex gap-2">
                      <Button
                        variant={currentFilter === "active" ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setCurrentFilter("active")}
                      >
                        מנויים פעילים
                      </Button>
                      <Button
                        variant={currentFilter === "inactive" ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setCurrentFilter("inactive")}
                      >
                        מנויים לא פעילים
                      </Button>
                    </div>
                  </div>
                </div>

                <TabsContent value="memberships" className="mt-0 border-0 p-0 px-6">
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-pulse text-muted-foreground">טוען...</div>
                    </div>
                  ) : (
                    <>
                      <Table dir="ltr" className="overflow-auto">
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-center">סטטוס</TableHead>
                            <TableHead className="text-center">עד תאריך</TableHead>
                            <TableHead className="text-center">מתאריך</TableHead>
                            <TableHead className="text-center">סוג מנוי</TableHead>
                            <TableHead className="text-center">תשלום</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {memberships.length > 0 ? (
                            memberships.map((membership) => (
                              <TableRow key={membership.id}>
                                <TableCell className="text-center">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                      membership.status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {membership.status === "active" ? "פעיל" : "לא פעיל"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  {membership.end_date
                                    ? new Date(membership.end_date).toLocaleDateString("he-IL")
                                    : "ללא הגבלה"}
                                </TableCell>
                                <TableCell className="text-center">
                                  {new Date(membership.start_date).toLocaleDateString("he-IL")}
                                </TableCell>
                                <TableCell className="text-center">{membership.membership_type}</TableCell>
                                <TableCell className="text-center">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                      membership.payment_status === "paid"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {membership.payment_status === "paid" ? "שולם" : "ממתין לתשלום"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-left">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => {
                                        // Handle edit membership
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => {
                                        // Handle renew membership
                                      }}
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                אין נתונים בטבלה
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>

                      <div className="flex items-center justify-between my-4 pb-6">
                        <div className="text-sm text-muted-foreground">
                          סך הכל שורות: {memberships.length} מתוך {totalCount}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                          >
                            <ChevronsLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>

                          <Button variant="outline" size="sm" className="h-8 min-w-[2rem] px-2">
                            {page}
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page * perPage >= totalCount}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPage(Math.ceil(totalCount / perPage))}
                            disabled={page * perPage >= totalCount}
                          >
                            <ChevronsRight className="h-4 w-4" />
                          </Button>

                          <select
                            className="h-8 rounded-md border border-input bg-background px-3"
                            value={perPage}
                            onChange={(e) => {
                              setPerPage(Number(e.target.value))
                              setPage(1) // Reset to first page when changing items per page
                            }}
                          >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="40">40</option>
                            <option value="50">50</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="payments" className="mt-0 border-0 p-6">
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-pulse text-muted-foreground">טוען...</div>
                    </div>
                  ) : payments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>תאריך</TableHead>
                          <TableHead>סכום</TableHead>
                          <TableHead>אמצעי תשלום</TableHead>
                          <TableHead>סטטוס</TableHead>
                          <TableHead>תיאור</TableHead>
                          <TableHead>מספר קבלה</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{new Date(payment.payment_date).toLocaleDateString("he-IL")}</TableCell>
                            <TableCell>{payment.amount} ₪</TableCell>
                            <TableCell>{payment.payment_method}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                  payment.status === "paid"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {payment.status === "paid" ? "שולם" : "ממתין"}
                              </span>
                            </TableCell>
                            <TableCell>{payment.description || "-"}</TableCell>
                            <TableCell>{payment.receipt_number || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <p>אין נתוני תשלומים להצגה</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="checkins" className="mt-0 border-0 p-6">
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-pulse text-muted-foreground">טוען...</div>
                    </div>
                  ) : checkIns.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>תאריך ושעה</TableHead>
                          <TableHead>הערות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {checkIns.map((checkIn) => (
                          <TableRow key={checkIn.id}>
                            <TableCell>{formatDateTime(checkIn.check_in_time)}</TableCell>
                            <TableCell>{checkIn.notes || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <p>אין נתוני כניסות להצגה</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="mt-0 border-0 p-6">
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <p>אין נתוני הנהלת חשבונות להצגה</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar - profile info */}
        <div className="col-span-1">
          {loading ? (
            <Card className="overflow-hidden">
              <div className="flex flex-col items-center bg-blue-50 p-6">
                <div className="w-28 h-28 rounded-full bg-blue-100 animate-pulse mb-4"></div>
                <div className="h-6 w-32 bg-blue-100 animate-pulse mb-2"></div>
                <div className="h-8 w-full bg-blue-100 animate-pulse mt-4"></div>
              </div>
              <CardContent className="px-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="h-4 w-16 bg-gray-100 animate-pulse"></div>
                        <div className="h-4 w-24 bg-gray-100 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            profile && (
              <Card className="overflow-hidden">
                <div className="flex flex-col items-center bg-blue-50 p-6">
                  <Avatar className="w-28 h-28 mb-4 bg-blue-100 border-4 border-white">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="text-xl text-blue-500 bg-blue-100">
                      {getInitials(profile.name, profile.last_name)}
                    </AvatarFallback>
                  </Avatar>

                  <h2 className="text-xl font-semibold mb-2 text-center">
                    {`${profile.name} ${profile.last_name || ""}`}
                  </h2>

                  <Button
                    variant="default"
                    className="w-full mt-4"
                    size="sm"
                    onClick={() => {
                      // Handle send message functionality
                    }}
                  >
                    שלח הודעה
                  </Button>
                </div>

                <CardContent className="px-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-medium text-muted-foreground flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-1" />
                        </span>
                        <span className="font-medium" dir="ltr">
                          {profile.phone || "-"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-medium text-muted-foreground">אימייל:</span>
                        <span className="font-medium text-sm truncate max-w-[150px]">{profile.email}</span>
                      </div>

                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-medium text-muted-foreground">הצטרף:</span>
                        <span className="font-medium text-sm">
                          {new Date(profile.created_at).toLocaleDateString("he-IL")}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-medium text-muted-foreground">כניסה אחרונה:</span>
                        <span className="font-medium text-sm">
                          {lastCheckIn ? formatDateTime(lastCheckIn) : "טרם נרשם"}
                        </span>
                      </div>

                      {/* Calculate balance from payments */}
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-medium text-muted-foreground">יתרה:</span>
                        <span className="font-medium text-green-600">
                          {payments.reduce((total, payment) => {
                            return payment.status === "paid" ? total + payment.amount : total
                          }, 0)}{" "}
                          ₪
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          // Handle add card functionality
                        }}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        הוספת כרטיס
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          // Handle credit card management
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        טיפול באשראי
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // Handle sync functionality
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      סנכרן ללקוח
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
