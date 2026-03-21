"use client";

import { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  /** Value as YYYY-MM-DD string */
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function DatePicker({ value, onChange, className }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const date = value
    ? parse(value, "yyyy-MM-dd", new Date())
    : undefined;
  const validDate = date && isValid(date) ? date : undefined;

  function handleSelect(day: Date | undefined) {
    if (day) {
      onChange(format(day, "yyyy-MM-dd"));
    }
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !validDate && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-1.5 h-3 w-3 shrink-0 opacity-50" />
          {validDate ? format(validDate, "dd/MM/yyyy") : "Chọn ngày..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={validDate}
          onSelect={handleSelect}
          locale={vi}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
