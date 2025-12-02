"use client";

import { Calendar } from "@/components/ui/calendar-rac";
import { DateInput } from "@/components/ui/datefield-rac";
import { CalendarDate } from "@internationalized/date";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Dialog,
  Group,
  Popover,
} from "react-aria-components";

interface CalendrierProps {
  value?: CalendarDate | null;
  onChange?: (date: CalendarDate | null) => void;
}

export default function Calendrier({
  value = null,
  onChange,
}: CalendrierProps) {
  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(value);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDateChange = (date: CalendarDate | null) => {
    setSelectedDate(date);
    onChange?.(date);
  };

  // ⛔️ Empêcher le rendu avant montage (évite l’hydratation incorrecte)
  if (!isMounted) return null;

  return (
    <div className="space-y-2">
      <DatePicker
        aria-label="Date de livraison"
        value={selectedDate || undefined}
        onChange={handleDateChange}
        className="*:not-first:mt-2"
      >
        <label className="text-sm font-medium">Date de livraison</label>
        <div className="flex">
          <Group className="w-full">
            <DateInput className="pe-9" />
          </Group>
          <Button className="z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-[3px] data-focus-visible:ring-ring/50">
            <CalendarIcon size={16} />
          </Button>
        </div>
        <Popover
          className="z-50 rounded-lg border bg-background text-popover-foreground shadow-lg outline-hidden data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2"
          offset={4}
        >
          <Dialog className="max-h-[inherit] overflow-auto p-2">
            <Calendar />
          </Dialog>
        </Popover>
      </DatePicker>

      <p className="text-sm text-muted-foreground">
        {selectedDate
          ? `Date sélectionnée : ${selectedDate.toString()}`
          : "Aucune date sélectionnée"}
      </p>
    </div>
  );
}
