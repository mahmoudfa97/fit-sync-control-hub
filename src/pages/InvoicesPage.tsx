"use client"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Download,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Send,
  SlidersHorizontal,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Receipt,
  CreditCard,
  Banknote,
  CalendarRange,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { format, subDays } from "date-fns"

interface Invoice {
  id: string
  invoice_number: string
  member_name: string
  member_id: string
  issue_date: string
  due_date: string
  amount: number
  status: "paid" | "pending" | "overdue" | "cancelled"
  payment_method?: string
  items?: InvoiceItem[]
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
  total: number
}

interface InvoiceStats {
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  totalAmount: number
  paidAmount: number
}

export default function InvoicesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "detail">("list")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [stats, setStats] = useState<InvoiceStats>({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
  })

  // Filter states
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  })
  const [sortBy, setSortBy] = useState<"date" | "amount" | "number">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Fetch invoices from database
  const fetchInvoices = async () => {
    try {
      setLoading(true)

      // In a real implementation, you would fetch from an invoices table
      // For this example, we'll use the payments table as a proxy for invoices
      const { data, error } = await supabase
        .from("payments")
        .select(`
          id, 
          payment_date,
          amount,
          payment_method,
          status,
          receipt_number,
          custom_members!member_id (
            id,
            name,
            last_name
          )
        `)
        .order("payment_date", { ascending: false })

      if (error) throw error

      // Transform data to match our Invoice interface
      const transformedData: Invoice[] = (data || []).map((item) => {
        // Generate a due date (in a real app, this would come from the database)
        const issueDate = new Date(item.payment_date)
        const dueDate = new Date(issueDate)
        dueDate.setDate(dueDate.getDate() + 14) // Due in 14 days

        // Determine status based on payment date and current date
        let status: "paid" | "pending" | "overdue" | "cancelled" = "pending"
        if (item.status === "paid" || Math.random() > 0.3) {
          status = "paid"
        } else if (dueDate < new Date()) {
          status = "overdue"
        } else if (Math.random() < 0.1) {
          status = "cancelled"
        }

        return {
          id: item.id,
          invoice_number: item.receipt_number || `INV-${Math.floor(Math.random() * 10000)}`,
          member_name: `${item.custom_members?.name || ""} ${item.custom_members?.last_name || ""}`,
          member_id: item.custom_members?.id || "",
          issue_date: item.payment_date,
          due_date: format(dueDate, "yyyy-MM-dd"),
          amount: item.amount,
          status: status,
          payment_method: item.payment_method,
          // Generate some random invoice items
          items: [
            {
              id: `item-1-${item.id}`,
              description: "מנוי חודשי",
              quantity: 1,
              price: item.amount * 0.8,
              total: item.amount * 0.8,
            },
            {
              id: `item-2-${item.id}`,
              description: "שיעורים פרטיים",
              quantity: 2,
              price: item.amount * 0.1,
              total: item.amount * 0.2,
            },
          ],
        }
      })

      setInvoices(transformedData)
      applyFilters(transformedData, activeTab, searchTerm, dateRange)
      calculateStats(transformedData)
    } catch (error) {
      console.error("Error fetching invoices:", error)
      toast({
        title: "שגיאה בטעינת חשבוניות",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Apply filters to invoices
  const applyFilters = (data: Invoice[], tab: string, search: string, dates: { start: string; end: string }) => {
    let filtered = [...data]

    // Filter by tab (status)
    if (tab !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === tab)
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoice_number.toLowerCase().includes(searchLower) ||
          invoice.member_name.toLowerCase().includes(searchLower),
      )
    }

    // Filter by date range
    filtered = filtered.filter((invoice) => invoice.issue_date >= dates.start && invoice.issue_date <= dates.end)

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.issue_date).getTime() - new Date(b.issue_date).getTime()
          : new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime()
      } else if (sortBy === "amount") {
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount
      } else {
        // Sort by invoice number
        return sortOrder === "asc"
          ? a.invoice_number.localeCompare(b.invoice_number)
          : b.invoice_number.localeCompare(a.invoice_number)
      }
    })

    setFilteredInvoices(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Calculate invoice statistics
  const calculateStats = (data: Invoice[]) => {
    const stats = {
      totalInvoices: data.length,
      paidInvoices: data.filter((inv) => inv.status === "paid").length,
      pendingInvoices: data.filter((inv) => inv.status === "pending").length,
      overdueInvoices: data.filter((inv) => inv.status === "overdue").length,
      totalAmount: data.reduce((sum, inv) => sum + inv.amount, 0),
      paidAmount: data.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0),
    }
    setStats(stats)
  }

  // Handle invoice selection for detailed view
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setViewMode("detail")
  }

  // Handle back to list view
  const handleBackToList = () => {
    setViewMode("list")
    setSelectedInvoice(null)
  }

  // Handle invoice actions
  const handleInvoiceAction = (action: string, invoice: Invoice) => {
    switch (action) {
      case "download":
        toast({
          title: "מוריד חשבונית",
          description: `חשבונית מספר ${invoice.invoice_number} מורדת כעת`,
        })
        break
      case "send":
        toast({
          title: "שולח חשבונית",
          description: `חשבונית מספר ${invoice.invoice_number} נשלחה בהצלחה`,
        })
        break
      case "print":
        toast({
          title: "מדפיס חשבונית",
          description: `חשבונית מספר ${invoice.invoice_number} נשלחה להדפסה`,
        })
        break
      case "delete":
        toast({
          title: "מוחק חשבונית",
          description: `חשבונית מספר ${invoice.invoice_number} נמחקה בהצלחה`,
          variant: "destructive",
        })
        break
      case "markAsPaid":
        const updatedInvoices = invoices.map((inv) =>
          inv.id === invoice.id ? { ...inv, status: "paid" as const } : inv,
        )
        setInvoices(updatedInvoices)
        applyFilters(updatedInvoices, activeTab, searchTerm, dateRange)
        calculateStats(updatedInvoices)
        toast({
          title: "חשבונית סומנה כשולמה",
          description: `חשבונית מספר ${invoice.invoice_number} סומנה כשולמה בהצלחה`,
        })
        break
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    applyFilters(invoices, value, searchTerm, dateRange)
  }

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    applyFilters(invoices, activeTab, value, dateRange)
  }

  // Handle date range change
  const handleDateRangeChange = (field: "start" | "end", value: string) => {
    const newDateRange = { ...dateRange, [field]: value }
    setDateRange(newDateRange)
    applyFilters(invoices, activeTab, searchTerm, newDateRange)
  }

  // Handle sort change
  const handleSortChange = (field: "date" | "amount" | "number") => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      // Set new sort field and default to descending
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            שולם
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            ממתין לתשלום
          </Badge>
        )
      case "overdue":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            באיחור
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            בוטל
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get payment method icon
  const getPaymentMethodIcon = (method?: string) => {
    if (!method) return <Receipt className="h-4 w-4" />

    switch (method.toLowerCase()) {
      case "כרטיס אשראי":
        return <CreditCard className="h-4 w-4" />
      case "מזומן":
        return <Banknote className="h-4 w-4" />
      case "העברה בנקאית":
        return <Receipt className="h-4 w-4" />
      default:
        return <Receipt className="h-4 w-4" />
    }
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)

  // Load data on component mount
  useEffect(() => {
    fetchInvoices()
  }, [])

  return (
    <DashboardShell>
      <div className="container px-4 py-6 mx-auto">
        {viewMode === "list" ? (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold">חשבוניות</h1>
                <p className="text-muted-foreground">ניהול וצפייה בחשבוניות</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> צור חשבונית חדשה
                </Button>
                <Button variant="outline" onClick={fetchInvoices} disabled={loading}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> רענן
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <p className="text-sm text-muted-foreground">סה"כ חשבוניות</p>
                  <p className="text-2xl font-bold">{stats.totalInvoices}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <p className="text-sm text-muted-foreground">שולמו</p>
                  <p className="text-2xl font-bold text-green-600">{stats.paidInvoices}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <p className="text-sm text-muted-foreground">ממתינות</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingInvoices}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <p className="text-sm text-muted-foreground">באיחור</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdueInvoices}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <p className="text-sm text-muted-foreground">סה"כ סכום</p>
                  <p className="text-2xl font-bold">₪{stats.totalAmount.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <p className="text-sm text-muted-foreground">סה"כ שולם</p>
                  <p className="text-2xl font-bold text-green-600">₪{stats.paidAmount.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border mb-6">
              <div className="p-4 border-b">
                <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="all">הכל</TabsTrigger>
                    <TabsTrigger value="paid">שולמו</TabsTrigger>
                    <TabsTrigger value="pending">ממתינות</TabsTrigger>
                    <TabsTrigger value="overdue">באיחור</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="חיפוש לפי מספר חשבונית או שם לקוח..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <Label htmlFor="startDate" className="sr-only">
                        מתאריך
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => handleDateRangeChange("start", e.target.value)}
                      />
                    </div>
                    <div className="w-1/2">
                      <Label htmlFor="endDate" className="sr-only">
                        עד תאריך
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => handleDateRangeChange("end", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="w-full">
                      <Filter className="mr-2 h-4 w-4" /> סנן
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <SlidersHorizontal className="mr-2 h-4 w-4" /> מיון
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>מיין לפי</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSortChange("date")}>
                          <CalendarRange className="mr-2 h-4 w-4" />
                          תאריך {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange("amount")}>
                          <Receipt className="mr-2 h-4 w-4" />
                          סכום {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSortChange("number")}>
                          <FileText className="mr-2 h-4 w-4" />
                          מספר חשבונית {sortBy === "number" && (sortOrder === "asc" ? "↑" : "↓")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Invoices Table */}
              <div className="overflow-x-auto">
                <Table dir="rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox />
                      </TableHead>
                      <TableHead className="text-right cursor-pointer" onClick={() => handleSortChange("number")}>
                        <div className="flex items-center">
                          מספר חשבונית
                          {sortBy === "number" && <ArrowUpDown className="mr-2 h-4 w-4" />}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">לקוח</TableHead>
                      <TableHead className="text-right cursor-pointer" onClick={() => handleSortChange("date")}>
                        <div className="flex items-center">
                          תאריך הנפקה
                          {sortBy === "date" && <ArrowUpDown className="mr-2 h-4 w-4" />}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">תאריך תשלום</TableHead>
                      <TableHead className="text-right cursor-pointer" onClick={() => handleSortChange("amount")}>
                        <div className="flex items-center">
                          סכום
                          {sortBy === "amount" && <ArrowUpDown className="mr-2 h-4 w-4" />}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">סטטוס</TableHead>
                      <TableHead className="text-right">אמצעי תשלום</TableHead>
                      <TableHead className="text-right">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">טוען חשבוניות...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : currentInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">לא נמצאו חשבוניות</p>
                            <Button variant="link" onClick={fetchInvoices}>
                              רענן נתונים
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox />
                          </TableCell>
                          <TableCell className="font-medium" onClick={() => handleViewInvoice(invoice)}>
                            {invoice.invoice_number}
                          </TableCell>
                          <TableCell onClick={() => handleViewInvoice(invoice)}>{invoice.member_name}</TableCell>
                          <TableCell onClick={() => handleViewInvoice(invoice)}>
                            {format(new Date(invoice.issue_date), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell onClick={() => handleViewInvoice(invoice)}>
                            {format(new Date(invoice.due_date), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell onClick={() => handleViewInvoice(invoice)}>
                            ₪{invoice.amount.toLocaleString()}
                          </TableCell>
                          <TableCell onClick={() => handleViewInvoice(invoice)}>
                            {getStatusBadge(invoice.status)}
                          </TableCell>
                          <TableCell onClick={() => handleViewInvoice(invoice)}>
                            <div className="flex items-center gap-1">
                              {getPaymentMethodIcon(invoice.payment_method)}
                              <span>{invoice.payment_method || "לא צוין"}</span>
                            </div>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewInvoice(invoice)}
                                title="צפה בחשבונית"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleInvoiceAction("download", invoice)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    הורד PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleInvoiceAction("send", invoice)}>
                                    <Send className="mr-2 h-4 w-4" />
                                    שלח ללקוח
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleInvoiceAction("print", invoice)}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    הדפס
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {invoice.status !== "paid" && (
                                    <DropdownMenuItem onClick={() => handleInvoiceAction("markAsPaid", invoice)}>
                                      <CheckCircle2 className="mr-2 h-4 w-4" />
                                      סמן כשולם
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleInvoiceAction("delete", invoice)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    מחק
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredInvoices.length > 0 && (
                <div className="p-4 border-t flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    מציג {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredInvoices.length)} מתוך{" "}
                    {filteredInvoices.length} חשבוניות
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      עמוד {currentPage} מתוך {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          // Invoice Detail View
          <>
            <div className="flex items-center mb-6">
              <Button variant="ghost" onClick={handleBackToList} className="mr-2">
                <ChevronRight className="h-4 w-4 mr-2" />
                חזרה לרשימה
              </Button>
              <h1 className="text-2xl font-bold">חשבונית {selectedInvoice?.invoice_number}</h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm border mb-6">
              <div className="p-6 border-b">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <h2 className="text-xl font-bold">חשבונית #{selectedInvoice?.invoice_number}</h2>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">תאריך הנפקה:</span>{" "}
                        {format(new Date(selectedInvoice?.issue_date || new Date()), "dd/MM/yyyy")}
                      </p>
                      <p>
                        <span className="text-muted-foreground">תאריך תשלום:</span>{" "}
                        {format(new Date(selectedInvoice?.due_date || new Date()), "dd/MM/yyyy")}
                      </p>
                      <p>
                        <span className="text-muted-foreground">סטטוס:</span>{" "}
                        {getStatusBadge(selectedInvoice?.status || "")}
                      </p>
                      <p>
                        <span className="text-muted-foreground">אמצעי תשלום:</span>{" "}
                        <span className="flex items-center gap-1">
                          {getPaymentMethodIcon(selectedInvoice?.payment_method)}
                          {selectedInvoice?.payment_method || "לא צוין"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-sm">
                    <div className="mb-4">
                      <h3 className="font-semibold mb-1">פרטי לקוח</h3>
                      <p className="font-medium">{selectedInvoice?.member_name}</p>
                      <p className="text-muted-foreground">מזהה לקוח: {selectedInvoice?.member_id}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-1">פרטי העסק</h3>
                      <p className="font-medium">מרכז הספורט שלי</p>
                      <p className="text-muted-foreground">ח.פ. 123456789</p>
                      <p className="text-muted-foreground">רחוב הספורט 123, תל אביב</p>
                      <p className="text-muted-foreground">טלפון: 03-1234567</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold mb-4">פריטים</h3>
                <div className="overflow-x-auto">
                  <Table dir="rtl">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">תיאור</TableHead>
                        <TableHead className="text-right">כמות</TableHead>
                        <TableHead className="text-right">מחיר</TableHead>
                        <TableHead className="text-right">סה"כ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice?.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₪{item.price.toLocaleString()}</TableCell>
                          <TableCell>₪{item.total.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6 flex justify-end">
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">סכום ביניים:</span>
                      <span>₪{selectedInvoice?.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">מע"מ (17%):</span>
                      <span>₪{((selectedInvoice?.amount || 0) * 0.17).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>סה"כ לתשלום:</span>
                      <span>₪{selectedInvoice?.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
                  <p>הערות:</p>
                  <p>תודה על העסקתך איתנו! אנא שלם את החשבונית עד לתאריך הנקוב.</p>
                </div>
              </div>

              <div className="p-6 border-t bg-muted/30 flex flex-wrap gap-2 justify-end">
                <Button variant="outline" onClick={() => handleInvoiceAction("print", selectedInvoice!)}>
                  <Printer className="mr-2 h-4 w-4" /> הדפס
                </Button>
                <Button variant="outline" onClick={() => handleInvoiceAction("download", selectedInvoice!)}>
                  <Download className="mr-2 h-4 w-4" /> הורד PDF
                </Button>
                <Button variant="outline" onClick={() => handleInvoiceAction("send", selectedInvoice!)}>
                  <Send className="mr-2 h-4 w-4" /> שלח ללקוח
                </Button>
                {selectedInvoice?.status !== "paid" && (
                  <Button onClick={() => handleInvoiceAction("markAsPaid", selectedInvoice!)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> סמן כשולם
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>יצירת חשבונית חדשה</DialogTitle>
            <DialogDescription>הזן את פרטי החשבונית החדשה. לחץ על שמור כשתסיים.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">לקוח</Label>
                <Select>
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="בחר לקוח" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer1">ישראל ישראלי</SelectItem>
                    <SelectItem value="customer2">חיים כהן</SelectItem>
                    <SelectItem value="customer3">שרה לוי</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issueDate">תאריך הנפקה</Label>
                <Input id="issueDate" type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">תאריך לתשלום</Label>
                <Input
                  id="dueDate"
                  type="date"
                  defaultValue={format(new Date(new Date().setDate(new Date().getDate() + 14)), "yyyy-MM-dd")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">אמצעי תשלום</Label>
                <Select>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="בחר אמצעי תשלום" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">כרטיס אשראי</SelectItem>
                    <SelectItem value="cash">מזומן</SelectItem>
                    <SelectItem value="transfer">העברה בנקאית</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>פריטים</Label>
              <div className="border rounded-md p-4 space-y-4">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-6">
                    <Label htmlFor="item1">תיאור</Label>
                    <Input id="item1" placeholder="מנוי חודשי" />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="quantity1">כמות</Label>
                    <Input id="quantity1" type="number" defaultValue="1" />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="price1">מחיר</Label>
                    <Input id="price1" type="number" placeholder="100" />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="total1">סה"כ</Label>
                    <Input id="total1" type="number" placeholder="100" disabled />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> הוסף פריט
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">הערות</Label>
              <Input id="notes" placeholder="הערות לחשבונית..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              ביטול
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: "חשבונית נוצרה בהצלחה",
                  description: "החשבונית החדשה נוצרה ונשמרה במערכת",
                })
                setIsCreateDialogOpen(false)
              }}
            >
              צור חשבונית
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
