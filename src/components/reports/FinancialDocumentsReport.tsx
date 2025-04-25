"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, ChevronRight, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as ReportsService from "@/services/ReportsService"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/integrations/supabase/client"
import { format } from "date-fns"

interface FinancialDocument {
  id: string
  document_number: string
  document_type: string
  issue_date: string
  due_date: string
  member_name: string
  amount: number
  status: string
}

interface FilterState {
  documentType: string
  dateRange: {
    start: string
    end: string
  }
  status: string
  searchTerm: string
}

export default function FinancialDocumentsReport() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [documents, setDocuments] = useState<FinancialDocument[]>([])

  const [filters, setFilters] = useState<FilterState>({
    documentType: "all",
    dateRange: {
      start: format(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), "yyyy-MM-dd"),
      end: format(new Date(), "yyyy-MM-dd"),
    },
    status: "all",
    searchTerm: "",
  })

  const handleFilterChange = (key: string, value: any) => {
    if (key.includes(".")) {
      const [parent, child] = key.split(".")
      setFilters((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof FilterState],
          [child]: value,
        },
      }))
    } else {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }))
    }
  }

  // Fetch financial documents
  const fetchDocuments = async () => {
    try {
      setLoadingData(true)

      // In a real implementation, you would have a financial_documents table
      // For this example, we'll use the payments table as a proxy for financial documents
      let query = supabase
        .from("payments")
        .select(`
          id,
          payment_date,
          amount,
          payment_method,
          status,
          receipt_number,
          custom_members!member_id (
            name,
            last_name
          )
        `)
        .gte("payment_date", filters.dateRange.start)
        .lte("payment_date", filters.dateRange.end)
        .order("payment_date", { ascending: false })

      // Apply filters
      if (filters.documentType !== "all") {
        query = query.eq("payment_method", filters.documentType)
      }

      if (filters.status !== "all") {
        query = query.eq("status", filters.status)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform data
      const transformedData: FinancialDocument[] = (data || []).map((doc) => ({
        id: doc.id,
        document_number: doc.receipt_number || `INV-${Math.floor(Math.random() * 10000)}`,
        document_type: doc.payment_method === "כרטיס אשראי" ? "חשבונית מס" : "קבלה",
        issue_date: doc.payment_date || new Date().toISOString(),
        due_date: doc.payment_date || new Date().toISOString(), // In a real app, due date would be different
        member_name: `${doc.custom_members?.name || ""} ${doc.custom_members?.last_name || ""}`,
        amount: doc.amount,
        status: doc.status || "שולם",
      }))

      // Apply search filter
      const filteredData = filters.searchTerm
        ? transformedData.filter(
            (doc) => doc.document_number.includes(filters.searchTerm) || doc.member_name.includes(filters.searchTerm),
          )
        : transformedData

      setDocuments(filteredData)

      toast({
        title: "נתונים נטענו בהצלחה",
        description: `${filteredData.length} מסמכים נמצאו`,
      })
    } catch (error) {
      console.error("Error fetching documents:", error)
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

      // Call the report service
      await ReportsService.generateFinancialDocumentsReport(
        filters.dateRange.start,
        filters.dateRange.end,
        filters.documentType,
        filters.status,
      )

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
    fetchDocuments()
  }, [])

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <FileText className="h-8 w-8 mb-2 text-blue-500" />
            <div className="text-3xl font-bold">{documents.length}</div>
            <div className="text-sm text-muted-foreground">סה"כ מסמכים</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">
              ₪{documents.reduce((sum, doc) => sum + doc.amount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">סה"כ סכום</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">
              {documents.filter((doc) => doc.document_type === "חשבונית מס").length}
            </div>
            <div className="text-sm text-muted-foreground">חשבוניות מס</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold">{documents.filter((doc) => doc.document_type === "קבלה").length}</div>
            <div className="text-sm text-muted-foreground">קבלות</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">דוח מסמכים פיננסיים</h2>
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
                placeholder="חיפוש לפי מספר מסמך, שם לקוח..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentType">סוג מסמך</Label>
              <Select value={filters.documentType} onValueChange={(value) => handleFilterChange("documentType", value)}>
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="כל סוגי המסמכים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל סוגי המסמכים</SelectItem>
                  <SelectItem value="כרטיס אשראי">חשבונית מס</SelectItem>
                  <SelectItem value="מזומן">קבלה</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">סטטוס</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="כל הסטטוסים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הסטטוסים</SelectItem>
                  <SelectItem value="שולם">שולם</SelectItem>
                  <SelectItem value="ממתין">ממתין</SelectItem>
                  <SelectItem value="בוטל">בוטל</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="dateRange">טווח תאריכים</Label>
              <div className="flex space-x-2 space-x-reverse">
                <div className="w-1/2">
                  <Label htmlFor="startDate" className="text-xs">
                    מתאריך
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleFilterChange("dateRange.start", e.target.value)}
                  />
                </div>
                <div className="w-1/2">
                  <Label htmlFor="endDate" className="text-xs">
                    עד תאריך
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleFilterChange("dateRange.end", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchDocuments} className="w-full" variant="outline" disabled={loadingData}>
                {loadingData ? "טוען..." : "חפש מסמכים"}
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">מספר מסמך</TableHead>
                <TableHead className="text-right">סוג מסמך</TableHead>
                <TableHead className="text-right">תאריך הנפקה</TableHead>
                <TableHead className="text-right">תאריך תשלום</TableHead>
                <TableHead className="text-right">שם לקוח</TableHead>
                <TableHead className="text-right">סכום</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
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
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    לא נמצאו מסמכים בהתאם לסינון שנבחר
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.document_number}</TableCell>
                    <TableCell>{doc.document_type}</TableCell>
                    <TableCell>{new Date(doc.issue_date).toLocaleDateString("he-IL")}</TableCell>
                    <TableCell>{new Date(doc.due_date).toLocaleDateString("he-IL")}</TableCell>
                    <TableCell>{doc.member_name}</TableCell>
                    <TableCell>₪{doc.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          doc.status === "שולם"
                            ? "bg-green-100 text-green-800"
                            : doc.status === "ממתין"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {doc.status}
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
    </div>
  )
}
