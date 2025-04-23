"use client"

import { useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, Save } from "lucide-react"
import { t } from "@/utils/translations"
import { MemberProgramsService } from "@/services/MemberProgramsService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CreateProgramDialogProps {
  memberId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Exercise {
  day_of_week: string
  exercise_name: string
  sets: number
  reps: string
  weight: string
  rest_time: string
  notes: string
  order_index: number
}

const DAYS_OF_WEEK = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

export function CreateProgramDialog({ memberId, isOpen, onClose, onSuccess }: CreateProgramDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [activeTab, setActiveTab] = useState(DAYS_OF_WEEK[0])
  const [exercises, setExercises] = useState<Record<string, Exercise[]>>(
    DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: [] }), {}),
  )
  const [isCreating, setIsCreating] = useState(false)

  const handleAddExercise = (day: string) => {
    setExercises((prev) => ({
      ...prev,
      [day]: [
        ...prev[day],
        {
          day_of_week: day,
          exercise_name: "",
          sets: 3,
          reps: "8-12",
          weight: "",
          rest_time: "60",
          notes: "",
          order_index: prev[day].length,
        },
      ],
    }))
  }

  const handleRemoveExercise = (day: string, index: number) => {
    setExercises((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }))
  }

  const handleExerciseChange = (day: string, index: number, field: keyof Exercise, value: any) => {
    setExercises((prev) => ({
      ...prev,
      [day]: prev[day].map((exercise, i) => (i === index ? { ...exercise, [field]: value } : exercise)),
    }))
  }

  const handleCreateProgram = async () => {
    if (!title.trim()) {
      toast.error(t("programTitleRequired"))
      return
    }

    if (!startDate) {
      toast.error(t("startDateRequired"))
      return
    }

    // Flatten exercises from all days
    const allExercises = Object.values(exercises).flat()

    if (allExercises.length === 0) {
      toast.error(t("atLeastOneExerciseRequired"))
      return
    }

    // Validate that all exercises have a name
    const invalidExercises = allExercises.filter((ex) => !ex.exercise_name.trim())
    if (invalidExercises.length > 0) {
      toast.error(t("allExercisesMustHaveName"))
      return
    }

    try {
      setIsCreating(true)
      await MemberProgramsService.createProgram({
        memberId,
        title: title.trim(),
        description: description.trim() || undefined,
        startDate,
        endDate: endDate || undefined,
        exercises: allExercises,
      })

      toast.success(t("programCreatedSuccessfully"))
      onSuccess()
      handleClose()
    } catch (error) {
      console.error("Error creating program:", error)
      toast.error(t("errorCreatingProgram"))
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setTitle("")
    setDescription("")
    setStartDate("")
    setEndDate("")
    setActiveTab(DAYS_OF_WEEK[0])
    setExercises(DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: [] }), {}))
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("createProgram")}</DialogTitle>
          <DialogDescription>{t("createProgramDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("programTitle")}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("programTitlePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">{t("startDate")}</Label>
              <div className="flex space-x-2">
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder={t("optional")}
                  min={startDate}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("programDescription")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("programDescriptionPlaceholder")}
              rows={2}
            />
          </div>

          <div className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("exercises")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-7">
                    {DAYS_OF_WEEK.map((day) => (
                      <TabsTrigger key={day} value={day} className="text-xs">
                        {t(day)}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {DAYS_OF_WEEK.map((day) => (
                    <TabsContent key={day} value={day} className="space-y-4">
                      {exercises[day].length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                          <p>{t("noExercisesForDay")}</p>
                        </div>
                      ) : (
                        exercises[day].map((exercise, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">
                                {t("exercise")} {index + 1}
                              </h4>
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveExercise(day, index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label>{t("exerciseName")}</Label>
                                <Input
                                  value={exercise.exercise_name}
                                  onChange={(e) => handleExerciseChange(day, index, "exercise_name", e.target.value)}
                                  placeholder={t("exerciseNamePlaceholder")}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label>{t("sets")}</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={exercise.sets}
                                    onChange={(e) =>
                                      handleExerciseChange(day, index, "sets", Number.parseInt(e.target.value) || 1)
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>{t("reps")}</Label>
                                  <Input
                                    value={exercise.reps}
                                    onChange={(e) => handleExerciseChange(day, index, "reps", e.target.value)}
                                    placeholder="8-12"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label>{t("weight")}</Label>
                                <Input
                                  value={exercise.weight}
                                  onChange={(e) => handleExerciseChange(day, index, "weight", e.target.value)}
                                  placeholder={t("optional")}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>{t("restTime")}</Label>
                                <Input
                                  value={exercise.rest_time}
                                  onChange={(e) => handleExerciseChange(day, index, "rest_time", e.target.value)}
                                  placeholder="60"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>{t("notes")}</Label>
                              <Textarea
                                value={exercise.notes}
                                onChange={(e) => handleExerciseChange(day, index, "notes", e.target.value)}
                                placeholder={t("exerciseNotesPlaceholder")}
                                rows={2}
                              />
                            </div>
                          </div>
                        ))
                      )}

                      <Button variant="outline" className="w-full" onClick={() => handleAddExercise(day)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t("addExercise")}
                      </Button>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            {t("cancel")}
          </Button>
          <Button onClick={handleCreateProgram} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("creating")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t("createProgram")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
