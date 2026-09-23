import { useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const startOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);
const addMonths = (date, months) =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);

const isSameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getMonthDaysGrid = (monthDate) => {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  const leading = (start.getDay() + 6) % 7;
  const days = [];

  for (let i = leading; i > 0; i -= 1) {
    const date = new Date(start);
    date.setDate(start.getDate() - i);
    days.push({ date, outside: true });
  }

  for (let d = 1; d <= end.getDate(); d += 1) {
    days.push({
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), d),
      outside: false,
    });
  }

  while (days.length % 7 !== 0) {
    const last = days[days.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    days.push({ date: next, outside: true });
  }

  return days;
};

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function DashboardCalendar({
  selectedDate,
  onSelectDate,
  month,
  onMonthChange,
  getEventsForDate,
  canCreateTask,
  canCreateMeeting,
  onScheduleTask,
  onScheduleMeeting,
}) {
  const today = new Date();
  const days = useMemo(() => getMonthDaysGrid(month), [month]);
  const selectedEvents = getEventsForDate(selectedDate) || {
    tasks: [],
    meetings: [],
    total: 0,
  };

  const goToday = () => {
    const now = new Date();
    onSelectDate(now);
    onMonthChange(now);
  };

  return (
    <div className="dashboard-card p-5 w-full">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="dashboard-section-title min-w-0">
          <div className="dashboard-section-icon">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              Calendar
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
              {selectedDate.toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={goToday}
            className="h-8 px-3 text-[11px] font-bold rounded-xl bg-[#75FC96] text-black hover:bg-[#4fd972] transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, -1))}
            className="h-8 w-8 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors inline-flex items-center justify-center"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="min-w-[118px] text-center text-sm font-bold text-gray-900 dark:text-white">
            {month.toLocaleString("default", { month: "long" })}{" "}
            {month.getFullYear()}
          </div>
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, 1))}
            className="h-8 w-8 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors inline-flex items-center justify-center"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-center py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, outside }, idx) => {
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);
          const events = getEventsForDate(date);
          const hasEvents = events.total > 0;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onSelectDate(date);
                if (outside) onMonthChange(date);
              }}
              className={[
                "relative aspect-square w-full rounded-2xl flex flex-col items-center justify-center text-[13px] font-semibold transition-all duration-150",
                outside
                  ? "text-gray-300 dark:text-gray-600"
                  : "text-gray-800 dark:text-gray-100",
                isSelected
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                  : isToday
                    ? "bg-[#75FC96]/25 text-black dark:text-[#75FC96] ring-2 ring-[#75FC96] ring-offset-1 ring-offset-white dark:ring-offset-black"
                    : hasEvents
                      ? "bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10"
                      : "hover:bg-gray-50 dark:hover:bg-white/5",
              ].join(" ")}
              aria-label={date.toDateString()}
              aria-current={isToday ? "date" : undefined}
              aria-pressed={isSelected}
            >
              <span className="leading-none">{date.getDate()}</span>
              {hasEvents && (
                <span className="flex items-center gap-0.5 mt-1">
                  {events.tasks.length > 0 && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-[#75FC96]" : "bg-[#75FC96]"
                      }`}
                    />
                  )}
                  {events.meetings.length > 0 && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected
                          ? "bg-white dark:bg-black"
                          : "bg-black dark:bg-white"
                      }`}
                    />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-3 mb-4 text-[11px] font-medium text-gray-500 dark:text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#75FC96]" />
          Task
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
          Meeting
        </span>
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-[#F8F9FA] dark:bg-white/5 p-3.5 mb-4 min-h-[92px]">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
          {selectedDate.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </p>
        {selectedEvents.total === 0 ? (
          <p className="text-sm text-gray-400 py-2">Nothing scheduled</p>
        ) : (
          <ul className="space-y-1.5 max-h-28 overflow-y-auto [scrollbar-width:thin]">
            {selectedEvents.tasks.map((task) => (
              <li
                key={task.id || task._id}
                className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200"
              >
                <Target className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                <span className="truncate font-medium">
                  {task.title || task.name}
                </span>
                {task.dueDate && (
                  <span className="ml-auto text-[11px] text-gray-400 shrink-0 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(task.dueDate)}
                  </span>
                )}
              </li>
            ))}
            {selectedEvents.meetings.map((meeting) => (
              <li
                key={meeting.id || meeting._id}
                className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200"
              >
                <Video className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate font-medium">
                  {meeting.title || meeting.name}
                </span>
                {meeting.startDate && (
                  <span className="ml-auto text-[11px] text-gray-400 shrink-0 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(meeting.startDate)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-row gap-2">
        <Button
          onClick={onScheduleTask}
          disabled={!canCreateTask}
          className="flex-1 h-11 font-semibold rounded-xl text-sm bg-[#75FC96] hover:bg-[#4fd972] text-black disabled:opacity-50"
        >
          <Target className="w-4 h-4" />
          Schedule Task
        </Button>
        <Button
          variant="outline"
          onClick={onScheduleMeeting}
          disabled={!canCreateMeeting}
          className="flex-1 h-11 rounded-xl text-sm font-semibold border-gray-200 dark:border-white/10 disabled:opacity-50"
        >
          <Video className="w-4 h-4" />
          Schedule Meeting
        </Button>
      </div>
    </div>
  );
}
