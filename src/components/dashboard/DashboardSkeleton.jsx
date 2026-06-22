import { Skeleton } from "@/components/ui/skeleton"

function StatCardSkeleton({ accent = false }) {
  return (
    <div className={`dashboard-card p-6 ${accent ? "dashboard-card--accent" : ""}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton className="h-3 w-32 rounded-md" />
        </div>
        <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
      </div>
      <Skeleton className="h-12 w-20 rounded-lg" />
    </div>
  )
}

function ChartPanelSkeleton({ tall = false }) {
  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-3 w-36 rounded-md" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-7 w-10 rounded-md ml-auto" />
          <Skeleton className="h-3 w-16 rounded-md ml-auto" />
        </div>
      </div>
      <Skeleton className={`w-full rounded-xl ${tall ? "h-[300px]" : "h-[220px]"}`} />
      <div className="grid grid-cols-2 gap-3 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}

function ListPanelSkeleton({ rows = 5 }) {
  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-28 rounded-md" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-black/5 dark:border-white/5">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-1/3 rounded-md" />
            </div>
            <Skeleton className="h-4 w-4 rounded shrink-0" />
          </div>
        ))}
      </div>
      <Skeleton className="h-9 w-full rounded-lg mt-4" />
    </div>
  )
}

function CalendarSkeleton() {
  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-14 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-xl" />
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-6 w-full rounded-md" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={`d-${i}`} className="h-12 w-full rounded-xl" />
        ))}
      </div>
      <div className="flex gap-3 mt-4">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 flex-1 rounded-xl" />
      </div>
    </div>
  )
}

export function GithubReposSkeleton() {
  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100 dark:border-white/10">
        <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
        <Skeleton className="h-5 w-5 rounded-md shrink-0" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-2.5 px-3 rounded-lg border border-gray-100 dark:border-white/5"
          >
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <Skeleton className="h-3.5 w-2/3 rounded-md" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-9 w-full rounded-lg mt-4" />
    </div>
  )
}

export default function DashboardSkeleton() {
  return (
    <div className="dashboard-page min-h-screen pt-10 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 mb-8">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-40 rounded-md" />
          <Skeleton className="h-3 w-56 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCardSkeleton accent />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="w-full lg:w-[60%] space-y-5">
          <div className="dashboard-card p-6 hidden md:block">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-3 w-48 rounded-md" />
              </div>
              <div className="flex gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-3 w-16 rounded-md" />
                ))}
              </div>
            </div>
            <Skeleton className="w-full h-[400px] rounded-xl" />
          </div>
          <ChartPanelSkeleton />
          <ChartPanelSkeleton />
          <CalendarSkeleton />
        </div>

        <div className="w-full lg:w-[40%] space-y-5 pb-20">
          <GithubReposSkeleton />
          <ListPanelSkeleton rows={5} />
          <ListPanelSkeleton rows={5} />
        </div>
      </div>
    </div>
  )
}
