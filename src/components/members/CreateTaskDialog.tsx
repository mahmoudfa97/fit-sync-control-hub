"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { t } from "@/utils/translations"
import { MemberTasksService } from "@/services/MemberTasksService"
import { StaffService } from "@/services/StaffService"
import { StaffMember } from "@/store/slices/staffSlice"

interface CreateTaskDialogProps {
  memberId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}


export function CreateTaskDialog({ memberId, isOpen, onClose, onSuccess }: CreateTaskDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState("medium")
  const [assignedTo, setAssignedTo] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [isLoadingStaff, setIsLoadingStaff] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchStaffMembers()
    }
  }, [isOpen])

  const fetchStaffMembers = async () => {
    try {
      setIsLoadingStaff(true)
      const staff = await StaffService.fetchStaff()
      setStaffMembers(staff)
    } catch (error) {
      console.error("Error fetching staff members:", error)
      toast.error(t("errorFetchingStaff"))
    } finally {
      setIsLoadingStaff(false)
    }
  }

  const handleCreateTask = async () => {
    if (!title.trim()) {
      toast.error(t("taskTitleRequired"))
      return
    }

    try {
      setIsCreating(true)
      await MemberTasksService.createTask({
        memberId,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        priority,
        assignedTo: assignedTo || undefined,
      })

      toast.success(t("taskCreatedSuccessfully"))
      onSuccess()
      handleClose()
    } catch (error) {
      console.error("Error creating task:", error)
      toast.error(t("errorCreatingTask"))
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setTitle("")
    setDescription("")
    setDueDate("")
    setPriority("medium")
    setAssignedTo("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createTask")}</DialogTitle>
          <DialogDescription>{t("createTaskDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("taskTitle")}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("taskTitlePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("taskDescription")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("taskDescriptionPlaceholder")}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">{t("dueDate")}</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">{t("priority")}</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectPriority")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t("low")}</SelectItem>
                  <SelectItem value="medium">{t("medium")}</SelectItem>
                  <SelectItem value="high">{t("high")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">{t("assignTo")}</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectStaffMember")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">{t("unassigned")}</SelectItem>
                {staffMembers.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name} {staff.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            {t("cancel")}
          </Button>
          <Button onClick={handleCreateTask} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("creating")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t("createTask")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
