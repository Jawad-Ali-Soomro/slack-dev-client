import { Skeleton } from "@/components/ui/skeleton";
import {
  DEFAULT_WIDGET_SIZES,
  spanClassForCols,
} from "./dashboard-sortable-grid";

function WidgetSlot({ id, children }) {
  return (
    <div
      className={`col-span-1 min-w-0 ${spanClassForCols(DEFAULT_WIDGET_SIZES[id]?.cols)}`}
    >
      {children}
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="dashboard-page-header">
      <div className="dashboard-welcome">
        <Skeleton className="dashboard-welcome__icon h-12 w-12 rounded-xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-40 rounded-md" />
          <Skeleton className="h-3.5 w-52 rounded-md" />
        </div>
      </div>
      <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
    </div>
  );
}

function PillSkeleton() {
  return (
    <div className="dashboard-pill">
      <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0" />
      <div className="min-w-0 space-y-1.5">
        <Skeleton className="h-2.5 w-20 rounded-md" />
        <Skeleton className="h-3.5 w-24 rounded-md" />
      </div>
    </div>
  );
}

function StatChipSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 px-4 py-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <Skeleton className="h-3 w-20 rounded-md" />
        <Skeleton className="h-6 w-6 rounded-full shrink-0" />
      </div>
      <div className="flex items-end justify-between gap-3">
        <Skeleton className="h-8 w-14 rounded-md" />
        <Skeleton className="h-8 w-[72px] rounded-md shrink-0" />
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="dashboard-card p-5 w-full">
      <div className="flex items-center justify-between mb-4 gap-3">
        <Skeleton className="h-5 w-36 rounded-md" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <Skeleton className="w-full h-[240px] rounded-xl" />
    </div>
  );
}

function TaskStatsSkeleton() {
  return (
    <div className="dashboard-card p-5 flex flex-col w-full">
      <div className="flex items-center justify-between mb-4 gap-3">
        <Skeleton className="h-5 w-32 rounded-md" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-7 w-36 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="h-3 w-14 rounded-md" />
        <Skeleton className="h-3 w-12 rounded-md" />
        <Skeleton className="h-3 w-20 rounded-md" />
      </div>
      <Skeleton className="h-3 w-full rounded-full mb-5" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 dark:border-white/10 bg-[#F8F9FA] dark:bg-white/5 p-3.5"
          >
            <div className="flex items-start gap-2.5 mb-2.5">
              <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-2.5 w-16 rounded-md" />
                <Skeleton className="h-3.5 w-24 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-1.5 w-full rounded-full mb-1.5" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturedCardSkeleton() {
  return (
    <div className="h-full min-h-[280px] rounded-[28px] bg-[#121212] p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-6 w-14 rounded-full bg-white/15" />
          <Skeleton className="h-9 w-9 rounded-full bg-white/15 shrink-0" />
        </div>
        <Skeleton className="mt-4 h-6 w-4/5 rounded-md bg-white/20" />
        <Skeleton className="mt-3 h-4 w-3/5 rounded-md bg-white/10" />
      </div>
      <Skeleton className="h-12 w-full rounded-2xl bg-[#75FC96]/40" />
    </div>
  );
}

function ListPanelSkeleton({ rows = 5 }) {
  return (
    <div className="dashboard-card p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-2.5 px-3 rounded-lg border border-gray-100 dark:border-white/5 bg-[#F8F9FA] dark:bg-white/5"
          >
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <Skeleton className="h-3.5 w-3/4 rounded-md" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-16 rounded-md" />
                <Skeleton className="h-1.5 w-[100px] rounded-full" />
              </div>
            </div>
            <Skeleton className="h-4 w-4 rounded shrink-0" />
          </div>
        ))}
      </div>
      <Skeleton className="h-9 w-full rounded-lg mt-4" />
    </div>
  );
}

function MeetingStatusSkeleton() {
  return (
    <div className="dashboard-card p-5 w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-3 w-28 rounded-md" />
        </div>
      </div>
      <Skeleton className="w-full h-[160px] rounded-xl" />
      <div className="grid grid-cols-2 gap-2 mt-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-[#F8F9FA] dark:bg-white/5"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="h-2.5 w-2.5 rounded-full" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
            <Skeleton className="h-4 w-6 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="dashboard-card p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-32 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <ul className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <li
            key={i}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          >
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GithubReposSkeleton() {
  return (
    <div className="dashboard-card p-5 w-full">
      <div className="flex gap-2 items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg border border-gray-100 dark:border-white/5 bg-[#F8F9FA] dark:bg-white/5"
          >
            <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
            <Skeleton className="h-3 w-2/3 rounded-md" />
          </div>
        ))}
      </div>
      <Skeleton className="h-8 w-full rounded-lg mt-3" />
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="dashboard-card p-5 w-full">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-14 rounded-[15px]" />
          <Skeleton className="h-8 w-8 rounded-[15px]" />
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-[15px]" />
        </div>
      </div>
      <div className="grid grid-cols-9 gap-2 sm:gap-3 mb-4 w-full">
        {Array.from({ length: 27 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl"
          />
        ))}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
        <div className="flex flex-row gap-3 sm:max-w-md w-full">
          <Skeleton className="flex-1 h-11 rounded-xl" />
          <Skeleton className="flex-1 h-11 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function TeamStatusSkeleton() {
  return (
    <div className="dashboard-card p-5 overflow-hidden w-full">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-28 rounded-md" />
        </div>
        <Skeleton className="h-3 w-16 rounded-md" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full shrink-0" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-xl" />
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-[#ADADAD]/25 dark:border-white/10">
        <Skeleton className="h-3 w-28 rounded-md mb-2.5" />
        <div className="space-y-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-lg border border-[#ADADAD]/25 dark:border-white/5 px-2.5 py-2"
            >
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>
              <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="dashboard-page min-h-screen pt-6 md:pt-10 animate-in fade-in duration-300">
      <div className="mx-auto">
        <div className="mb-8">
          <HeaderSkeleton />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <PillSkeleton key={i} />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <StatChipSkeleton key={i} />
            ))}
          </div>
        </div>

        <div
          data-dashboard-board
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10 items-start"
        >
          <WidgetSlot id="overview">
            <OverviewSkeleton />
          </WidgetSlot>
          <WidgetSlot id="taskStats">
            <TaskStatsSkeleton />
          </WidgetSlot>
          <WidgetSlot id="meeting">
            <FeaturedCardSkeleton />
          </WidgetSlot>
          <WidgetSlot id="taskList">
            <ListPanelSkeleton rows={5} />
          </WidgetSlot>
          <WidgetSlot id="meetingStatus">
            <MeetingStatusSkeleton />
          </WidgetSlot>
          <WidgetSlot id="projects">
            <ProjectsSkeleton />
          </WidgetSlot>
          <WidgetSlot id="github">
            <GithubReposSkeleton />
          </WidgetSlot>
          <WidgetSlot id="calendar">
            <CalendarSkeleton />
          </WidgetSlot>
          <WidgetSlot id="team">
            <TeamStatusSkeleton />
          </WidgetSlot>
        </div>
      </div>
    </div>
  );
}
