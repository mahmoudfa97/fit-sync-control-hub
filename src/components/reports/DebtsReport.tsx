"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as ReportsService from "@/services/ReportsService"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/integrations/supabase/client"

interface DebtData {
  id: string
  member_id: string
  name: string
  last_name: string
  email: string
  phone: string
  total_debt: number
  last_payment_date: string
  days_overdue: number
  subscription_type: string
  status: string
}

interface FilterState {
  debtStatus: string
  minAmount: string
  maxAmount: string
  searchTerm: string
  subscriptionType: string
  sortBy: "amount" | "days" | "name"
  sortOrder: "asc" | "desc"
}

interface SummaryData {
  totalDebt: number
  activeMembers: number
  averageDebt: number
  maxDebt: number
}

export default function DebtsReport() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [debts, setDebts] = useState<DebtData[]>([])
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalDebt: 0,
    activeMembers: 0,
    averageDebt: 0,
    maxDebt: 0,
  })

  const [filters, setFilters] = useState<FilterState>({
    debtStatus: "all",
    minAmount: "",
    maxAmount: "",
    searchTerm: "",
    subscriptionType: "all",
    sortBy: "amount",
    sortOrder: "desc",
  })

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Fetch debts data from Supabase
  const fetchDebts = async () => {
    try {
      setLoadingData(true)

      // Get all members with their memberships and payments
      const { data: membersData, error: membersError } = await supabase.from("custom_members").select(`
          id, 
          name,
          last_name,
          email,
          phone,
          custom_memberships (
            id,
            membership_type,
            start_date,
            end_date,
            status
          ),
          payments (
            amount,
            payment_date
          )
        `)

      if (membersError) throw membersError

      // Calculate debt for each member
      const debtData: DebtData[] = (membersData || []).map((member) => {
        // Get the latest membership
        const memberships = member.custom_memberships || []
        const latestMembership =
          memberships.length > 0
            ? memberships.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())[0]
            : null

        // Calculate total payments
        const payments = member.payments || []
        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)

        // Get membership cost (in a real app, this would be more accurate)
        const membershipCost = latestMembership?.membership_type === "premium" ? 200 : 100

        // Calculate debt
        const totalDebt = latestMembership ? membershipCost - totalPaid : 0

        // Calculate days overdue
        const lastPaymentDate =
          payments.length > 0
            ? new Date(
                payments.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())[0]
                  .payment_date,
              )
            : new Date(2023, 0, 1)

        const daysOverdue = Math.floor((new Date().getTime() - lastPaymentDate.getTime()) / (1000 * 3600 * 24))

        return {
          id: member.id,
          member_id: member.id,
          name: member.name,
          last_name: member.last_name || "",
          email: member.email || "",
          phone: member.phone || "",
          total_debt: totalDebt > 0 ? totalDebt : 0,
          last_payment_date: lastPaymentDate.toISOString(),
          days_overdue: daysOverdue,
          subscription_type: latestMembership?.membership_type || "standard",
          status: latestMembership?.status || "inactive",
        }
      })

      // Apply filters
      let filteredData = debtData

      // Filter by debt status
      if (filters.debtStatus === "with-debt") {
        filteredData = filteredData.filter((debt) => debt.total_debt > 0)
      } else if (filters.debtStatus === "no-debt") {
        filteredData = filteredData.filter((debt) => debt.total_debt === 0)
      }

      // Filter by subscription type
      if (filters.subscriptionType !== "all") {
        filteredData = filteredData.filter((debt) => debt.subscription_type === filters.subscriptionType)
      }

      // Filter by amount
      if (filters.minAmount) {
        filteredData = filteredData.filter((debt) => debt.total_debt >= Number(filters.minAmount))
      }
      if (filters.maxAmount) {
        filteredData = filteredData.filter((debt) => debt.total_debt <= Number(filters.maxAmount))
      }

      // Filter by search term
      if (filters.searchTerm) {
        filteredData = filteredData.filter(
          (debt) =>
            debt.name.includes(filters.searchTerm) ||
            debt.last_name.includes(filters.searchTerm) ||
            debt.email.includes(filters.searchTerm) ||
            debt.phone.includes(filters.searchTerm),
        )
      }

      // Sort data
      filteredData.sort((a, b) => {
        if (filters.sortBy === "amount") {
          return filters.sortOrder === "asc" ? a.total_debt - b.total_debt : b.total_debt - a.total_debt
        } else if (filters.sortBy === "days") {
          return filters.sortOrder === "asc" ? a.days_overdue - b.days_overdue : b.days_overdue - a.days_overdue
        } else {
          // Sort by name
          const nameA = `${a.name} ${a.last_name}`
          const nameB = `${b.name} ${b.last_name}`
          return filters.sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
        }
      })

      setDebts(filteredData)

      // Calculate summary data
      const withDebt = filteredData.filter((debt) => debt.total_debt > 0)
      const summary = {
        totalDebt: withDebt.reduce((sum, debt) => sum + debt.total_debt, 0),
        activeMembers: withDebt.length,
        averageDebt:
          withDebt.length > 0 ? withDebt.reduce((sum, debt) => sum + debt.total_debt, 0) / withDebt.length : 0,
        maxDebt: withDebt.length > 0 ? Math.max(...withDebt.map((debt) => debt.total_debt)) : 0,
      }

      setSummaryData(summary)

      toast({
        title: "נתונים נטענו בהצלחה",
        description: `${filteredData.length} חברים נמצאו`,
      })
    } catch (error) {
      console.error("Error fetching debts:", error)
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
      await ReportsService.generateDebtsReport(filters)

      toast({
        title: "הדוח נוצר בהצלחה",
        description: "הקובץ הורד למחשב שלך",
      })
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "שגיאה ביצירת הדוח",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchDebts()
  }, [])

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">₪{summaryData.totalDebt.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">סה"כ חובות</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">{summaryData.activeMembers}</div>
            <div className="text-sm text-muted-foreground">מנויים עם חוב</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">
              ₪{summaryData.averageDebt.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-muted-foreground">חוב ממוצע</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">₪{summaryData.maxDebt.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">חוב מקסימלי</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">דוח חובות מנויים</h2>
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
              <Input
                id="searchTerm"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                placeholder="חיפוש לפי שם, אימייל, טלפון..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debtStatus">סטטוס חוב</Label>
              <Select value={filters.debtStatus} onValueChange={(value) => handleFilterChange("debtStatus", value)}>
                <SelectTrigger id="debtStatus">
                  <SelectValue placeholder="כל הסטטוסים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הסטטוסים</SelectItem>
                  <SelectItem value="with-debt">עם חוב</SelectItem>
                  <SelectItem value="no-debt">ללא חוב</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscriptionType">סוג מנוי</Label>
              <Select
                value={filters.subscriptionType}
                onValueChange={(value) => handleFilterChange("subscriptionType", value)}
              >
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="amountRange">טווח סכומים</Label>
              <div className="flex space-x-2 space-x-reverse">
                <Input
                  id="minAmount"
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                  placeholder="מינימום"
                  className="w-1/2"
                />
                <Input
                  id="maxAmount"
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                  placeholder="מקסימום"
                  className="w-1/2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortBy">מיון לפי</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange("sortBy", value as "amount" | "days" | "name")}
              >
                <SelectTrigger id="sortBy">
                  <SelectValue placeholder="מיון לפי" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">סכום חוב</SelectItem>
                  <SelectItem value="days">ימי פיגור</SelectItem>
                  <SelectItem value="name">שם</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">סדר מיון</Label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => handleFilterChange("sortOrder", value as "asc" | "desc")}
              >
                <SelectTrigger id="sortOrder">
                  <SelectValue placeholder="סדר מיון" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">עולה</SelectItem>
                  <SelectItem value="desc">יורד</SelectItem>
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
                <TableHead className="text-right">סוג מנוי</TableHead>
                <TableHead className="text-right">תשלום אחרון</TableHead>
                <TableHead className="text-right">ימי פיגור</TableHead>
                <TableHead className="text-right">סכום חוב</TableHead>
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
              ) : debts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    לא נמצאו חובות בהתאם לסינון שנבחר
                  </TableCell>
                </TableRow>
              ) : (
                debts.map((debt) => (
                  <TableRow key={debt.id} className={debt.total_debt > 0 ? "bg-red-50" : ""}>
                    <TableCell>{`${debt.name} ${debt.last_name}`}</TableCell>
                    <TableCell>{debt.phone}</TableCell>
                    <TableCell>{debt.email}</TableCell>
                    <TableCell>{debt.subscription_type === "premium" ? "פרימיום" : "רגיל"}</TableCell>
                    <TableCell>{new Date(debt.last_payment_date).toLocaleDateString("he-IL")}</TableCell>
                    <TableCell>{debt.days_overdue}</TableCell>
                    <TableCell className={debt.total_debt > 0 ? "font-bold text-red-600" : ""}>
                      ₪{debt.total_debt.toLocaleString()}
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

        <div className="p-4 border-t flex justify-center">
          <Button onClick={fetchDebts} variant="outline" disabled={loadingData}>
            {loadingData ? "טוען..." : "רענן נתונים"}
          </Button>
        </div>
      </div>
    </div>
  )
}
