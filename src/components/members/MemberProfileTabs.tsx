"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  FileText,
  MessageSquare,
  ClipboardList,
  Activity,
  CreditCard,
  Calendar,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { formatDate } from "@/utils/format"
import { t } from "@/utils/translations"
import { FileUploadDialog } from "./FileUploadDialog"
import { CreateProgramDialog } from "./CreateProgramDialog"
import { CreateTaskDialog } from "./CreateTaskDialog"
import { MemberFilesService, type MemberFile } from "@/services/MemberFilesService"
import { MemberProgramsService, type MemberProgram } from "@/services/MemberProgramsService"
import { MemberTasksService, type MemberTask } from "@/services/MemberTasksService"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface MemberProfileTabsProps {
  memberId: string
}

interface CheckIn {
  id: string
  check_in_time: string
  notes: string | null
}

interface Subscription {
  id: string
  membership_type: string
  start_date: string
  end_date: string
  status: string
  payment_status: string
}

interface Payment {
  id: string
  amount: number
  payment_method: string
  payment_date: string
  description: string
  status: string
}

export function MemberProfileTabs({ memberId }: MemberProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("subscriptions")
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [files, setFiles] = useState<MemberFile[]>([])
  const [programs, setPrograms] = useState<MemberProgram[]>([])
  const [tasks, setTasks] = useState<MemberTask[]>([])
  const [loading, setLoading] = useState({
    subscriptions: true,
    payments: false,
    checkins: false,
    files: false,
    programs: false,
    tasks: false,
  })

  // Dialog states
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false)
  const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<MemberFile | null>(null)
  const [isViewFileOpen, setIsViewFileOpen] = useState(false)

  useEffect(() => {
    if (memberId) {
      fetchSubscriptions()
    }
  }, [memberId])

  useEffect(() => {
    if (activeTab === "payments" && payments.length === 0) {
      fetchPayments()
    } else if (activeTab === "checkins" && checkIns.length === 0) {
      fetchCheckIns()
    } else if (activeTab === "files" && files.length === 0) {
      fetchFiles()
    } else if (activeTab === "programs" && programs.length === 0) {
      fetchPrograms()
    } else if (activeTab === "tasks" && tasks.length === 0) {
      fetchTasks()
    }
  }, [activeTab, memberId])

  const fetchSubscriptions = async () => {
    try {
      setLoading((prev) => ({ ...prev, subscriptions: true }))
      console.log("Fetching subscriptions for member:", memberId)

      const { data, error } = await supabase
        .from("custom_memberships")
        .select(`
          id,
          membership_type,
          start_date,
          end_date,
          status,
          payment_status,
          created_at
        `)
        .eq("member_id", memberId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching subscriptions:", error)
        throw error
      }

      console.log("Subscriptions data:", data)
      setSubscriptions(data || [])
    } catch (error) {
      console.error("Error in fetchSubscriptions:", error)
    } finally {
      setLoading((prev) => ({ ...prev, subscriptions: false }))
    }
  }

  const fetchPayments = async () => {
    try {
      setLoading((prev) => ({ ...prev, payments: true }))
      console.log("Fetching payments for member:", memberId)

      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("member_id", memberId)
        .order("payment_date", { ascending: false })

      if (error) {
        console.error("Error fetching payments:", error)
        throw error
      }

      console.log("Payments data:", data)
      setPayments(data || [])
    } catch (error) {
      console.error("Error in fetchPayments:", error)
    } finally {
      setLoading((prev) => ({ ...prev, payments: false }))
    }
  }

  const fetchCheckIns = async () => {
    try {
      setLoading((prev) => ({ ...prev, checkins: true }))
      console.log("Fetching check-ins for member:", memberId)

      const { data, error } = await supabase
        .from("custom_checkins")
        .select("id, check_in_time, notes")
        .eq("member_id", memberId)
        .order("check_in_time", { ascending: false })

      if (error) {
        console.error("Error fetching check-ins:", error)
        throw error
      }

      console.log("Check-ins data:", data)
      setCheckIns(data || [])
    } catch (error) {
      console.error("Error in fetchCheckIns:", error)
    } finally {
      setLoading((prev) => ({ ...prev, checkins: false }))
    }
  }

  const fetchFiles = async () => {
    try {
      setLoading((prev) => ({ ...prev, files: true }))
      const data = await MemberFilesService.getFiles(memberId)
      setFiles(data)
    } catch (error) {
      console.error("Error in fetchFiles:", error)
    } finally {
      setLoading((prev) => ({ ...prev, files: false }))
    }
  }

  const fetchPrograms = async () => {
    try {
      setLoading((prev) => ({ ...prev, programs: true }))
      const data = await MemberProgramsService.getPrograms(memberId)
      setPrograms(data)
    } catch (error) {
      console.error("Error in fetchPrograms:", error)
    } finally {
      setLoading((prev) => ({ ...prev, programs: false }))
    }
  }

  const fetchTasks = async () => {
    try {
      setLoading((prev) => ({ ...prev, tasks: true }))
      const data = await MemberTasksService.getTasks(memberId)
      setTasks(data)
    } catch (error) {
      console.error("Error in fetchTasks:", error)
    } finally {
      setLoading((prev) => ({ ...prev, tasks: false }))
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    try {
      await MemberFilesService.deleteFile(fileId)
      setFiles((prev) => prev.filter((file) => file.id !== fileId))
      toast.success(t("fileDeletedSuccessfully"))
    } catch (error) {
      console.error("Error deleting file:", error)
      toast.error(t("errorDeletingFile"))
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await MemberTasksService.updateTaskStatus(taskId, status)
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status,
                completed_at: status === "completed" ? new Date().toISOString() : null,
              }
            : task,
        ),
      )
      toast.success(t("taskStatusUpdated"))
    } catch (error) {
      console.error("Error updating task status:", error)
      toast.error(t("errorUpdatingTaskStatus"))
    }
  }

  const handleUpdateProgramStatus = async (programId: string, status: string) => {
    try {
      await MemberProgramsService.updateProgramStatus(programId, status)
      setPrograms((prev) =>
        prev.map((program) =>
          program.id === programId
            ? {
                ...program,
                status,
              }
            : program,
        ),
      )
      toast.success(t("programStatusUpdated"))
    } catch (error) {
      console.error("Error updating program status:", error)
      toast.error(t("errorUpdatingProgramStatus"))
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return "-"

    try {
      const date = new Date(dateTimeString)
      return date.toLocaleString("he-IL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting date time:", error)
      return dateTimeString
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
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500"
      case "paused":
        return "bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-500"
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500"
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-500"
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return (
        <img
          src={selectedFile?.file_url || "/placeholder.svg"}
          alt="Preview"
          className="w-full h-auto max-h-96 object-contain rounded"
        />
      )
    }

    return <FileText className="h-16 w-16 text-primary" />
  }

  const getFileTypeLabel = (fileType: string) => {
    if (fileType.startsWith("image/")) return "Image"
    if (fileType.startsWith("application/pdf")) return "PDF"
    if (fileType.startsWith("application/msword") || fileType.includes("officedocument.wordprocessing")) return "Word"
    if (fileType.startsWith("application/vnd.ms-excel") || fileType.includes("spreadsheet")) return "Excel"
    if (fileType.startsWith("text/")) return "Text"
    return "Document"
  }

  const getFileSizeLabel = (size: number) => {
    if (size < 1024) {
      return `${size} B`
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "document":
        return t("document")
      case "medical":
        return t("medical")
      case "contract":
        return t("contract")
      case "progress":
        return t("progressPhoto")
      case "other":
        return t("other")
      default:
        return category
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "low":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const renderEmptyState = (message: string) => (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <p>{message}</p>
    </div>
  )

  return (
    <>
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
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
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
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>{t("files")}</CardTitle>
                <CardDescription>{t("filesDesc")}</CardDescription>
              </div>
              <Button onClick={() => setIsFileUploadOpen(true)}>
                <FileText className="mr-2 h-4 w-4" />
                {t("uploadFile")}
              </Button>
            </CardHeader>
            <CardContent>
              {loading.files ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : files.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file) => (
                    <Card key={file.id} className="overflow-hidden">
                      <div className="h-32 bg-muted flex items-center justify-center p-4">
                        {file.file_type.startsWith("image/") ? (
                          <img
                            src={file.file_url || "/placeholder.svg"}
                            alt={file.file_name}
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <FileText className="h-12 w-12 text-primary" />
                            <span className="text-xs font-medium mt-1">
                              {file.file_name.split(".").pop()?.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium text-sm truncate" title={file.file_name}>
                          {file.file_name}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryLabel(file.category)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{getFileSizeLabel(file.file_size)}</span>
                        </div>
                        {file.description && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2" title={file.description}>
                            {file.description}
                          </p>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedFile(file)
                                  setIsViewFileOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("viewFile")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" asChild>
                                <a
                                  href={file.file_url}
                                  download={file.file_name}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("downloadFile")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteFile(file.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("deleteFile")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                renderEmptyState(t("noFiles"))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>{t("programs")}</CardTitle>
                <CardDescription>{t("programsDesc")}</CardDescription>
              </div>
              <Button onClick={() => setIsCreateProgramOpen(true)}>
                <Activity className="mr-2 h-4 w-4" />
                {t("createProgram")}
              </Button>
            </CardHeader>
            <CardContent>
              {loading.programs ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : programs.length > 0 ? (
                <div className="space-y-4">
                  {programs.map((program) => (
                    <Card key={program.id} className={program.status !== "active" ? "opacity-70" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{program.title}</CardTitle>
                            <CardDescription>
                              {formatDate(program.start_date)} -{" "}
                              {program.end_date ? formatDate(program.end_date) : t("ongoing")}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className={getStatusBadgeColor(program.status)}>
                            {t(program.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        {program.description && (
                          <p className="text-sm text-muted-foreground mb-4">{program.description}</p>
                        )}
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium">{t("progress")}</span>
                          <Progress value={program.status === "completed" ? 100 : 45} className="h-2" />
                          <span className="text-sm text-muted-foreground">
                            {program.status === "completed" ? "100%" : "45%"}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0">
                        <Button variant="outline" size="sm">
                          {t("viewDetails")}
                        </Button>
                        <div className="flex space-x-2">
                          {program.status === "active" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateProgramStatus(program.id, "completed")}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              {t("markComplete")}
                            </Button>
                          ) : program.status === "paused" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateProgramStatus(program.id, "active")}
                            >
                              <Activity className="mr-1 h-3 w-3" />
                              {t("resume")}
                            </Button>
                          ) : program.status === "completed" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateProgramStatus(program.id, "active")}
                            >
                              <Activity className="mr-1 h-3 w-3" />
                              {t("reactivate")}
                            </Button>
                          ) : null}

                          {program.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateProgramStatus(program.id, "paused")}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              {t("pause")}
                            </Button>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                renderEmptyState(t("noPrograms"))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>{t("tasks")}</CardTitle>
                <CardDescription>{t("tasksDesc")}</CardDescription>
              </div>
              <Button onClick={() => setIsCreateTaskOpen(true)}>
                <ClipboardList className="mr-2 h-4 w-4" />
                {t("createTask")}
              </Button>
            </CardHeader>
            <CardContent>
              {loading.tasks ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`border rounded-lg p-4 ${task.status === "completed" ? "bg-muted/50" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          {getPriorityIcon(task.priority)}
                          <div>
                            <h3
                              className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                            >
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            )}
                            <div className="flex items-center space-x-3 mt-2">
                              {task.due_date && (
                                <span className="text-xs flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(task.due_date)}
                                </span>
                              )}
                              <Badge variant="outline" className={getStatusBadgeColor(task.priority)}>
                                {t(task.priority)}
                              </Badge>
                              <Badge variant="outline" className={getStatusBadgeColor(task.status)}>
                                {t(task.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {task.status !== "completed" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateTaskStatus(task.id, "completed")}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              {t("complete")}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateTaskStatus(task.id, "pending")}
                            >
                              <Activity className="mr-1 h-3 w-3" />
                              {t("reopen")}
                            </Button>
                          )}
                        </div>
                      </div>
                      {task.assigned_to && (
                        <div className="mt-3 flex items-center">
                          <span className="text-xs text-muted-foreground mr-2">{t("assignedTo")}:</span>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {task.assigned_to.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                renderEmptyState(t("noTasks"))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkins" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>{t("checkins")}</CardTitle>
              <CardDescription>{t("checkinsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.checkins ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                renderEmptyState(t("noCheckins"))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* File Upload Dialog */}
      <FileUploadDialog
        memberId={memberId}
        isOpen={isFileUploadOpen}
        onClose={() => setIsFileUploadOpen(false)}
        onSuccess={() => fetchFiles()}
      />

      {/* Create Program Dialog */}
      <CreateProgramDialog
        memberId={memberId}
        isOpen={isCreateProgramOpen}
        onClose={() => setIsCreateProgramOpen(false)}
        onSuccess={() => fetchPrograms()}
      />

      {/* Create Task Dialog */}
      <CreateTaskDialog
        memberId={memberId}
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSuccess={() => fetchTasks()}
      />

      {/* View File Dialog */}
      <Dialog open={isViewFileOpen} onOpenChange={setIsViewFileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedFile?.file_name}</DialogTitle>
            <DialogDescription>
              {getFileTypeLabel(selectedFile?.file_type || "")} • {getFileSizeLabel(selectedFile?.file_size || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            {selectedFile && getFileIcon(selectedFile.file_type)}
          </div>
          {selectedFile?.description && (
            <div className="text-sm text-muted-foreground border-t pt-4">
              <p className="font-medium mb-1">{t("description")}:</p>
              <p>{selectedFile.description}</p>
            </div>
          )}
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setIsViewFileOpen(false)}>
              {t("close")}
            </Button>
            <Button asChild>
              <a
                href={selectedFile?.file_url}
                download={selectedFile?.file_name}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-4 w-4" />
                {t("download")}
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
