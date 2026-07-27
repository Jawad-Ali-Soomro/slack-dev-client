import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, ClockIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DEFAULT_START_MONTH = new Date(2000, 0);
const DEFAULT_END_MONTH = new Date(2035, 11);

const triggerClasses =
  "w-full h-12 justify-start rounded-[15px] border border-gray-200 dark:border-gray-700 bg-transparent px-3 font-normal text-left";

/* ---------------------------- helpers ---------------------------- */

function parseYMD(value) {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatYMD(date) {
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
}

function parseDateTimeLocal(value) {
  if (!value) return undefined;
  const [datePart, timePart = "00:00"] = value.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  if (!y || !m || !d) return undefined;
  const date = new Date(y, m - 1, d, hh || 0, mm || 0);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateTimeLocal(date) {
  if (!date) return "";
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

/* ---------------------------- DatePicker ---------------------------- */

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
  disablePast = false,
  id,
  ...props
}) {
  const [open, setOpen] = React.useState(false);
  const selected = parseYMD(value);
  const disabledDays = disablePast ? { before: startOfToday() } : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            triggerClasses,
            !selected && "text-gray-500 dark:text-gray-400",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-70" />
          {selected ? format(selected, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          startMonth={DEFAULT_START_MONTH}
          endMonth={DEFAULT_END_MONTH}
          defaultMonth={selected}
          selected={selected}
          disabled={disabledDays}
          onSelect={(date) => {
            onChange?.(formatYMD(date));
            setOpen(false);
          }}
          autoFocus
          {...props}
        />
      </PopoverContent>
    </Popover>
  );
}

/* -------------------------- DateTimePicker -------------------------- */

function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick date & time",
  className,
  disabled,
  disablePast = false,
  id,
  ...props
}) {
  const [open, setOpen] = React.useState(false);
  const selected = parseDateTimeLocal(value);
  const timeValue = selected ? format(selected, "HH:mm") : "09:00";
  const disabledDays = disablePast ? { before: startOfToday() } : undefined;

  const handleDateSelect = (date) => {
    if (!date) return;
    const [hh, mm] = timeValue.split(":").map(Number);
    const next = new Date(date);
    next.setHours(hh || 0, mm || 0, 0, 0);
    onChange?.(formatDateTimeLocal(next));
  };

  const handleTimeChange = (e) => {
    const [hh, mm] = e.target.value.split(":").map(Number);
    const base = selected ? new Date(selected) : new Date();
    base.setHours(hh || 0, mm || 0, 0, 0);
    onChange?.(formatDateTimeLocal(base));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            triggerClasses,
            !selected && "text-gray-500 dark:text-gray-400",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-70" />
          {selected ? format(selected, "PPP p") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          startMonth={DEFAULT_START_MONTH}
          endMonth={DEFAULT_END_MONTH}
          defaultMonth={selected}
          selected={selected}
          disabled={disabledDays}
          onSelect={handleDateSelect}
          autoFocus
          {...props}
        />
        <div className="flex items-center gap-2 border-t border-border p-3">
          <ClockIcon className="h-4 w-4 shrink-0 opacity-70" />
          <input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            className="h-9 w-full rounded-[12px] border border-gray-200 bg-transparent px-3 text-sm outline-none focus:border-primary dark:border-gray-700 dark:text-white"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ---------------------------- TimePicker ---------------------------- */

function to12Hour(value) {
  if (!value) return { hour: 9, minute: 0, period: "AM" };
  const [hh, mm] = value.split(":").map(Number);
  const period = hh >= 12 ? "PM" : "AM";
  let hour = hh % 12;
  if (hour === 0) hour = 12;
  return { hour, minute: mm || 0, period };
}

function to24Hour(hour, minute, period) {
  let h = hour % 12;
  if (period === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

function TimePicker({
  value,
  onChange,
  placeholder = "Pick a time",
  className,
  disabled,
  id,
}) {
  const [open, setOpen] = React.useState(false);
  const { hour, minute, period } = to12Hour(value);

  const update = (next) => {
    const merged = { hour, minute, period, ...next };
    onChange?.(to24Hour(merged.hour, merged.minute, merged.period));
  };

  const Column = ({ items, active, render, onPick }) => (
    <div className="flex max-h-48 flex-col gap-1 overflow-y-auto px-1">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onPick(item)}
          className={cn(
            "rounded-[10px] px-3 py-1.5 text-sm transition-colors",
            active === item
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent hover:text-accent-foreground",
          )}
        >
          {render ? render(item) : item}
        </button>
      ))}
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            triggerClasses,
            !value && "text-gray-500 dark:text-gray-400",
            className,
          )}
        >
          <ClockIcon className="mr-2 h-4 w-4 shrink-0 opacity-70" />
          {value ? (
            `${hour}:${String(minute).padStart(2, "0")} ${period}`
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex gap-2">
          <Column
            items={HOURS}
            active={hour}
            onPick={(h) => update({ hour: h })}
          />
          <Column
            items={MINUTES}
            active={minute}
            render={(m) => String(m).padStart(2, "0")}
            onPick={(m) => update({ minute: m })}
          />
          <Column
            items={["AM", "PM"]}
            active={period}
            onPick={(p) => update({ period: p })}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export {
  DatePicker,
  DateTimePicker,
  TimePicker,
  parseYMD,
  formatYMD,
  parseDateTimeLocal,
  formatDateTimeLocal,
};
