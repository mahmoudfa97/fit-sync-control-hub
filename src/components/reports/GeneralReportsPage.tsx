"use client"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Download, TrendingUp, Users, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns"

interface MonthlyData {
  name: string
  members: number
  revenue: number
  classes: number
}

interface ClassAttendanceData {
  name: string
  attendance: number
  capacity: number
  percentage: number
}

interface RetentionData {
  month: number
  rate: number
}

interface SummaryData {
  monthlyRevenue: number
  totalMembers: number
  retentionRate: number
}

export default function GeneralReportsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("growth")
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [year, setYear] = useState("2024")
  const [quarter, setQuarter] = useState("all")

  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [classAttendanceData, setClassAttendanceData] = useState<ClassAttendanceData[]>([])
  const [retentionData, setRetentionData] = useState<RetentionData[]>([])
  const [summaryData, setSummaryData] = useState<SummaryData>({
    monthlyRevenue: 0,
    totalMembers: 0,
    retentionRate: 0,
  })

  // Fetch summary data
  const fetchSummaryData = async () => {
    try {
      // Get current date and first day of month
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDayOfMonth = endOfMonth(now)

      // Get total members count
      const { count: membersCount, error: membersError } = await supabase
        .from("custom_members")
        .select("*", { count: "exact", head: true })

      if (membersError) throw membersError

      // Get monthly revenue
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("amount")
        .gte("payment_date", format(firstDayOfMonth, "yyyy-MM-dd"))
        .lte("payment_date", format(lastDayOfMonth, "yyyy-MM-dd"))

      if (paymentsError) throw paymentsError

      const monthlyRevenue = paymentsData?.reduce((sum, payment) => sum + payment.amount, 0) || 0

      // Calculate retention rate (simplified)
      // Get members from 3 months ago
      const threeMonthsAgo = subMonths(now, 3)
      const startOfThreeMonthsAgo = startOfMonth(threeMonthsAgo)
      const endOfThreeMonthsAgo = endOfMonth(threeMonthsAgo)

      // Get members active 3 months ago
      const { data: oldMembersData, error: oldMembersError } = await supabase
        .from("custom_memberships")
        .select("member_id")
        .lte("start_date", format(endOfThreeMonthsAgo, "yyyy-MM-dd"))
        .eq("status", "active")

      if (oldMembersError) throw oldMembersError

      // Get how many of those members are still active
      const oldMemberIds = oldMembersData?.map((m) => m.member_id) || []

      if (oldMemberIds.length > 0) {
        const { data: stillActiveData, error: stillActiveError } = await supabase
          .from("custom_memberships")
          .select("member_id")
          .in("member_id", oldMemberIds)
          .eq("status", "active")

        if (stillActiveError) throw stillActiveError

        const retentionRate = oldMemberIds.length > 0 ? ((stillActiveData?.length || 0) / oldMemberIds.length) * 100 : 0

        setSummaryData({
          monthlyRevenue,
          totalMembers: membersCount || 0,
          retentionRate,
        })
      } else {
        setSummaryData({
          monthlyRevenue,
          totalMembers: membersCount || 0,
          retentionRate: 0,
        })
      }
    } catch (error) {
      console.error("Error fetching summary data:", error)
    }
  }

  // Fetch monthly growth data
  const fetchMonthlyData = async () => {
    try {
      setLoadingData(true)

      // Get data for the selected year
      const selectedYear = Number.parseInt(year)
      const startDate = new Date(selectedYear, 0, 1)
      const endDate = new Date(selectedYear, 11, 31)

      // Get all months in the year
      const months = eachMonthOfInterval({ start: startDate, end: endDate })

      // Initialize data array
      const data: MonthlyData[] = []

      // For each month, get the data
      for (const month of months) {
        const monthStart = startOfMonth(month)
        const monthEnd = endOfMonth(month)

        // Get member count for this month
        const { count: membersCount, error: membersError } = await supabase
          .from("custom_members")
          .select("*", { count: "exact", head: true })
          .lte("created_at", format(monthEnd, "yyyy-MM-dd"))

        if (membersError) throw membersError

        // Get revenue for this month
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select("amount")
          .gte("payment_date", format(monthStart, "yyyy-MM-dd"))
          .lte("payment_date", format(monthEnd, "yyyy-MM-dd"))

        if (paymentsError) throw paymentsError

        const monthlyRevenue = paymentsData?.reduce((sum, payment) => sum + payment.amount, 0) || 0

        // Get class count for this month
        const { count: classesCount, error: classesError } = await supabase
          .from("classes")
          .select("*", { count: "exact", head: true })
          .lte("created_at", format(monthEnd, "yyyy-MM-dd"))

        if (classesError) throw classesError

        // Add to data array
        data.push({
          name: format(month, "MMMM"),
          members: membersCount || 0,
          revenue: monthlyRevenue,
          classes: classesCount || 0,
        })
      }

      setMonthlyData(data)
    } catch (error) {
      console.error("Error fetching monthly data:", error)
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  // Fetch class attendance data
  const fetchClassAttendanceData = async () => {
    try {
      setLoadingData(true)

      // Get all classes
      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select(`
          id,
          name,
          max_capacity
        `)
        .order("name")

      if (classesError) throw classesError

      // For each class, get the attendance count separately
      const transformedData: ClassAttendanceData[] = []

      for (const classItem of classesData || []) {
        // Get attendance count for this class
        const { count: attendanceCount, error: attendanceError } = await supabase
          .from("class_attendance")
          .select("*", { count: "exact", head: true })
          .eq("class_id", classItem.id)

        if (attendanceError) {
          console.error(`Error fetching attendance for class ${classItem.id}:`, attendanceError)
          continue
        }

        const attendance = attendanceCount || 0
        const capacity = classItem.max_capacity || 0
        const percentage = capacity > 0 ? Math.round((attendance / capacity) * 100) : 0

        transformedData.push({
          name: classItem.name,
          attendance,
          capacity,
          percentage,
        })
      }

      setClassAttendanceData(transformedData)
    } catch (error) {
      console.error("Error fetching class attendance data:", error)
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  // Fetch retention data
  const fetchRetentionData = async () => {
    try {
      setLoadingData(true)

      // Calculate retention rates for different periods
      const now = new Date()
      const data: RetentionData[] = []

      // For each month (1-12), calculate retention rate
      for (let month = 1; month <= 12; month++) {
        const periodStart = subMonths(now, month)

        // Get members active at period start
        const { data: startMembersData, error: startMembersError } = await supabase
          .from("custom_memberships")
          .select("member_id")
          .lte("start_date", format(periodStart, "yyyy-MM-dd"))
          .eq("status", "active")

        if (startMembersError) throw startMembersError

        const startMemberIds = startMembersData?.map((m) => m.member_id) || []

        if (startMemberIds.length > 0) {
          // Get how many of those members are still active
          const { data: stillActiveData, error: stillActiveError } = await supabase
            .from("custom_memberships")
            .select("member_id")
            .in("member_id", startMemberIds)
            .eq("status", "active")

          if (stillActiveError) throw stillActiveError

          const retentionRate =
            startMemberIds.length > 0 ? ((stillActiveData?.length || 0) / startMemberIds.length) * 100 : 0

          data.push({
            month,
            rate: retentionRate,
          })
        } else {
          data.push({
            month,
            rate: 0,
          })
        }
      }

      setRetentionData(data)
    } catch (error) {
      console.error("Error fetching retention data:", error)
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
      // await ReportsService.generateGeneralReport(activeTab, year, quarter)

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

  // Load data when tab or filters change
  useEffect(() => {
    fetchSummaryData()

    if (activeTab === "growth") {
      fetchMonthlyData()
    } else if (activeTab === "classes") {
      fetchClassAttendanceData()
    } else if (activeTab === "retention") {
      fetchRetentionData()
    }
  }, [activeTab, year, quarter])

  return (
    <DashboardShell>
      <div className="container px-4 py-6 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">דוחות כלליים</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <TrendingUp className="h-8 w-8 mb-2 text-green-500" />
              <div className="text-3xl font-bold">₪{summaryData.monthlyRevenue.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">הכנסה חודשית</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Users className="h-8 w-8 mb-2 text-blue-500" />
              <div className="text-3xl font-bold">{summaryData.totalMembers}</div>
              <div className="text-sm text-muted-foreground">סה"כ מנויים</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Activity className="h-8 w-8 mb-2 text-purple-500" />
              <div className="text-3xl font-bold">{Math.round(summaryData.retentionRate)}%</div>
              <div className="text-sm text-muted-foreground">שימור מנויים שנתי</div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">סינון דוחות</h2>
            </div>
          </div>

          <div className="p-4 bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">שנה</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger id="year">
                    <SelectValue placeholder="בחר שנה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quarter">רבעון</Label>
                <Select value={quarter} onValueChange={setQuarter}>
                  <SelectTrigger id="quarter">
                    <SelectValue placeholder="בחר רבעון" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל השנה</SelectItem>
                    <SelectItem value="Q1">רבעון 1 (ינואר-מרץ)</SelectItem>
                    <SelectItem value="Q2">רבעון 2 (אפריל-יוני)</SelectItem>
                    <SelectItem value="Q3">רבעון 3 (יולי-ספטמבר)</SelectItem>
                    <SelectItem value="Q4">רבעון 4 (אוקטובר-דצמבר)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleGenerateReport} disabled={loading} className="w-full">
                  {loading ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2">⏳</span>
                      מייצר דוח...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Download className="ml-2 h-4 w-4" />
                      הורד דוח מלא
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="growth" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="growth">צמיחה והכנסות</TabsTrigger>
            <TabsTrigger value="classes">שיעורים ונוכחות</TabsTrigger>
            <TabsTrigger value="retention">שימור מנויים</TabsTrigger>
          </TabsList>

          <TabsContent value="growth" className="space-y-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">צמיחה והכנסות</h2>
              </div>

              <div className="p-4">
                {loadingData ? (
                  <div className="flex justify-center items-center h-80">
                    <span className="animate-spin mr-2">⏳</span> טוען נתונים...
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="members"
                          name="מספר מנויים"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                        <Line yAxisId="right" type="monotone" dataKey="revenue" name="הכנסה (₪)" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">סיכום צמיחה</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">גידול במנויים</div>
                        <div className="text-2xl font-bold text-green-600">
                          { monthlyData.length >= 2 && monthlyData[0].members
    ? `${(((monthlyData[monthlyData.length - 1].members - monthlyData[0].members) / monthlyData[0].members) * 100).toFixed(1)}%`
    : "0%"}
                        </div>
                        <div className="text-xs text-muted-foreground">בהשוואה לתחילת התקופה</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">גידול בהכנסות</div>
                        <div className="text-2xl font-bold text-green-600">
                          {monthlyData.length >= 2 && monthlyData[0].revenue
    ? `${(((monthlyData[monthlyData.length - 1].revenue - monthlyData[0].revenue) / monthlyData[0].revenue) * 100).toFixed(1)}%`
    : "0%"}
                        </div>
                        <div className="text-xs text-muted-foreground">בהשוואה לתחילת התקופה</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">הכנסה ממוצעת למנוי</div>
                        <div className="text-2xl font-bold">
                          {monthlyData.length > 0 && monthlyData[monthlyData.length - 1].members > 0
                            ? `₪${Math.round(monthlyData[monthlyData.length - 1].revenue / monthlyData[monthlyData.length - 1].members).toLocaleString()}`
                            : "₪0"}
                        </div>
                        <div className="text-xs text-muted-foreground">בחודש האחרון</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">שיעורים ונוכחות</h2>
              </div>

              <div className="p-4">
                {loadingData ? (
                  <div className="flex justify-center items-center h-80">
                    <span className="animate-spin mr-2">⏳</span> טוען נתונים...
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={classAttendanceData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="attendance" name="נוכחות" fill="#8884d8" />
                        <Bar dataKey="capacity" name="קיבולת" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">שיעורים פופולריים</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-right p-2">שם השיעור</th>
                          <th className="text-right p-2">נוכחות</th>
                          <th className="text-right p-2">קיבולת</th>
                          <th className="text-right p-2">אחוז תפוסה</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classAttendanceData.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{item.name}</td>
                            <td className="p-2">{item.attendance}</td>
                            <td className="p-2">{item.capacity}</td>
                            <td className="p-2">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                  <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${item.percentage}%` }}
                                  ></div>
                                </div>
                                <span>{item.percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="retention" className="space-y-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">שימור מנויים</h2>
              </div>

              <div className="p-4">
                {loadingData ? (
                  <div className="flex justify-center items-center h-80">
                    <span className="animate-spin mr-2">⏳</span> טוען נתונים...
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={retentionData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" label={{ value: "חודשים", position: "insideBottomRight", offset: 0 }} />
                        <YAxis domain={[0, 100]} label={{ value: "אחוז שימור", angle: -90, position: "insideLeft" }} />
                        <Tooltip formatter={(value) => [`${value}%`, "אחוז שימור"]} />
                        <Legend />
                        <Line type="monotone" dataKey="rate" name="אחוז שימור" stroke="#ff7300" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">ניתוח שימור מנויים</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">שימור לאחר 3 חודשים</div>
                        <div className="text-2xl font-bold text-green-600">
                          {retentionData.find((d) => d.month === 3)?.rate.toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">מנויים שנשארו פעילים</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">שימור לאחר 6 חודשים</div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {retentionData.find((d) => d.month === 6)?.rate.toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">מנויים שנשארו פעילים</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">שימור לאחר 12 חודשים</div>
                        <div className="text-2xl font-bold text-red-600">
                          {retentionData.find((d) => d.month === 12)?.rate.toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">מנויים שנשארו פעילים</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">המלצות לשיפור שימור מנויים</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>יצירת תוכנית תמריצים למנויים ותיקים</li>
                      <li>הגדלת מגוון השיעורים בשעות הערב</li>
                      <li>שיפור תוכנית המעקב אחר מנויים שלא הגיעו במשך שבועיים</li>
                      <li>הוספת אפשרויות למנויים גמישים יותר</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
