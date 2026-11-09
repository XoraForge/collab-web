"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays, X } from "lucide-react";
import { useState } from "react";

/** A date field that can be empty (unlike DatePicker). */
export function OptionalDate({
  value,
  onChange,
  placeholder = "No date",
  disabled = false,
  label,
}: {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Accessible name, e.g. "Start date" */
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-x-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            type="button"
            variant="outline"
            aria-label={label}
            className="h-8 flex-1 justify-between text-xs font-normal"
          >
            <span className={value ? undefined : "text-muted-text"}>
              {value ? value.toLocaleDateString() : placeholder}
            </span>
            <CalendarDays className="opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            defaultMonth={value ?? undefined}
            captionLayout="dropdown"
            onSelect={(date) => {
              onChange(date ?? null);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {value && !disabled && (
        <Button type="button" size="icon-sm" variant="ghost" aria-label={`Clear ${label.toLowerCase()}`} onClick={() => onChange(null)}>
          <X />
        </Button>
      )}
    </div>
  );
}
