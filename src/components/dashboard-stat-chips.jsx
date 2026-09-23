import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import LiveStatChips, {
  BarcodeSpark,
  StreakHeatmap,
  MiniProgress,
  MiniLineChart,
  MiniBarChart,
  buildDailySeries,
} from "./live-stat-chips";

export default function DashboardStatChips({
  stats,
  tasks = [],
  meetings = [],
  projects = [],
  className,
}) {
  const navigate = useNavigate();

  const taskSeries = useMemo(
    () => buildDailySeries(tasks, 56, ["updatedAt", "createdAt", "dueDate"]),
    [tasks],
  );
  const meetingSeries = useMemo(
    () =>
      buildDailySeries(meetings, 28, ["startDate", "createdAt", "updatedAt"]),
    [meetings],
  );
  const projectSeries = useMemo(() => {
    const created = buildDailySeries(projects, 28, ["createdAt", "updatedAt"]);
    if (created.some((v) => v > 0)) return created.slice(-7);
    return [
      stats?.activeProjects || 0,
      stats?.completedProjects || 0,
      stats?.totalProjects || 0,
      Math.max(0, (stats?.totalProjects || 0) - (stats?.activeProjects || 0)),
      stats?.averageProgress ? Math.round(stats.averageProgress / 20) : 0,
      stats?.activeProjects || 0,
      stats?.completedProjects || 0,
    ];
  }, [projects, stats]);

  const pending =
    (stats?.pendingTasks || 0) + (stats?.inProgressTasks || 0);
  const completed = stats?.completedTasks || 0;
  const totalTasks = stats?.totalTasks || 0;
  const completionRate =
    stats?.completionRate ||
    (totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0);

  const items = [
    {
      id: "tasks",
      label: "Total Tasks",
      value: totalTasks,
      onClick: () => navigate("/dashboard/tasks"),
      visual: <BarcodeSpark series={taskSeries.slice(-28)} />,
    },
    {
      id: "pending",
      label: "Open Tasks",
      value: pending,
      onClick: () => navigate("/dashboard/tasks"),
      visual: <StreakHeatmap series={taskSeries} />,
    },
    {
      id: "meetings",
      label: "Meetings",
      value: stats?.totalMeetings || 0,
      onClick: () => navigate("/dashboard/meetings"),
      visual: <MiniLineChart series={meetingSeries.slice(-14)} />,
    },
    {
      id: "projects",
      label: "Active Projects",
      value: stats?.activeProjects || 0,
      onClick: () => navigate("/dashboard/projects"),
      visual: <MiniBarChart series={projectSeries} color="#75FC96" />,
    },
    {
      id: "completed",
      label: "Completed Tasks",
      value: completed,
      onClick: () => navigate("/dashboard/tasks"),
      visual: <MiniProgress value={completionRate} />,
    },
    {
      id: "cancelled-meetings",
      label: "Cancelled Meetings",
      value: stats?.cancelledMeetings || 0,
      onClick: () => navigate("/dashboard/meetings"),
      visual: (
        <MiniProgress
          value={
            stats?.totalMeetings
              ? Math.round(
                  ((stats.cancelledMeetings || 0) / stats.totalMeetings) * 100,
                )
              : 0
          }
          fillClassName="bg-rose-300 dark:bg-rose-500"
        />
      ),
    },
  ];

  return (
    <LiveStatChips
      items={items}
      className={className}
      columns={3}
    />
  );
}
