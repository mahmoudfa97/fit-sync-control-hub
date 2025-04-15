
import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { t } from "@/utils/translations";
import { UseFormReturn } from "react-hook-form";

export interface ScheduleItem {
  day: string;
  start: number;
  end: number;
}

interface ScheduleSelectorProps {
  form: UseFormReturn<any>;
}

export function ScheduleSelector({ form }: ScheduleSelectorProps) {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(form.getValues('schedule') || []);

  const days = [
    { value: "sunday", label: t("sunday") },
    { value: "monday", label: t("monday") },
    { value: "tuesday", label: t("tuesday") },
    { value: "wednesday", label: t("wednesday") },
    { value: "thursday", label: t("thursday") },
    { value: "friday", label: t("friday") },
    { value: "saturday", label: t("saturday") },
  ];

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i < 10 ? `0${i}` : `${i}`;
    return { value: i, label: `${hour}:00` };
  });
  
  const addScheduleItem = () => {
    const newSchedule = [...schedule, { day: "sunday", start: 8, end: 10 }];
    setSchedule(newSchedule);
    form.setValue("schedule", newSchedule);
  };

  const removeScheduleItem = (index: number) => {
    const newSchedule = schedule.filter((_, i) => i !== index);
    setSchedule(newSchedule);
    form.setValue("schedule", newSchedule);
  };

  const updateScheduleItem = (index: number, field: keyof ScheduleItem, value: any) => {
    const newSchedule = [...schedule];
    newSchedule[index] = {
      ...newSchedule[index],
      [field]: typeof value === 'string' ? value : parseInt(value)
    };
    setSchedule(newSchedule);
    form.setValue("schedule", newSchedule);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FormLabel>{t("schedule")}</FormLabel>
        <Button 
          type="button" 
          onClick={addScheduleItem} 
          variant="outline" 
          size="sm"
          className="h-8"
        >
          <Plus className="mr-1 h-4 w-4" />
          {t("addTimeSlot")}
        </Button>
      </div>

      {schedule.map((item, index) => (
        <div key={index} className="flex items-center gap-2 p-3 border rounded-md">
          <div className="grid grid-cols-3 gap-2 flex-1">
            <Select
              value={item.day}
              onValueChange={(value) => updateScheduleItem(index, "day", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("chooseDay")} />
              </SelectTrigger>
              <SelectContent>
                {days.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={item.start.toString()}
              onValueChange={(value) => updateScheduleItem(index, "start", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("startTime")} />
              </SelectTrigger>
              <SelectContent>
                {hours.map((hour) => (
                  <SelectItem key={hour.value} value={hour.value.toString()}>
                    {hour.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={item.end.toString()}
              onValueChange={(value) => updateScheduleItem(index, "end", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("endTime")} />
              </SelectTrigger>
              <SelectContent>
                {hours.map((hour) => (
                  <SelectItem key={hour.value} value={hour.value.toString()}>
                    {hour.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            type="button" 
            onClick={() => removeScheduleItem(index)}
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {schedule.length === 0 && (
        <div className="text-sm text-muted-foreground text-center p-4 border border-dashed rounded-md">
          {t("noScheduleItems")}
        </div>
      )}
    </div>
  );
}

