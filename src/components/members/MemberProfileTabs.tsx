"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, MessageSquare, ClipboardList, Activity, CreditCard, Calendar } from "lucide-react"
import { SubscriptionService } from "@/services/SubscriptionService"
import { formatDate } from "@/utils/format"
import { t } from "@/utils/translations"

interface MemberProfileTabsProps {
  memberId: string
}

export function MemberProfileTabs({ memberId }: MemberProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("subscriptions")
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [checkins, setCheckins] = useState<any[]>([])
  const [loading, setLoading] = useState({
    subscriptions: true,
    payments: true,
    checkins: true,
  })

  useEffect(() => {
    if (memberId) {
      fetchSubscriptions()
    }
  }, [memberId])

  useEffect(() => {
    if (activeTab === "payments" && payments.length === 0) {
      fetchPayments()
    } else if (activeTab === "checkins" && checkins.length === 0) {
      fetchCheckins()
    }
  }, [activeTab])

  const fetchSubscriptions = async () => {
    try {
      setLoading((prev) => ({ ...prev, subscriptions: true }))
      const data = await SubscriptionService.getMemberSubscriptions(memberId)
      setSubscriptions(data)
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
    } finally {
      setLoading((prev) => ({ ...prev, subscriptions: false }))
    }
  }

  const fetchPayments = async () => {
    try {
      setLoading((prev) => ({ ...prev, payments: true }))
      const data = await SubscriptionService.getMemberPayments(memberId)
      setPayments(data)
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading((prev) => ({ ...prev, payments: false }))
    }
  }

  const fetchCheckins = async () => {
    try {
      setLoading((prev) => ({ ...prev, checkins: true }))
      const data = await SubscriptionService.getMemberCheckins(memberId)
      setCheckins(data)
    } catch (error) {
      console.error("Error fetching checkins:", error)
    } finally {
      setLoading((prev) => ({ ...prev, checkins: false }))
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500"
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-500"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500"
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500"
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500"
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500"
      case "canceled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-500"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-500"
    }
  }

  const renderLoading = () => (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  const renderEmptyState = (message: string) => <div className="text-center py-8 text-muted-foreground">{message}</div>

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-6 mb-4">
        <TabsTrigger value="subscriptions" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{t("subscriptions")}</span>
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <span>{t("accounting")}</span>
        </TabsTrigger>
        <TabsTrigger value="files" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>{t("files")}</span>
        </TabsTrigger>
        <TabsTrigger value="programs" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span>{t("programs")}</span>
        </TabsTrigger>
        <TabsTrigger value="tasks" className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          <span>{t("tasks")}</span>
        </TabsTrigger>
        <TabsTrigger value="checkins" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>{t("checkins")}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="subscriptions">
        <Card>
          <CardHeader>
            <CardTitle>{t("subscriptions")}</CardTitle>
            <CardDescription>{t("subscriptionsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading.subscriptions ? (
              renderLoading()
            ) : subscriptions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("subscriptionType")}</TableHead>
                    <TableHead>{t("startDate")}</TableHead>
                    <TableHead>{t("endDate")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("paymentStatus")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>{subscription.membership_type}</TableCell>
                      <TableCell>{formatDate(subscription.start_date)}</TableCell>
                      <TableCell>{formatDate(subscription.end_date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeColor(subscription.status)}>
                          {t(subscription.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeColor(subscription.payment_status)}>
                          {t(subscription.payment_status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              renderEmptyState(t("noSubscriptions"))
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payments">
        <Card>
          <CardHeader>
            <CardTitle>{t("accounting")}</CardTitle>
            <CardDescription>{t("accountingDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading.payments ? (
              renderLoading()
            ) : payments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("date")}</TableHead>
                    <TableHead>{t("amount")}</TableHead>
                    <TableHead>{t("paymentMethod")}</TableHead>
                    <TableHead>{t("description")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.payment_date)}</TableCell>
                      <TableCell>₪{payment.amount}</TableCell>
                      <TableCell>{t(payment.payment_method)}</TableCell>
                      <TableCell>{payment.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeColor(payment.status)}>
                          {t(payment.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              renderEmptyState(t("noPayments"))
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="files">
        <Card>
          <CardHeader>
            <CardTitle>{t("files")}</CardTitle>
            <CardDescription>{t("filesDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                {t("uploadFile")}
              </Button>
            </div>
            {renderEmptyState(t("noFiles"))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="programs">
        <Card>
          <CardHeader>
            <CardTitle>{t("programs")}</CardTitle>
            <CardDescription>{t("programsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Button>
                <Activity className="mr-2 h-4 w-4" />
                {t("createProgram")}
              </Button>
            </div>
            {renderEmptyState(t("noPrograms"))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tasks">
        <Card>
          <CardHeader>
            <CardTitle>{t("tasks")}</CardTitle>
            <CardDescription>{t("tasksDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Button>
                <ClipboardList className="mr-2 h-4 w-4" />
                {t("createTask")}
              </Button>
            </div>
            {renderEmptyState(t("noTasks"))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="checkins">
        <Card>
          <CardHeader>
            <CardTitle>{t("checkins")}</CardTitle>
            <CardDescription>{t("checkinsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading.checkins ? (
              renderLoading()
            ) : checkins.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("date")}</TableHead>
                    <TableHead>{t("time")}</TableHead>
                    <TableHead>{t("notes")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkins.map((checkin) => {
                    const date = new Date(checkin.check_in_time)
                    return (
                      <TableRow key={checkin.id}>
                        <TableCell>{formatDate(checkin.check_in_time)}</TableCell>
                        <TableCell>
                          {date.toLocaleTimeString("he-IL", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>{checkin.notes || "-"}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              renderEmptyState(t("noCheckins"))
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
