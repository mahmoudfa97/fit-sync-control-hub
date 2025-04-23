"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Download, Filter, Search, UserPlus, Briefcase, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import {
  fetchStaff,
  addStaffMember,
  removeStaff,
  updateStaffStatus,
  filterStaffByDepartment,
  searchStaff,
} from "@/store/slices/staffSlice"
import { StaffService } from "@/services/StaffService"
import { useTranslation } from "react-i18next"

const statusStyles = {
  active: "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-500",
  on_leave: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500",
}

interface AvailableMember {
  id: string
  name: string
  email: string
  phone?: string
}

const Staff = () => {
  const { t } = useTranslation()

  const statusLabels = {
    active: t("active"),
    inactive: t("inactive"),
    on_leave: t("on_leave"),
  }

  const departments = [
    { value: "אימון", label: t("training") },
    { value: "ניהול", label: t("management") },
    { value: "קבלה", label: t("reception") },
    { value: "תזונה", label: t("nutrition") },
    { value: "תחזוקה", label: t("maintenance") },
  ]

  const roles = [
    { value: "מאמן אישי", label: t("personalTrainer"), dept: "אימון" },
    { value: "מדריך יוגה", label: t("yogaInstructor"), dept: "אימון" },
    { value: "מדריך זומבה", label: t("zumbaInstructor"), dept: "אימון" },
    { value: "מנהל מועדון", label: t("gymManager"), dept: "ניהול" },
    { value: "מנהל תפעול", label: t("operationsManager"), dept: "ניהול" },
    { value: "פקיד קבלה", label: t("receptionClerk"), dept: "קבלה" },
    { value: "יועץ תזונה", label: t("nutritionConsultant"), dept: "תזונה" },
    { value: "איש תחזוקה", label: t("maintenanceStaff"), dept: "תחזוקה" },
  ]

  const dispatch = useAppDispatch()
  const { staff, filteredStaff, loading } = useAppSelector((state) => state.staff)
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [addStaffOpen, setAddStaffOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableMembers, setAvailableMembers] = useState<AvailableMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  const [newStaff, setNewStaff] = useState({
    member_id: "",
    role: "",
    department: "",
    phone: "",
    status: "active" as "active" | "inactive" | "on_leave",
  })

  // Fetch staff on component mount
  useEffect(() => {
    dispatch(fetchStaff())
  }, [dispatch])

  // Fetch available members when dialog opens
  useEffect(() => {
    if (addStaffOpen) {
      fetchAvailableMembers()
    }
  }, [addStaffOpen])

  const fetchAvailableMembers = async () => {
    try {
      setLoadingMembers(true)
      const members = await StaffService.fetchAvailableMembers()
      setAvailableMembers(members)
    } catch (error) {
      console.error("Error fetching available members:", error)
      toast({
        title: t("errorFetchingMembers"),
        description: t("unableToFetchMembersList"),
        variant: "destructive",
      })
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term) {
      dispatch(searchStaff(term))
    } else {
      dispatch(filterStaffByDepartment(null))
    }
  }

  const handleFilterByDepartment = (department: string | null) => {
    dispatch(filterStaffByDepartment(department))
    setSearchTerm("")
  }

  const filteredRoles = newStaff.department ? roles.filter((role) => role.dept === newStaff.department) : roles

  const handleAddStaff = async () => {
    if (!newStaff.member_id || !newStaff.role || !newStaff.department) {
      toast({
        title: t("dataError"),
        description: t("pleaseEnterAllRequiredData"),
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await dispatch(addStaffMember(newStaff)).unwrap()

      toast({
        title: t("staffAddedSuccessfully"),
        description: t("memberPromotedToStaff"),
      })

      setNewStaff({
        member_id: "",
        role: "",
        department: "",
        phone: "",
        status: "active",
      })

      setAddStaffOpen(false)
    } catch (error) {
      console.error("Error adding staff:", error)
      toast({
        title: t("errorAddingStaff"),
        description: t("unableToAddStaff"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: "active" | "inactive" | "on_leave") => {
    try {
      await dispatch(updateStaffStatus({ id, status })).unwrap()

      toast({
        title: t("statusUpdated"),
        description: t("staffStatusUpdatedTo", { status: statusLabels[status] }),
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: t("errorUpdatingStatus"),
        description: t("unableToUpdateStaffStatus"),
        variant: "destructive",
      })
    }
  }

  const handleRemoveStaff = async (id: string, name: string) => {
    if (confirm(t("confirmDeleteStaff", { name }))) {
      try {
        await dispatch(removeStaff(id)).unwrap()

        toast({
          title: t("staffDeleted"),
          description: t("staffRemovedFromList", { name }),
        })
      } catch (error) {
        console.error("Error removing staff:", error)
        toast({
          title: t("errorDeletingStaff"),
          description: t("unableToDeleteStaff"),
          variant: "destructive",
        })
      }
    }
  }

  // Find selected member details
  const selectedMember = availableMembers.find((m) => m.id === newStaff.member_id)

  // Update phone when member is selected
  useEffect(() => {
    if (selectedMember && selectedMember.phone) {
      setNewStaff((prev) => ({
        ...prev,
        phone: selectedMember.phone,
      }))
    }
  }, [selectedMember])

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("staff")}</h1>
          <p className="text-muted-foreground">{t("staffManagementDescription")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("searchStaff")}
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">{t("filter")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => handleFilterByDepartment(null)}>
                  {t("allDepartments")}
                </DropdownMenuItem>
                {departments.map((dept) => (
                  <DropdownMenuItem key={dept.value} onClick={() => handleFilterByDepartment(dept.value)}>
                    {dept.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setAddStaffOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t("addStaff")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("staffDirectory")}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
              <span className="sr-only">{t("downloadCSV")}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading === "pending" ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="sr-only">{t("loading")}</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">{t("employee")}</TableHead>
                  <TableHead>{t("department")}</TableHead>
                  <TableHead>{t("jobTitle")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("hireDate")}</TableHead>
                  <TableHead>{t("workSchedule")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={staff.avatar || "/placeholder.svg"} alt={staff.name} />
                            <AvatarFallback>{staff.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{staff.name}</p>
                            <p className="text-xs text-muted-foreground">{staff.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{staff.department}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{staff.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles[staff.status]}>
                          {statusLabels[staff.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{staff.hireDate}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">{staff.schedule.days.join("، ")}</div>
                          <div className="text-xs font-medium">{staff.schedule.shift}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUpdateStatus(staff.id, "active")}>
                                {t("setAsActive")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(staff.id, "inactive")}>
                                {t("setAsInactive")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(staff.id, "on_leave")}>
                                {t("setAsOnLeave")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRemoveStaff(staff.id, staff.name)}
                                className="text-destructive focus:text-destructive"
                              >
                                {t("deleteStaff")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {t("noStaffFound")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("addNewStaff")}</DialogTitle>
            <DialogDescription>{t("selectMemberToPromote")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="member">{t("selectMember")}</Label>
              <Select
                value={newStaff.member_id}
                onValueChange={(value) => setNewStaff({ ...newStaff, member_id: value })}
              >
                <SelectTrigger id="member">
                  <SelectValue placeholder={t("selectMember")} />
                </SelectTrigger>
                <SelectContent>
                  {loadingMembers ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>{t("loading")}</span>
                    </div>
                  ) : availableMembers.length > 0 ? (
                    availableMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.email})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-muted-foreground">{t("noMembersAvailableForPromotion")}</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedMember && (
              <div className="grid gap-2">
                <Label>{t("memberInfo")}</Label>
                <div className="rounded-md border p-3 text-sm">
                  <div>
                    <strong>{t("email")}:</strong> {selectedMember.email}
                  </div>
                  <div>
                    <strong>{t("phone")}:</strong> {selectedMember.phone || t("notAvailable")}
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input
                id="phone"
                placeholder="05xxxxxxxx"
                value={newStaff.phone}
                onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department">{t("department")}</Label>
              <Select
                value={newStaff.department}
                onValueChange={(value) => setNewStaff({ ...newStaff, department: value, role: "" })}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder={t("selectDepartment")} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">{t("jobTitle")}</Label>
              <Select
                value={newStaff.role}
                onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}
                disabled={!newStaff.department}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder={t("selectJobTitle")} />
                </SelectTrigger>
                <SelectContent>
                  {filteredRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">{t("status")}</Label>
              <Select
                value={newStaff.status}
                onValueChange={(value: "active" | "inactive" | "on_leave") =>
                  setNewStaff({ ...newStaff, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder={t("selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t("active")}</SelectItem>
                  <SelectItem value="inactive">{t("inactive")}</SelectItem>
                  <SelectItem value="on_leave">{t("on_leave")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStaffOpen(false)} disabled={isSubmitting}>
              {t("cancel")}
            </Button>
            <Button onClick={handleAddStaff} disabled={isSubmitting || !newStaff.member_id}>
              {isSubmitting ? t("adding") : t("addStaff")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}

export default Staff
