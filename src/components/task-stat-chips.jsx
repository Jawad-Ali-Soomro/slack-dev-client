import LiveStatChips, {
  BarcodeSpark,
  StreakHeatmap,
  MiniProgress,
} from "./live-stat-chips";

/**
 * Top summary chips for Tasks page (live charts).
 */
export default function TaskStatChips({
  total = 0,
  pending = 0,
  ended = 0,
  cancelled = 0,
  completionRate = 0,
  activitySeries = [],
  onSelectTotal,
  onSelectPending,
  onSelectEnded,
  onSelectCancelled,
  className,
}) {
  const endedRate =
    completionRate > 0
      ? completionRate
      : total > 0
        ? Math.round((ended / total) * 100)
        : 0;
  const cancelledRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

  const items = [
    {
      id: "total",
      label: "Total Task",
      value: total,
      onClick: onSelectTotal,
      visual: <BarcodeSpark series={activitySeries.slice(-28)} />,
    },
    {
      id: "pending",
      label: "Pending Task",
      value: pending,
      onClick: onSelectPending,
      visual: <StreakHeatmap series={activitySeries} />,
    },
    {
      id: "ended",
      label: "Ended Task",
      value: ended,
      onClick: onSelectEnded,
      visual: <MiniProgress value={endedRate} />,
    },
    {
      id: "cancelled",
      label: "Cancelled Task",
      value: cancelled,
      onClick: onSelectCancelled,
      visual: (
        <MiniProgress
          value={cancelledRate}
          fillClassName="bg-rose-300 dark:bg-rose-500"
        />
      ),
    },
  ];

  return <LiveStatChips items={items} className={className} columns={4} />;
}
