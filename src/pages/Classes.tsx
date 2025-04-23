"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {
  Plus,
  Search,
  User,
  Users,
  Loader2,
  Calendar,
  Clock,
  ChevronRight,
  BarChart4,
  CalendarDays,
  ListFilter,
  Dumbbell,
  UserCircle,
  Trash2,
  RefreshCw,
  Info,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { fetchClasses, addClass, cancelClass, reactivateClass } from "@/store/slices/classesSlice"
import { t } from "@/utils/translations"
import { supabase } from "@/integrations/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const weekdays = [
  { value: "sunday", label: t("sunday") },
  { value: "monday", label: t("monday") },
  { value: "tuesday", label: t("tuesday") },
  { value: "wednesday", label: t("wednesday") },
  { value: "thursday", label: t("thursday") },
  { value: "friday", label: t("friday") },
  { value: "saturday", label: t("saturday") },
]

interface Member {
  id: string
  name: string
  last_name: string | null
  email: string | null
}

interface Trainer {
  id: string
  name: string
  role: string
  department: string
}

export default function Classes() {
  const dispatch = useAppDispatch()
  const { classes, loading } = useAppSelector((state) => state.classes)

  const [searchTerm, setSearchTerm] = useState("")
  const [addClassOpen, setAddClassOpen] = useState(false)
  const [classType, setClassType] = useState<"personal" | "group">("personal")
  const [members, setMembers] = useState<Member[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [loadingTrainers, setLoadingTrainers] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [filterDay, setFilterDay] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterTrainer, setFilterTrainer] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [classDetailsOpen, setClassDetailsOpen] = useState(false)

  const [newClass, setNewClass] = useState({
    name: "",
    memberId: "",
    trainerId: "",
    dayOfWeek: "sunday",
    startTime: "08:00",
    endTime: "09:00",
    maxCapacity: 1,
    description: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    isRecurring: false,
    sessionCount: 1,
    focusAreas: [] as string[],
    goals: "",
    notes: "",
  })

  // Fetch classes on component mount
  useEffect(() => {
    dispatch(fetchClasses())
  }, [dispatch])

  // Fetch members and trainers when dialog opens
  useEffect(() => {
    if (addClassOpen) {
      fetchMembers()
      fetchTrainers()
    }
  }, [addClassOpen])

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true)
      const { data, error } = await supabase.from("custom_members").select("id, name, last_name, email").order("name")

      if (error) throw error

      setMembers(data || [])
    } catch (error) {
      console.error("Error fetching members:", error)
      toast.error(t("errorFetchingMembers"))
    } finally {
      setLoadingMembers(false)
    }
  }

  const fetchTrainers = async () => {
    try {
      setLoadingTrainers(true)
      const { data, error } = await supabase.from("staff").select("id, name, role, department").order("name")

      if (error) throw error

      setTrainers(data || [])
    } catch (error) {
      console.error("Error fetching trainers:", error)
      toast.error(t("errorFetchingTrainers"))
    } finally {
      setLoadingTrainers(false)
    }
  }

  // Apply filters and search
  const filteredClasses = classes.filter((gymClass) => {
    // Search filter
    const matchesSearch =
      gymClass.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (gymClass.trainerName && gymClass.trainerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (gymClass.memberName && gymClass.memberName.toLowerCase().includes(searchTerm.toLowerCase()))

    // Day filter
    const matchesDay = !filterDay || gymClass.dayOfWeek === filterDay

    // Type filter
    const matchesType =
      !filterType ||
      (filterType === "personal" && gymClass.isPersonalTraining) ||
      (filterType === "group" && !gymClass.isPersonalTraining)

    // Trainer filter
    const matchesTrainer = !filterTrainer || gymClass.trainerId === filterTrainer

    return matchesSearch && matchesDay && matchesType && matchesTrainer
  })

  const handleAddClass = async () => {
    if (
      !newClass.trainerId ||
      (classType === "personal" && !newClass.memberId) ||
      (classType === "group" && !newClass.name)
    ) {
      toast.error(t("fillAllRequired"))
      return
    }

    setIsSubmitting(true)

    try {
      const trainer = trainers.find((t) => t.id === newClass.trainerId)
      if (!trainer) {
        toast.error(t("trainerNotFound"))
        return
      }

      // For personal training, use member name in the class name
      let className = newClass.name
      if (classType === "personal") {
        const member = members.find((m) => m.id === newClass.memberId)
        if (!member) {
          toast.error(t("memberNotFound"))
          return
        }
        className = `אימון אישי: ${member.name} ${member.last_name || ""}`
      }

      await dispatch(
        addClass({
          name: className,
          trainerId: newClass.trainerId,
          memberId: classType === "personal" ? newClass.memberId : undefined,
          dayOfWeek: newClass.dayOfWeek,
          startTime: newClass.startTime,
          endTime: newClass.endTime,
          maxCapacity: classType === "personal" ? 1 : newClass.maxCapacity,
          description: newClass.description,
          level: newClass.level,
          isPersonalTraining: classType === "personal",
          sessionCount: classType === "personal" ? newClass.sessionCount : undefined,
          focusAreas: classType === "personal" ? newClass.focusAreas : undefined,
          goals: classType === "personal" ? newClass.goals : undefined,
          notes: classType === "personal" ? newClass.notes : undefined,
        }),
      ).unwrap()

      toast.success(classType === "personal" ? t("personalTrainingAdded") : t("classAdded"))
      resetForm()
      setAddClassOpen(false)
    } catch (error) {
      console.error("Error adding class:", error)
      toast.error(t("errorAddingClass"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setNewClass({
      name: "",
      memberId: "",
      trainerId: "",
      dayOfWeek: "sunday",
      startTime: "08:00",
      endTime: "09:00",
      maxCapacity: 1,
      description: "",
      level: "beginner",
      isRecurring: false,
      sessionCount: 1,
      focusAreas: [],
      goals: "",
      notes: "",
    })
    setClassType("personal")
  }

  const getDayName = (day: string) => {
    const found = weekdays.find((d) => d.value === day)
    return found ? found.label : day
  }

  const getLevelName = (level: string) => {
    return t(level)
  }

  const handleCancelClass = async (classId: string) => {
    try {
      await dispatch(cancelClass(classId)).unwrap()
      toast.success(t("classCanceled"))
    } catch (error) {
      console.error("Error canceling class:", error)
      toast.error(t("errorCancelingClass"))
    }
  }

  const handleReactivateClass = async (classId: string) => {
    try {
      await dispatch(reactivateClass(classId)).unwrap()
      toast.success(t("classReactivated"))
    } catch (error) {
      console.error("Error reactivating class:", error)
      toast.error(t("errorReactivatingClass"))
    }
  }

  const focusAreaOptions = [
    { id: "strength", label: t("strength") },
    { id: "cardio", label: t("cardio") },
    { id: "flexibility", label: t("flexibility") },
    { id: "balance", label: t("balance") },
    { id: "core", label: t("core") },
    { id: "weightLoss", label: t("weightLoss") },
    { id: "muscleGain", label: t("muscleGain") },
  ]

  const toggleFocusArea = (id: string) => {
    setNewClass((prev) => {
      if (prev.focusAreas.includes(id)) {
        return { ...prev, focusAreas: prev.focusAreas.filter((area) => area !== id) }
      } else {
        return { ...prev, focusAreas: [...prev.focusAreas, id] }
      }
    })
  }

  const getClassDetails = (classId: string) => {
    return classes.find((c) => c.id === classId) || null
  }

  const openClassDetails = (classId: string) => {
    setSelectedClass(classId)
    setClassDetailsOpen(true)
  }

  const getCapacityColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-amber-500"
    return "bg-green-500"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500"
      case "canceled":
        return "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-500"
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500"
      case "intermediate":
        return "bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-500"
      case "advanced":
        return "bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-500"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-500"
    }
  }

  const getTypeColor = (isPersonal: boolean) => {
    return isPersonal
      ? "bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-500"
      : "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500"
  }

  const getDayColor = (day: string) => {
    const colors = {
      sunday: "bg-pink-100 text-pink-800 dark:bg-pink-800/30 dark:text-pink-500",
      monday: "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500",
      tuesday: "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500",
      wednesday: "bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-500",
      thursday: "bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-500",
      friday: "bg-indigo-100 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-500",
      saturday: "bg-teal-100 text-teal-800 dark:bg-teal-800/30 dark:text-teal-500",
    }
    return colors[day as keyof typeof colors] || colors.sunday
  }

  const selectedClassDetails = selectedClass ? getClassDetails(selectedClass) : null

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("classesTitle")}</h1>
          <p className="text-muted-foreground">{t("classesDesc")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setAddClassOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addClass")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("searchClassOrTrainer")}
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={filterDay || ""} onValueChange={(value) => setFilterDay(value || null)}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{filterDay ? getDayName(filterDay) : t("allDays")}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allDays")}</SelectItem>
            {weekdays.map((day) => (
              <SelectItem key={day.value} value={day.value}>
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterType || ""} onValueChange={(value) => setFilterType(value || null)}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center">
              <Dumbbell className="mr-2 h-4 w-4" />
              <span>
                {filterType === "personal"
                  ? t("personalTraining")
                  : filterType === "group"
                    ? t("groupClass")
                    : t("allTypes")}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allTypes")}</SelectItem>
            <SelectItem value="personal">{t("personalTraining")}</SelectItem>
            <SelectItem value="group">{t("groupClass")}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterTrainer || ""} onValueChange={(value) => setFilterTrainer(value || null)}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>
                {filterTrainer
                  ? trainers.find((t) => t.id === filterTrainer)?.name || t("selectTrainer")
                  : t("allTrainers")}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allTrainers")}</SelectItem>
            {trainers.map((trainer) => (
              <SelectItem key={trainer.id} value={trainer.id}>
                {trainer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex border rounded-md">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            className="rounded-r-none"
            onClick={() => setViewMode("grid")}
          >
            <BarChart4 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="icon"
            className="rounded-l-none"
            onClick={() => setViewMode("table")}
          >
            <ListFilter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading === "pending" ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredClasses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {searchTerm || filterDay || filterType || filterTrainer ? t("noClassesFound") : t("noClasses")}
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {searchTerm || filterDay || filterType || filterTrainer
                ? t("tryDifferentFilters")
                : t("addYourFirstClass")}
            </p>
            <Button onClick={() => setAddClassOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("addClass")}
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((gymClass) => (
            <Card
              key={gymClass.id}
              className={`overflow-hidden transition-all hover:shadow-md ${
                gymClass.status !== "active" ? "opacity-70" : ""
              }`}
            >
              <div
                className={`h-2 w-full ${
                  gymClass.isPersonalTraining ? "bg-purple-500 dark:bg-purple-600" : "bg-blue-500 dark:bg-blue-600"
                }`}
              />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="line-clamp-1">{gymClass.name}</CardTitle>
                    <CardDescription>
                      {gymClass.trainerName} • {getDayName(gymClass.dayOfWeek)}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={getStatusColor(gymClass.status)}>
                    {t(gymClass.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className={getTypeColor(gymClass.isPersonalTraining)}>
                    {gymClass.isPersonalTraining ? t("personalTraining") : t("groupClass")}
                  </Badge>
                  <Badge variant="outline" className={getLevelColor(gymClass.level)}>
                    {getLevelName(gymClass.level)}
                  </Badge>
                  <Badge variant="outline" className={getDayColor(gymClass.dayOfWeek)}>
                    {getDayName(gymClass.dayOfWeek)}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {gymClass.startTime} - {gymClass.endTime}
                    </span>
                  </div>

                  {gymClass.isPersonalTraining && gymClass.memberName && (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{gymClass.memberName}</span>
                    </div>
                  )}

                  {!gymClass.isPersonalTraining && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {gymClass.currentEnrollment} / {gymClass.maxCapacity} {t("participants")}
                      </span>
                    </div>
                  )}

                  {gymClass.description && (
                    <div className="line-clamp-2 text-muted-foreground mt-2">{gymClass.description}</div>
                  )}
                </div>

                {!gymClass.isPersonalTraining && (
                  <div className="mt-4 mb-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      {t("capacity")}: {gymClass.currentEnrollment}/{gymClass.maxCapacity}
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getCapacityColor(
                          gymClass.currentEnrollment,
                          gymClass.maxCapacity,
                        )}`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(5, (gymClass.currentEnrollment / gymClass.maxCapacity) * 100),
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full" onClick={() => openClassDetails(gymClass.id)}>
                  {t("viewDetails")}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("className")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead>{t("trainer")}</TableHead>
                  <TableHead>{t("day")}</TableHead>
                  <TableHead>{t("time")}</TableHead>
                  <TableHead>{t("level")}</TableHead>
                  <TableHead>{t("capacity")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-left">
                {filteredClasses.map((gymClass) => (
                  <TableRow key={gymClass.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {gymClass.isPersonalTraining ? (
                          <User className="h-4 w-4 mr-2 text-purple-500" />
                        ) : (
                          <Users className="h-4 w-4 mr-2 text-blue-500" />
                        )}
                        <span className="line-clamp-1">{gymClass.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTypeColor(gymClass.isPersonalTraining)}>
                        {gymClass.isPersonalTraining ? t("personalTraining") : t("groupClass")}
                      </Badge>
                    </TableCell>
                    <TableCell>{gymClass.trainerName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getDayColor(gymClass.dayOfWeek)}>
                        {getDayName(gymClass.dayOfWeek)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {gymClass.startTime} - {gymClass.endTime}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getLevelColor(gymClass.level)}>
                        {getLevelName(gymClass.level)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {gymClass.isPersonalTraining ? (
                        <span>1/1</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>
                            {gymClass.currentEnrollment}/{gymClass.maxCapacity}
                          </span>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getCapacityColor(
                                gymClass.currentEnrollment,
                                gymClass.maxCapacity,
                              )}`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(5, (gymClass.currentEnrollment / gymClass.maxCapacity) * 100),
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(gymClass.status)}>
                        {t(gymClass.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openClassDetails(gymClass.id)}>
                          <Info className="h-4 w-4" />
                        </Button>
                        {gymClass.status === "active" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleCancelClass(gymClass.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600"
                            onClick={() => handleReactivateClass(gymClass.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Class Dialog */}
      <Dialog
        open={addClassOpen}
        onOpenChange={(open) => {
          setAddClassOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("newClass")}</DialogTitle>
            <DialogDescription>{t("newClassDesc")}</DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue="personal"
            value={classType}
            onValueChange={(value) => setClassType(value as "personal" | "group")}
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t("personalTraining")}
              </TabsTrigger>
              <TabsTrigger value="group" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t("groupClass")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="memberId">
                    {t("selectMember")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newClass.memberId}
                    onValueChange={(value) => setNewClass({ ...newClass, memberId: value })}
                  >
                    <SelectTrigger id="memberId">
                      <SelectValue placeholder={loadingMembers ? t("loading") : t("selectMember")} />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {`${member.name} ${member.last_name || ""}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="trainerId">
                    {t("selectTrainer")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newClass.trainerId}
                    onValueChange={(value) => setNewClass({ ...newClass, trainerId: value })}
                  >
                    <SelectTrigger id="trainerId">
                      <SelectValue placeholder={loadingTrainers ? t("loading") : t("selectTrainer")} />
                    </SelectTrigger>
                    <SelectContent>
                      {trainers.map((trainer) => (
                        <SelectItem key={trainer.id} value={trainer.id}>
                          {trainer.name} - {trainer.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dayOfWeek">
                    {t("day")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newClass.dayOfWeek}
                    onValueChange={(value) => setNewClass({ ...newClass, dayOfWeek: value })}
                  >
                    <SelectTrigger id="dayOfWeek">
                      <SelectValue placeholder={t("chooseDay")} />
                    </SelectTrigger>
                    <SelectContent>
                      {weekdays.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="level">
                    {t("level")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newClass.level}
                    onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                      setNewClass({ ...newClass, level: value })
                    }
                  >
                    <SelectTrigger id="level">
                      <SelectValue placeholder={t("chooseLevel")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">{t("beginner")}</SelectItem>
                      <SelectItem value="intermediate">{t("intermediate")}</SelectItem>
                      <SelectItem value="advanced">{t("advanced")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">
                    {t("startTime")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newClass.startTime}
                    onChange={(e) => setNewClass({ ...newClass, startTime: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">
                    {t("endTime")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newClass.endTime}
                    onChange={(e) => setNewClass({ ...newClass, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id="isRecurring"
                    checked={newClass.isRecurring}
                    onCheckedChange={(checked) => setNewClass({ ...newClass, isRecurring: checked as boolean })}
                  />
                  <Label htmlFor="isRecurring">{t("isRecurring")}</Label>
                </div>
              </div>

              {newClass.isRecurring && (
                <div className="grid gap-2">
                  <Label htmlFor="sessionCount">{t("sessionCount")}</Label>
                  <Input
                    id="sessionCount"
                    type="number"
                    min="1"
                    max="52"
                    value={newClass.sessionCount}
                    onChange={(e) => setNewClass({ ...newClass, sessionCount: Number(e.target.value) })}
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label>{t("focusAreas")}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {focusAreaOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Checkbox
                        id={option.id}
                        checked={newClass.focusAreas.includes(option.id)}
                        onCheckedChange={() => toggleFocusArea(option.id)}
                      />
                      <Label htmlFor={option.id}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="goals">{t("trainingGoals")}</Label>
                <Textarea
                  id="goals"
                  placeholder={t("enterTrainingGoals")}
                  value={newClass.goals}
                  onChange={(e) => setNewClass({ ...newClass, goals: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">{t("additionalNotes")}</Label>
                <Textarea
                  id="notes"
                  placeholder={t("enterAdditionalNotes")}
                  value={newClass.notes}
                  onChange={(e) => setNewClass({ ...newClass, notes: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="group" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  {t("className")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder={t("enterClassName")}
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="trainerId">
                  {t("trainer")} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newClass.trainerId}
                  onValueChange={(value) => setNewClass({ ...newClass, trainerId: value })}
                >
                  <SelectTrigger id="trainerId">
                    <SelectValue placeholder={loadingTrainers ? t("loading") : t("selectTrainer")} />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.name} - {trainer.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dayOfWeek">
                    {t("day")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newClass.dayOfWeek}
                    onValueChange={(value) => setNewClass({ ...newClass, dayOfWeek: value })}
                  >
                    <SelectTrigger id="dayOfWeek">
                      <SelectValue placeholder={t("chooseDay")} />
                    </SelectTrigger>
                    <SelectContent>
                      {weekdays.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="level">
                    {t("level")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newClass.level}
                    onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                      setNewClass({ ...newClass, level: value })
                    }
                  >
                    <SelectTrigger id="level">
                      <SelectValue placeholder={t("chooseLevel")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">{t("beginner")}</SelectItem>
                      <SelectItem value="intermediate">{t("intermediate")}</SelectItem>
                      <SelectItem value="advanced">{t("advanced")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">
                    {t("startTime")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newClass.startTime}
                    onChange={(e) => setNewClass({ ...newClass, startTime: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">
                    {t("endTime")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newClass.endTime}
                    onChange={(e) => setNewClass({ ...newClass, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxCapacity">
                  {t("maxParticipants")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  min="1"
                  value={newClass.maxCapacity}
                  onChange={(e) => setNewClass({ ...newClass, maxCapacity: Number(e.target.value) })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">{t("classDescription")}</Label>
                <Textarea
                  id="description"
                  placeholder={t("enterClassDesc")}
                  value={newClass.description}
                  onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddClassOpen(false)} disabled={isSubmitting}>
              {t("cancel")}
            </Button>
            <Button onClick={handleAddClass} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("adding")}
                </>
              ) : classType === "personal" ? (
                t("addPersonalTraining")
              ) : (
                t("addClass")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Class Details Dialog */}
      <Dialog open={classDetailsOpen} onOpenChange={setClassDetailsOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          {selectedClassDetails ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getTypeColor(selectedClassDetails.isPersonalTraining)}>
                    {selectedClassDetails.isPersonalTraining ? t("personalTraining") : t("groupClass")}
                  </Badge>
                  <DialogTitle>{selectedClassDetails.name}</DialogTitle>
                </div>
                <DialogDescription>
                  {t("scheduledFor")} {getDayName(selectedClassDetails.dayOfWeek)}, {selectedClassDetails.startTime} -{" "}
                  {selectedClassDetails.endTime}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={getStatusColor(selectedClassDetails.status)}>
                    {t(selectedClassDetails.status)}
                  </Badge>
                  <Badge variant="outline" className={getLevelColor(selectedClassDetails.level)}>
                    {getLevelName(selectedClassDetails.level)}
                  </Badge>
                  <Badge variant="outline" className={getDayColor(selectedClassDetails.dayOfWeek)}>
                    {getDayName(selectedClassDetails.dayOfWeek)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t("trainerInfo")}</h4>
                    <div className="flex items-center gap-3 p-3 border rounded-md">
                      <Avatar>
                        <AvatarFallback>
                          {selectedClassDetails.trainerName
                            ? selectedClassDetails.trainerName.substring(0, 2).toUpperCase()
                            : "TR"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedClassDetails.trainerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {trainers.find((t) => t.id === selectedClassDetails.trainerId)?.role || t("trainer")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedClassDetails.isPersonalTraining && selectedClassDetails.memberName && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">{t("memberInfo")}</h4>
                      <div className="flex items-center gap-3 p-3 border rounded-md">
                        <Avatar>
                          <AvatarFallback>
                            {selectedClassDetails.memberName
                              ? selectedClassDetails.memberName.substring(0, 2).toUpperCase()
                              : "MB"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedClassDetails.memberName}</p>
                          <p className="text-sm text-muted-foreground">{t("member")}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">{t("schedule")}</h4>
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{getDayName(selectedClassDetails.dayOfWeek)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {selectedClassDetails.startTime} - {selectedClassDetails.endTime}
                      </span>
                    </div>
                  </div>
                </div>

                {!selectedClassDetails.isPersonalTraining && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t("capacity")}</h4>
                    <div className="p-3 border rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <span>
                          {selectedClassDetails.currentEnrollment} / {selectedClassDetails.maxCapacity}{" "}
                          {t("participants")}
                        </span>
                        <span
                          className={`text-xs ${
                            selectedClassDetails.currentEnrollment >= selectedClassDetails.maxCapacity
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {selectedClassDetails.currentEnrollment >= selectedClassDetails.maxCapacity
                            ? t("full")
                            : t("spotsAvailable")}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getCapacityColor(
                            selectedClassDetails.currentEnrollment,
                            selectedClassDetails.maxCapacity,
                          )}`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                5,
                                (selectedClassDetails.currentEnrollment / selectedClassDetails.maxCapacity) * 100,
                              ),
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedClassDetails.description && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t("description")}</h4>
                    <div className="p-3 border rounded-md">
                      <p className="text-sm">{selectedClassDetails.description}</p>
                    </div>
                  </div>
                )}

                {selectedClassDetails.isPersonalTraining && selectedClassDetails.goals && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t("trainingGoals")}</h4>
                    <div className="p-3 border rounded-md">
                      <p className="text-sm">{selectedClassDetails.goals}</p>
                    </div>
                  </div>
                )}

                {selectedClassDetails.isPersonalTraining &&
                  selectedClassDetails.focusAreas &&
                  selectedClassDetails.focusAreas.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">{t("focusAreas")}</h4>
                      <div className="p-3 border rounded-md">
                        <div className="flex flex-wrap gap-2">
                          {selectedClassDetails.focusAreas.map((area) => (
                            <Badge key={area} variant="secondary">
                              {t(area)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                {selectedClassDetails.isPersonalTraining && selectedClassDetails.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t("additionalNotes")}</h4>
                    <div className="p-3 border rounded-md">
                      <p className="text-sm">{selectedClassDetails.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-between">
                <div>
                  {selectedClassDetails.status === "active" ? (
                    <Button
                      variant="outline"
                      className="text-destructive border-destructive hover:bg-destructive/10"
                      onClick={() => {
                        handleCancelClass(selectedClassDetails.id)
                        setClassDetailsOpen(false)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("removeClass")}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-600/10"
                      onClick={() => {
                        handleReactivateClass(selectedClassDetails.id)
                        setClassDetailsOpen(false)
                      }}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {t("reactivateClass")}
                    </Button>
                  )}
                </div>
                <Button variant="outline" onClick={() => setClassDetailsOpen(false)}>
                  {t("close")}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
