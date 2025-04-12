
import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addClass, cancelClass, reactivateClass } from "@/store/slices/classesSlice";
import { t } from "@/utils/translations";

const weekdays = [
  { value: "sunday", label: t("sunday") },
  { value: "monday", label: t("monday") },
  { value: "tuesday", label: t("tuesday") },
  { value: "wednesday", label: t("wednesday") },
  { value: "thursday", label: t("thursday") },
  { value: "friday", label: t("friday") },
  { value: "saturday", label: t("saturday") },
];

export default function Classes() {
  const dispatch = useAppDispatch();
  const { classes } = useAppSelector((state) => state.classes);
  const { staff } = useAppSelector((state) => state.staff);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    name: "",
    trainerId: "",
    dayOfWeek: "sunday",
    startTime: "08:00",
    endTime: "09:00",
    maxCapacity: 15,
    description: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
  });
  
  const filteredClasses = classes.filter(
    (gymClass) =>
      gymClass.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gymClass.trainerName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddClass = () => {
    if (!newClass.name || !newClass.trainerId) {
      toast.error(t("fillAllRequired"));
      return;
    }
    
    const trainer = staff.find((s) => s.id === newClass.trainerId);
    if (!trainer) {
      toast.error(t("trainerNotFound"));
      return;
    }
    
    dispatch(
      addClass({
        id: `class-${Date.now()}`,
        name: newClass.name,
        trainerId: newClass.trainerId,
        trainerName: trainer.name,
        dayOfWeek: newClass.dayOfWeek,
        startTime: newClass.startTime,
        endTime: newClass.endTime,
        maxCapacity: newClass.maxCapacity,
        currentEnrollment: 0,
        description: newClass.description,
        level: newClass.level,
        status: "active",
      })
    );
    
    toast.success(t("classAdded"));
    setNewClass({
      name: "",
      trainerId: "",
      dayOfWeek: "sunday",
      startTime: "08:00",
      endTime: "09:00",
      maxCapacity: 15,
      description: "",
      level: "beginner",
    });
    setAddClassOpen(false);
  };
  
  const getDayName = (day: string) => {
    const found = weekdays.find((d) => d.value === day);
    return found ? found.label : day;
  };
  
  const getLevelName = (level: string) => {
    return t(level);
  };
  
  const handleCancelClass = (classId: string) => {
    dispatch(cancelClass(classId));
    toast.success(t("classCanceled"));
  };
  
  const handleReactivateClass = (classId: string) => {
    dispatch(reactivateClass(classId));
    toast.success(t("classReactivated"));
  };
  
  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("classesTitle")}</h1>
          <p className="text-muted-foreground">
            {t("classesDesc")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("searchClassOrTrainer")}
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setAddClassOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addClass")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("classSchedule")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("className")}</TableHead>
                <TableHead>{t("trainer")}</TableHead>
                <TableHead>{t("day")}</TableHead>
                <TableHead>{t("time")}</TableHead>
                <TableHead>{t("level")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("enrollment")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.length > 0 ? (
                filteredClasses.map((gymClass) => (
                  <TableRow key={gymClass.id}>
                    <TableCell className="font-medium">{gymClass.name}</TableCell>
                    <TableCell>{gymClass.trainerName}</TableCell>
                    <TableCell>{getDayName(gymClass.dayOfWeek)}</TableCell>
                    <TableCell>{`${gymClass.startTime} - ${gymClass.endTime}`}</TableCell>
                    <TableCell>{getLevelName(gymClass.level)}</TableCell>
                    <TableCell>
                      {gymClass.status === "active" ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500">
                          {t("active")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500">
                          {t("inactive")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{`${gymClass.currentEnrollment} / ${gymClass.maxCapacity}`}</TableCell>
                    <TableCell className="text-right">
                      {gymClass.status === "active" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleCancelClass(gymClass.id)}
                        >
                          {t("removeClass")}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReactivateClass(gymClass.id)}
                        >
                          {t("reactivateClass")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    {t("noCheckIns")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={addClassOpen} onOpenChange={setAddClassOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{t("newClass")}</DialogTitle>
            <DialogDescription>
              {t("newClassDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("className")}</Label>
              <Input
                id="name"
                placeholder={t("enterClassName")}
                value={newClass.name}
                onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="trainerId">{t("trainer")}</Label>
              <Select
                value={newClass.trainerId}
                onValueChange={(value) => setNewClass({ ...newClass, trainerId: value })}
              >
                <SelectTrigger id="trainerId">
                  <SelectValue placeholder={t("chooseTrainer")} />
                </SelectTrigger>
                <SelectContent>
                  {staff
                    .filter((s) => s.department === "התדריב")
                    .map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dayOfWeek">{t("day")}</Label>
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
                <Label htmlFor="level">{t("level")}</Label>
                <Select
                  value={newClass.level}
                  onValueChange={(value: "beginner" | "intermediate" | "advanced") => 
                    setNewClass({ ...newClass, level: value })}
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
                <Label htmlFor="startTime">{t("startTime")}</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newClass.startTime}
                  onChange={(e) => setNewClass({ ...newClass, startTime: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">{t("endTime")}</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newClass.endTime}
                  onChange={(e) => setNewClass({ ...newClass, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxCapacity">{t("maxParticipants")}</Label>
              <Input
                id="maxCapacity"
                type="number"
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddClassOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleAddClass}>{t("addClass")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
