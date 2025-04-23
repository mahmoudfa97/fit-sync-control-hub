"use client"

import type React from "react"

import { useState } from "react"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Users, CreditCard, Calendar, ArrowLeft, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as ReportsService from "@/services/ReportsService"
import { Link } from "react-router-dom"

interface ReportCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => Promise<any>
}

const ReportCard = ({ title, description, icon, onClick }: ReportCardProps) => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleClick = async () => {
    try {
      setLoading(true)
      await onClick()
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

  return (
    <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {icon}
                     <Button variant="outline" size="icon" asChild>
                        <Link to="/invoices">
                          <ArrowLeft className="h-4 w-4" />
                        </Link>
                      </Button>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleClick} className="w-full" disabled={loading}>
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
      </CardContent>
    </Card>
  )
}

export default function ReportsPage() {
  return (
    <DashboardShell>
      <div className="container px-4 py-6 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">דוחות</h1>
                     <Button variant="outline" size="icon" asChild>
                        <Link to="/reports">
                        <Filter className="h-4 w-4" />
                        </Link>
                      </Button>
        </div>

        <Tabs defaultValue="membership" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="membership">דוחות מנויים</TabsTrigger>
            <TabsTrigger value="financial">דוחות פיננסיים</TabsTrigger>
            <TabsTrigger value="general">דוחות כלליים</TabsTrigger>
          </TabsList>

          {/* Membership Reports */}
          <TabsContent value="membership" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ReportCard
                title="דוח ראשי מנויים"
                description="רשימה מלאה של כל המנויים במערכת"
                icon={<Users className="h-5 w-5 text-primary" />}
                onClick={async () => await ReportsService.generateMembersMainReport()}
              />
              <ReportCard
                title="דוח תוקף מנויים"
                description="מנויים שעומדים לפוג בחודש הקרוב"
                icon={<Calendar className="h-5 w-5 text-orange-500" />}
                onClick={async () => await ReportsService.generateMembershipExpiryReport()}
              />
              <ReportCard
                title="דוח היעדרות מנויים"
                description="מנויים שלא ביקרו במרכז למעלה משבועיים"
                icon={<Users className="h-5 w-5 text-red-500" />}
                onClick={async () => await ReportsService.generateMemberAbsenceReport()}
              />
              <ReportCard
                title="דוח כניסות מנויים"
                description="רשימת כניסות של מנויים למרכז"
                icon={<Calendar className="h-5 w-5 text-blue-500" />}
                onClick={async () => await ReportsService.generateCheckInsReport()}
              />
              <ReportCard
                title="דוח חידוש מנויים"
                description="מנויים שחידשו את המנוי שלהם"
                icon={<CreditCard className="h-5 w-5 text-green-500" />}
                onClick={async () => await ReportsService.generateMembershipRenewalReport()}
              />
            </div>
          </TabsContent>

          {/* Financial Reports */}
          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ReportCard
                title="דוח מסמכים פיננסים"
                description="רשימת כל החשבוניות והקבלות"
                icon={<FileText className="h-5 w-5 text-primary" />}
                onClick={async () => await ReportsService.generateFinancialDocumentsReport()}
              />
              <ReportCard
                title="דוח חובות"
                description="רשימת חובות של לקוחות"
                icon={<CreditCard className="h-5 w-5 text-red-500" />}
                onClick={async () => await ReportsService.generateDebtsReport()}
              />
              <ReportCard
                title="דוח תקבולים"
                description="רשימת כל התשלומים שהתקבלו"
                icon={<CreditCard className="h-5 w-5 text-green-500" />}
                onClick={async () => await ReportsService.generatePaymentsReport()}
              />
              <ReportCard
                title="דוח יצירת מסמכים"
                description="מסמכים פיננסיים שנוצרו לאחרונה"
                icon={<FileText className="h-5 w-5 text-blue-500" />}
                onClick={async () => await ReportsService.generateDocumentCreationReport()}
              />
              <ReportCard
                title="דוח יצירת תקבולים"
                description="תקבולים שנוצרו לאחרונה"
                icon={<CreditCard className="h-5 w-5 text-blue-500" />}
                onClick={async () => await ReportsService.generatePaymentCreationReport()}
              />
              <ReportCard
                title="דוח הזמנות"
                description="רשימת הזמנות של לקוחות"
                icon={<FileText className="h-5 w-5 text-orange-500" />}
                onClick={async () => await ReportsService.generateOrdersReport()}
              />
            </div>
          </TabsContent>

          {/* General Reports */}
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ReportCard
                title="דוח נוכחות עובדים"
                description="רשימת נוכחות של עובדים"
                icon={<Users className="h-5 w-5 text-primary" />}
                onClick={async () => await ReportsService.generateEmployeeAttendanceReport()}
              />
              <ReportCard
                title="דוח הודעות"
                description="רשימת הודעות שנשלחו במערכת"
                icon={<FileText className="h-5 w-5 text-blue-500" />}
                onClick={async () => await ReportsService.generateMessagesReport()}
              />
              <ReportCard
                title="דוח לקוחות לא פעילים"
                description="לקוחות שלא היו פעילים בשלושת החודשים האחרונים"
                icon={<Users className="h-5 w-5 text-red-500" />}
                onClick={async () => await ReportsService.generateInactiveCustomersReport()}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
