"use client"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as ReportsService from "@/services/ReportsService"
import * as enhancedPayments from "@/services/enhanced-payments-report"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/integrations/supabase/client"
import { format, startOfMonth, endOfMonth } from "date-fns"

interface FilterState {
  month: string
  year: string
  paymentMethod: string
  minAmount: string
  maxAmount: string
  searchTerm: string
  filterType: "monthYear" | "dateRange"
  startDate?: Date
  endDate?: Date
}

interface PaymentData {
  id: string
  member_id: string
  name: string
  last_name: string
  payment_date: string
  amount: number
  payment_method: string
  invoice_id: string
}

interface SummaryData {
  totalAmount: number
  creditCardAmount: number
  cashAmount: number
  checkAmount: number
  bankTransferAmount: number
}

interface MonthlyPaymentSummary {
  month: string
  total: number
  creditCard: number
  cash: number
  check: number
  bankTransfer: number
}

interface PaymentMethodSummary {
  method: string
  amount: number
  count: number
}

export default function PaymentReportPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [activeTab, setActiveTab] = useState("month")
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalAmount: 0,
    creditCardAmount: 0,
    cashAmount: 0,
    checkAmount: 0,
    bankTransferAmount: 0,
  })
  const [monthlySummary, setMonthlySummary] = useState<MonthlyPaymentSummary[]>([])
  const [methodSummary, setMethodSummary] = useState<PaymentMethodSummary[]>([])

  const currentMonth = format(new Date(), "MMMM")
  const currentYear = new Date().getFullYear().toString()

  const [filters, setFilters] = useState<FilterState>({
    month: format(new Date(), "MMMM"),
    year: currentYear,
    paymentMethod: "",
    minAmount: "",
    maxAmount: "",
    searchTerm: "",
    filterType: "monthYear",
  })

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleFilterTypeChange = (type: "monthYear" | "dateRange") => {
    setFilters((prev) => ({
      ...prev,
      filterType: type,
    }))
  }

  // Function to get date range based on filters
  const getDateRange = () => {
    if (filters.filterType === "dateRange" && filters.startDate && filters.endDate) {
      return {
        start: filters.startDate,
        end: filters.endDate,
      }
    } else {
      // Convert month name to month number (0-11)
      const monthNames = [
        "ינואר",
        "פברואר",
        "מרץ",
        "אפריל",
        "מאי",
        "יוני",
        "יולי",
        "אוגוסט",
        "ספטמבר",
        "אוקטובר",
        "נובמבר",
        "דצמבר",
      ]
      const monthIndex = monthNames.indexOf(filters.month)
      const year = Number.parseInt(filters.year)

      if (monthIndex !== -1 && !isNaN(year)) {
        const start = startOfMonth(new Date(year, monthIndex))
        const end = endOfMonth(new Date(year, monthIndex))
        return { start, end }
      } else {
        // Default to current month
        const now = new Date()
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        }
      }
    }
  }

  // Fetch payments data from Supabase
  const fetchPayments = async () => {
    try {
      setLoadingData(true)
      const { start, end } = getDateRange()

      // Build query
      let query = supabase
        .from("payments")
        .select(`
          id, 
          payment_date,
          amount,
          payment_method,
          invoice_id,
          custom_members!member_id (id, name, last_name)
        `)
        .gte("payment_date", format(start, "yyyy-MM-dd"))
        .lte("payment_date", format(end, "yyyy-MM-dd"))
        .order("payment_date", { ascending: false })

      // Add payment method filter if provided
      if (filters.paymentMethod && filters.paymentMethod !== "all") {
        query = query.eq("payment_method", filters.paymentMethod)
      }

      // Add amount filters if provided
      if (filters.minAmount) {
        query = query.gte("amount", Number.parseFloat(filters.minAmount))
      }
      if (filters.maxAmount) {
        query = query.lte("amount", Number.parseFloat(filters.maxAmount))
      }

      // Execute query
      const { data, error } = await query

      if (error) throw error

      // Transform data
      const transformedData = (data || []).map((item) => ({
        id: item.id,
        member_id: item.custom_members.id,
        name: item.custom_members.name,
        last_name: item.custom_members.last_name,
        payment_date: item.payment_date,
        amount: item.amount,
        payment_method: item.payment_method,
        invoice_id: item.invoice_id,
      }))

      // Apply search filter if provided
      const filteredData = filters.searchTerm
        ? transformedData.filter(
            (payment) =>
              payment.name.includes(filters.searchTerm) ||
              payment.last_name.includes(filters.searchTerm) ||
              payment.invoice_id.includes(filters.searchTerm),
          )
        : transformedData

      setPayments(filteredData)

      // Calculate summary data
      calculateSummaryData(data || [])

      toast({
        title: "נתונים נטענו בהצלחה",
        description: `${filteredData.length} תקבולים נמצאו`,
      })
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  // Calculate summary data from payments
  const calculateSummaryData = (data: any[]) => {
    const summary = {
      totalAmount: 0,
      creditCardAmount: 0,
      cashAmount: 0,
      checkAmount: 0,
      bankTransferAmount: 0,
    }

    data.forEach((payment) => {
      summary.totalAmount += payment.amount

      switch (payment.payment_method.toLowerCase()) {
        case "כרטיס אשראי":
          summary.creditCardAmount += payment.amount
          break
        case "מזומן":
          summary.cashAmount += payment.amount
          break
        case "cash":
          summary.cashAmount += payment.amount
          break
        case "צ'ק":
          summary.checkAmount += payment.amount
          break
        case "העברה בנקאית":
          summary.bankTransferAmount += payment.amount
          break
      }
    })

    setSummaryData(summary)
  }

  // Fetch monthly summary data
  const fetchMonthlySummary = async () => {
    try {
      const year = Number.parseInt(filters.year)
      if (isNaN(year)) return

      const monthNames = [
        "ינואר",
        "פברואר",
        "מרץ",
        "אפריל",
        "מאי",
        "יוני",
        "יולי",
        "אוגוסט",
        "ספטמבר",
        "אוקטובר",
        "נובמבר",
        "דצמבר",
      ]

      const summaryData: MonthlyPaymentSummary[] = []

      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const start = startOfMonth(new Date(year, monthIndex))
        const end = endOfMonth(new Date(year, monthIndex))

        const { data, error } = await supabase
          .from("payments")
          .select(`
            payment_method,
            amount
          `)
          .gte("payment_date", format(start, "yyyy-MM-dd"))
          .lte("payment_date", format(end, "yyyy-MM-dd"))

        if (error) throw error

        const summary = {
          month: monthNames[monthIndex],
          total: 0,
          creditCard: 0,
          cash: 0,
          check: 0,
          bankTransfer: 0,
        }

        data?.forEach((payment) => {
          summary.total += payment.amount

          switch (payment.payment_method.toLowerCase()) {
            case "כרטיס אשראי":
              summary.creditCard += payment.amount
              break
            case "מזומן":
              summary.cash += payment.amount
              break
            case "צ'ק":
              summary.check += payment.amount
              break
            case "העברה בנקאית":
              summary.bankTransfer += payment.amount
              break
          }
        })

        summaryData.push(summary)
      }

      setMonthlySummary(summaryData)
    } catch (error) {
      console.error("Error fetching monthly summary:", error)
    }
  }

  // Fetch payment method summary
  const fetchMethodSummary = async () => {
    try {
      const { start, end } = getDateRange()

      // Get all payment methods
      const { data: methodsData, error: methodsError } = await supabase
        .from("payments")
        .select("payment_method")
        .gte("payment_date", format(start, "yyyy-MM-dd"))
        .lte("payment_date", format(end, "yyyy-MM-dd"))

      if (methodsError) throw methodsError

      // Get unique payment methods
      const uniqueMethods = [...new Set(methodsData?.map((item) => item.payment_method))]

      const summaryData: PaymentMethodSummary[] = []

      for (const method of uniqueMethods) {
        // Count payments and sum amounts for this method
        const { data, error } = await supabase
          .from("payments")
          .select("amount")
          .eq("payment_method", method)
          .gte("payment_date", format(start, "yyyy-MM-dd"))
          .lte("payment_date", format(end, "yyyy-MM-dd"))

        if (error) throw error

        const totalAmount = data?.reduce((sum, item) => sum + item.amount, 0) || 0
        const count = data?.length || 0

        summaryData.push({
          method: method,
          amount: totalAmount,
          count: count,
        })
      }

      setMethodSummary(summaryData)
    } catch (error) {
      console.error("Error fetching method summary:", error)
    }
  }

  // Generate report
  const handleGenerateReport = async () => {
    try {
      setLoading(true)
      const { start, end } = getDateRange()

      await enhancedPayments.generateEnhancedPaymentsReport(start, end, filters.paymentMethod)

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

  // Load data when filters change
  useEffect(() => {
    if (activeTab === "month") {
      fetchMonthlySummary()
    } else if (activeTab === "method") {
      fetchMethodSummary()
    }
  }, [activeTab, filters.year])

  return (

      <div className="container px-4 py-6 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">דוח יצירת תקבולים</h1>
        </div>

        <div className="mb-6">
          <div className="flex justify-end mb-4 space-x-4 space-x-reverse">
            <div className="flex items-center">
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="radio"
                  id="filterByDate"
                  name="filterType"
                  value="monthYear"
                  className="form-radio"
                  checked={filters.filterType === "monthYear"}
                  onChange={() => handleFilterTypeChange("monthYear")}
                />
                <Label htmlFor="filterByDate">חיפוש לפי שנה וחודש</Label>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="radio"
                  id="filterByRange"
                  name="filterType"
                  value="dateRange"
                  className="form-radio"
                  checked={filters.filterType === "dateRange"}
                  onChange={() => handleFilterTypeChange("dateRange")}
                />
                <Label htmlFor="filterByRange">חיפוש לפי תקופת תאריכים</Label>
              </div>
            </div>
          </div>

          {filters.filterType === "monthYear" ? (
            <div className="flex justify-end space-x-4 space-x-reverse">
              <div className="w-40">
                <Label htmlFor="month" className="block mb-1">
                  חודש
                </Label>
                <Select value={filters.month} onValueChange={(value) => handleFilterChange("month", value)}>
                  <SelectTrigger id="month">
                    <SelectValue placeholder="בחר חודש" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ינואר">ינואר</SelectItem>
                    <SelectItem value="פברואר">פברואר</SelectItem>
                    <SelectItem value="מרץ">מרץ</SelectItem>
                    <SelectItem value="אפריל">אפריל</SelectItem>
                    <SelectItem value="מאי">מאי</SelectItem>
                    <SelectItem value="יוני">יוני</SelectItem>
                    <SelectItem value="יולי">יולי</SelectItem>
                    <SelectItem value="אוגוסט">אוגוסט</SelectItem>
                    <SelectItem value="ספטמבר">ספטמבר</SelectItem>
                    <SelectItem value="אוקטובר">אוקטובר</SelectItem>
                    <SelectItem value="נובמבר">נובמבר</SelectItem>
                    <SelectItem value="דצמבר">דצמבר</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Label htmlFor="year" className="block mb-1">
                  שנה
                </Label>
                <Select value={filters.year} onValueChange={(value) => handleFilterChange("year", value)}>
                  <SelectTrigger id="year">
                    <SelectValue placeholder="בחר שנה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="flex justify-end space-x-4 space-x-reverse">
              <div className="w-40">
                <Label htmlFor="startDate" className="block mb-1">
                  מתאריך
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value ? new Date(e.target.value) : undefined)
                  }
                />
              </div>
              <div className="w-40">
                <Label htmlFor="endDate" className="block mb-1">
                  עד תאריך
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  onChange={(e) => handleFilterChange("endDate", e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold">₪{summaryData.totalAmount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">סה"כ תקבולים</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold">₪{summaryData.creditCardAmount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">סה"כ כרטיס אשראי</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold">₪{summaryData.cashAmount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">סה"כ מזומן</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold">₪{summaryData.bankTransferAmount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">סה"כ העברות בנקאיות</div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">רשימת תקבולים</h2>
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
                  placeholder="חיפוש לפי שם, מספר חשבונית..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">אמצעי תשלום</Label>
                <Select
                  value={filters.paymentMethod}
                  onValueChange={(value) => handleFilterChange("paymentMethod", value)}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="כל אמצעי התשלום" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל אמצעי התשלום</SelectItem>
                    <SelectItem value="כרטיס אשראי">כרטיס אשראי</SelectItem>
                    <SelectItem value="מזומן">מזומן</SelectItem>
                    <SelectItem value="צ'ק">צ'ק</SelectItem>
                    <SelectItem value="העברה בנקאית">העברה בנקאית</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table dir="rtl">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">מזהה</TableHead>
                  <TableHead className="text-right">שם</TableHead>
                  <TableHead className="text-right">שם משפחה</TableHead>
                  <TableHead className="text-right">תאריך תשלום</TableHead>
                  <TableHead className="text-right">סכום</TableHead>
                  <TableHead className="text-right">אמצעי תשלום</TableHead>
                  <TableHead className="text-right">מזהה חשבונית</TableHead>
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
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      לא נמצאו תקבולים בתקופה שנבחרה
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.id}</TableCell>
                      <TableCell>{payment.name}</TableCell>
                      <TableCell>{payment.last_name}</TableCell>
                      <TableCell>{new Date(payment.payment_date).toLocaleDateString("he-IL")}</TableCell>
                      <TableCell>₪{payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{payment.payment_method}</TableCell>
                      <TableCell>{payment.invoice_id}</TableCell>
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
            <Button onClick={fetchPayments} variant="outline" disabled={loadingData}>
              {loadingData ? "טוען..." : "טען נתונים"}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">סיכום תקבולים לפי חודשים</h2>
          </div>

          <div className="p-4">
            <Tabs defaultValue="month" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="month">לפי חודש</TabsTrigger>
                <TabsTrigger value="method">לפי אמצעי תשלום</TabsTrigger>
              </TabsList>

              <TabsContent value="month" className="space-y-4">
                <div className="overflow-x-auto">
                  <Table dir="rtl">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">חודש</TableHead>
                        <TableHead className="text-right">סה"כ תקבולים</TableHead>
                        <TableHead className="text-right">כרטיס אשראי</TableHead>
                        <TableHead className="text-right">מזומן</TableHead>
                        <TableHead className="text-right">צ'קים</TableHead>
                        <TableHead className="text-right">העברה בנקאית</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlySummary.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            אין נתונים זמינים
                          </TableCell>
                        </TableRow>
                      ) : (
                        monthlySummary.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.month}</TableCell>
                            <TableCell>₪{item.total.toLocaleString()}</TableCell>
                            <TableCell>₪{item.creditCard.toLocaleString()}</TableCell>
                            <TableCell>₪{item.cash.toLocaleString()}</TableCell>
                            <TableCell>₪{item.check.toLocaleString()}</TableCell>
                            <TableCell>₪{item.bankTransfer.toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                      {monthlySummary.length > 0 && (
                        <TableRow className="font-bold bg-muted/30">
                          <TableCell>סה"כ</TableCell>
                          <TableCell>
                            ₪{monthlySummary.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            ₪{monthlySummary.reduce((sum, item) => sum + item.creditCard, 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            ₪{monthlySummary.reduce((sum, item) => sum + item.cash, 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            ₪{monthlySummary.reduce((sum, item) => sum + item.check, 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            ₪{monthlySummary.reduce((sum, item) => sum + item.bankTransfer, 0).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="method" className="space-y-4">
                <div className="overflow-x-auto">
                  <Table dir="rtl">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">אמצעי תשלום</TableHead>
                        <TableHead className="text-right">מספר תשלומים</TableHead>
                        <TableHead className="text-right">סה"כ סכום</TableHead>
                        <TableHead className="text-right">סכום ממוצע</TableHead>
                        <TableHead className="text-right">אחוז מסה"כ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {methodSummary.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            אין נתונים זמינים
                          </TableCell>
                        </TableRow>
                      ) : (
                        methodSummary.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.method}</TableCell>
                            <TableCell>{item.count}</TableCell>
                            <TableCell>₪{item.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              ₪{item.count > 0 ? Math.round(item.amount / item.count).toLocaleString() : 0}
                            </TableCell>
                            <TableCell>
                              {Math.round((item.amount / methodSummary.reduce((sum, i) => sum + i.amount, 0)) * 100)}%
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      {methodSummary.length > 0 && (
                        <TableRow className="font-bold bg-muted/30">
                          <TableCell>סה"כ</TableCell>
                          <TableCell>{methodSummary.reduce((sum, item) => sum + item.count, 0)}</TableCell>
                          <TableCell>
                            ₪{methodSummary.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                          </TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>100%</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
  )
}
