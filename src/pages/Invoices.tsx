"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Users, CreditCard, Calendar, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as ReportsService from "@/services/ReportsService"
import { DatePicker } from "@/components/ui/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {Link} from "react-router-dom"

interface FilterState {
  startDate: Date | undefined
  endDate: Date | undefined
  membershipType: string
  status: string
  minAmount: string
  maxAmount: string
  includeInactive: boolean
  searchTerm: string
}

interface ReportConfig {
  title: string
  description: string
  icon: React.ReactNode
  filterOptions: string[]
  generateFn: (filters: FilterState) => Promise<void>
}

export default function FilteredReportsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("membership")
  const [filters, setFilters] = useState<FilterState>({
    startDate: undefined,
    endDate: undefined,
    membershipType: "",
    status: "",
    minAmount: "",
    maxAmount: "",
    includeInactive: false,
    searchTerm: "",
  })

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const membershipReports: Record<string, ReportConfig> = {
    membersMain: {
      title: "דוח ראשי מנויים",
      description: "רשימה מלאה של כל המנויים במערכת",
      icon: <Users className="h-5 w-5 text-primary" />,
      filterOptions: ["startDate", "endDate", "membershipType", "status", "searchTerm"],
      generateFn: async (filters) => {
        await ReportsService.generateMembersMainReport()
      },
    },
    membershipExpiry: {
      title: "דוח תוקף מנויים",
      description: "מנויים שעומדים לפוג בתקופה שנבחרה",
      icon: <Calendar className="h-5 w-5 text-orange-500" />,
      filterOptions: ["startDate", "endDate", "membershipType", "searchTerm"],
      generateFn: async (filters) => {
        await ReportsService.generateMembershipExpiryReport()
      },
    },
    memberAbsence: {
      title: "דוח היעדרות מנויים",
      description: "מנויים שלא ביקרו במרכז בתקופה שנבחרה",
      icon: <Users className="h-5 w-5 text-red-500" />,
      filterOptions: ["startDate", "endDate", "membershipType", "includeInactive", "searchTerm"],
      generateFn: async (filters) => {
        await ReportsService.generateMemberAbsenceReport()
      },
    },
  }

  const financialReports: Record<string, ReportConfig> = {
    financialDocuments: {
      title: "דוח מסמכים פיננסים",
      description: "רשימת כל החשבוניות והקבלות",
      icon: <FileText className="h-5 w-5 text-primary" />,
      filterOptions: ["startDate", "endDate", "minAmount", "maxAmount", "status", "searchTerm"],
      generateFn: async (filters) => {
        await ReportsService.generateFinancialDocumentsReport()
      },
    },
    debts: {
      title: "דוח חובות",
      description: "רשימת חובות של לקוחות",
      icon: <CreditCard className="h-5 w-5 text-red-500" />,
      filterOptions: ["startDate", "endDate", "minAmount", "maxAmount", "searchTerm"],
      generateFn: async (filters) => {
        await ReportsService.generateDebtsReport()
      },
    },
    payments: {
      title: "דוח תקבולים",
      description: "רשימת כל התשלומים שהתקבלו",
      icon: <CreditCard className="h-5 w-5 text-green-500" />,
      filterOptions: ["startDate", "endDate", "minAmount", "maxAmount", "searchTerm"],
      generateFn: async (filters) => {
        await ReportsService.generatePaymentsReport()
      },
    },
  }

  const generalReports: Record<string, ReportConfig> = {
    employeeAttendance: {
      title: "דוח נוכחות עובדים",
      description: "רשימת נוכחות של עובדים",
      icon: <Users className="h-5 w-5 text-primary" />,
      filterOptions: ["startDate", "endDate", "searchTerm"],
      generateFn: async (filters) => {
        await ReportsService.generateEmployeeAttendanceReport()
      },
    },
    inactiveCustomers: {
      title: "דוח לקוחות לא פעילים",
      description: "לקוחות שלא היו פעילים בתקופה שנבחרה",
      icon: <Users className="h-5 w-5 text-red-500" />,
      filterOptions: ["startDate", "endDate", "membershipType", "searchTerm"],
      generateFn: async (filters) => {
        await ReportsService.generateInactiveCustomersReport()
      },
    },
  }

  const getReportsForTab = () => {
    switch (activeTab) {
      case "membership":
        return membershipReports
      case "financial":
        return financialReports
      case "general":
        return generalReports
      default:
        return {}
    }
  }

  const handleGenerateReport = async (reportKey: string) => {
    try {
      setLoading(true)
      const reports = getReportsForTab()
      const report = reports[reportKey]

      if (!report) {
        throw new Error("דוח לא נמצא")
      }

      await report.generateFn(filters)

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

  const renderFilterControls = (filterOptions: string[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {filterOptions.includes("startDate") && (
          <div className="space-y-2">
            <Label htmlFor="startDate">מתאריך</Label>
            <DatePicker
              id="startDate"
              date={filters.startDate}
              onSelect={(date) => handleFilterChange("startDate", date)}
              className="w-full"
            />
          </div>
        )}

        {filterOptions.includes("endDate") && (
          <div className="space-y-2">
            <Label htmlFor="endDate">עד תאריך</Label>
            <DatePicker
              id="endDate"
              date={filters.endDate}
              onSelect={(date) => handleFilterChange("endDate", date)}
              className="w-full"
            />
          </div>
        )}

        {filterOptions.includes("membershipType") && (
          <div className="space-y-2">
            <Label htmlFor="membershipType">סוג מנוי</Label>
            <Select
              value={filters.membershipType}
              onValueChange={(value) => handleFilterChange("membershipType", value)}
            >
              <SelectTrigger id="membershipType">
                <SelectValue placeholder="כל סוגי המנויים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל סוגי המנויים</SelectItem>
                <SelectItem value="standard">סטנדרט</SelectItem>
                <SelectItem value="premium">פרימיום</SelectItem>
                <SelectItem value="student">סטודנט</SelectItem>
                <SelectItem value="senior">ותיק</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {filterOptions.includes("status") && (
          <div className="space-y-2">
            <Label htmlFor="status">סטטוס</Label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="כל הסטטוסים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="active">פעיל</SelectItem>
                <SelectItem value="inactive">לא פעיל</SelectItem>
                <SelectItem value="pending">ממתין</SelectItem>
                <SelectItem value="expired">פג תוקף</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {filterOptions.includes("minAmount") && (
          <div className="space-y-2">
            <Label htmlFor="minAmount">סכום מינימלי</Label>
            <Input
              id="minAmount"
              type="number"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange("minAmount", e.target.value)}
              placeholder="סכום מינימלי"
            />
          </div>
        )}

        {filterOptions.includes("maxAmount") && (
          <div className="space-y-2">
            <Label htmlFor="maxAmount">סכום מקסימלי</Label>
            <Input
              id="maxAmount"
              type="number"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
              placeholder="סכום מקסימלי"
            />
          </div>
        )}

        {filterOptions.includes("searchTerm") && (
          <div className="space-y-2">
            <Label htmlFor="searchTerm">חיפוש</Label>
            <Input
              id="searchTerm"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              placeholder="חיפוש לפי שם, אימייל, טלפון..."
            />
          </div>
        )}

        {filterOptions.includes("includeInactive") && (
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox
              id="includeInactive"
              checked={filters.includeInactive}
              onCheckedChange={(checked) => handleFilterChange("includeInactive", checked)}
            />
            <Label htmlFor="includeInactive">כלול מנויים לא פעילים</Label>
          </div>
        )}
      </div>
    )
  }

  return (
    <DashboardShell>
      <div className="container px-4 py-6 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
 
            <h1 className="text-3xl font-bold">דוחות מסוננים</h1>
          </div>
        </div>

        <Tabs defaultValue="membership" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="membership">דוחות מנויים</TabsTrigger>
            <TabsTrigger value="financial">דוחות פיננסיים</TabsTrigger>
            <TabsTrigger value="general">דוחות כלליים</TabsTrigger>
          </TabsList>

          <TabsContent value="membership" className="space-y-4">
            {Object.entries(membershipReports).map(([key, report]) => (
              <Card key={key} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    {report.icon}
                  </div>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>{renderFilterControls(report.filterOptions)}</CardContent>
                <CardFooter className="bg-muted/50 pt-2">
                  <Button onClick={() => handleGenerateReport(key)} className="w-full" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2">⏳</span>
                        מייצר דוח...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Download className="mr-2 h-4 w-4" />
                        הורד דוח
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            {Object.entries(financialReports).map(([key, report]) => (
              <Card key={key} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    {report.icon}
                  </div>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>{renderFilterControls(report.filterOptions)}</CardContent>
                <CardFooter className="bg-muted/50 pt-2">
                  {report.title === "דוח תקבולים" ? (
                    <Button variant="ghost" className="w-full" asChild>
                    <Link to={'/reports/finance#'+report.title}></Link>
                  </Button>
                    
                  
                  ):(
                    <Button onClick={() => handleGenerateReport(key)} className="w-full" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2">⏳</span>
                          מייצר דוח...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Download className="mr-2 h-4 w-4" />
                          הורד דוח
                        </span>
                      )}
                    </Button>
                  )}
                
                </CardFooter>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            {Object.entries(generalReports).map(([key, report]) => (
              <Card key={key} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    {report.icon}
                  </div>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>{renderFilterControls(report.filterOptions)}</CardContent>
                <CardFooter className="bg-muted/50 pt-2">
                  <Button onClick={() => handleGenerateReport(key)} className="w-full" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center">
                        <span className="animate-spin mr-2">⏳</span>
                        מייצר דוח...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Download className="mr-2 h-4 w-4" />
                        הורד דוח
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
