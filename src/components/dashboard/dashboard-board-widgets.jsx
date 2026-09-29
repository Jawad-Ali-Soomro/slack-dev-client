import { m } from "framer-motion";
import ReactECharts from "echarts-for-react";
import {
  CheckCircle,
  Target,
  Video,
  Calendar as CalendarIcon,
  Github,
  MoreHorizontal,
  ChevronRight,
  FolderGit2,
  Folder,
  Clock,
  CircleDot,
  AlertCircle,
  PlusCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { connectGithub } from "@/hooks/use-github-repos";
import WeeklyBarChart from "./weekly-bar-chart";
import FeaturedCardsSwiper from "./featured-cards-swiper";
import { GithubReposSkeleton } from "./dashboard-skeleton";

const taskSampleTitle = (task, fallback) =>
  task?.title || task?.name || fallback;

const taskProgressWidth = (task, activeWidth) =>
  task ? activeWidth : "0%";

const taskSampleCaption = (task, activeText, emptyText) =>
  task ? activeText : emptyText;

export const ProjectOverviewCard = ({ weeklyData }) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="dashboard-card p-5 w-full"
  >
    <div className="flex items-center justify-between mb-4 gap-3">
      <h4 className="text-base font-bold text-gray-900 dark:text-white">
        Project Overview
      </h4>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/10">
        This Week
      </span>
    </div>
    <WeeklyBarChart data={weeklyData} height={240} compact />
  </m.div>
);

export const TaskStatisticsCard = ({
  stats,
  taskSegmentPercents,
  sampleInProgressTask,
  sampleCompletedTask,
}) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.25 }}
    className="dashboard-card p-5 flex flex-col w-full"
  >
    <div className="flex items-center justify-between mb-4 gap-3">
      <h4 className="text-base font-bold text-gray-900 dark:text-white">
        Task Statistics
      </h4>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/10">
        Monthly
      </span>
    </div>

    <div className="flex items-center gap-2 flex-wrap mb-4">
      <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
        Total Tasks: {stats.totalTasks}
      </p>
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#75FC96]/30 text-emerald-800 dark:text-emerald-200">
        {stats.completionRate}% done
      </span>
    </div>

    <div className="flex items-center gap-3 text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-2">
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-gray-200 dark:bg-white/20" />
        Total
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#75FC96]" />
        Done
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
        In Progress
      </span>
    </div>

    <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10 mb-5">
      <div
        className="h-full bg-[#75FC96] transition-[width] duration-500"
        style={{ width: `${taskSegmentPercents.done}%` }}
      />
      <div
        className="h-full bg-black dark:bg-white transition-[width] duration-500"
        style={{ width: `${taskSegmentPercents.inProgress}%` }}
      />
      <div
        className="h-full bg-[#ADADAD]/50 transition-[width] duration-500"
        style={{ width: `${taskSegmentPercents.other}%` }}
      />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
      <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-[#F8F9FA] dark:bg-white/5 p-3.5">
        <div className="flex items-start gap-2.5 mb-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#75FC96]/25 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
              In Progress
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {taskSampleTitle(sampleInProgressTask, "No active task")}
            </p>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden mb-1.5">
          <div
            className="h-full rounded-full bg-[#75FC96]"
            style={{
              width: taskProgressWidth(sampleInProgressTask, "43%"),
            }}
          />
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          {taskSampleCaption(
            sampleInProgressTask,
            `${stats.inProgressTasks} in progress`,
            "Nothing in progress",
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-[#F8F9FA] dark:bg-white/5 p-3.5">
        <div className="flex items-start gap-2.5 mb-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#75FC96]/25 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
              Completed
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {taskSampleTitle(sampleCompletedTask, "No completed task")}
            </p>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden mb-1.5">
          <div
            className="h-full rounded-full bg-[#75FC96]"
            style={{
              width: taskProgressWidth(sampleCompletedTask, "100%"),
            }}
          />
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          {taskSampleCaption(
            sampleCompletedTask,
            `${stats.completedTasks} completed`,
            "No completions yet",
          )}
        </p>
      </div>
    </div>
  </m.div>
);

export const FeaturedMeetingCard = ({
  featuredTask,
  featuredMeeting,
  featuredProject,
  navigate,
}) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="w-full"
  >
    <FeaturedCardsSwiper
      className="w-full"
      task={featuredTask}
      meeting={featuredMeeting}
      project={featuredProject}
      onOpenTasks={() => navigate("/dashboard/tasks")}
      onOpenMeetings={() => navigate("/dashboard/meetings")}
      onOpenProjects={() => navigate("/dashboard/projects")}
      onJoinMeeting={(link) => window.open(link, "_blank")}
    />
  </m.div>
);

const taskListStatusMeta = (task) => {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "completed";
  const status = (task.status || "").toLowerCase();
  const StatusIcon =
    status === "completed"
      ? CheckCircle
      : status === "in_progress"
        ? CircleDot
        : isOverdue
          ? AlertCircle
          : Clock;
  const statusColor =
    status === "completed"
      ? "text-emerald-500"
      : status === "in_progress"
        ? "text-blue-500"
        : isOverdue
          ? "text-red-500"
          : "text-amber-500";
  const progressPct =
    status === "completed"
      ? 100
      : status === "in_progress"
        ? 55
        : isOverdue
          ? 35
          : 15;
  const iconBg =
    status === "completed"
      ? "bg-emerald-500/10"
      : status === "in_progress"
        ? "bg-blue-500/10"
        : isOverdue
          ? "bg-red-500/10"
          : "bg-amber-500/10";
  const barColor =
    status === "completed"
      ? "bg-[#75FC96]"
      : isOverdue
        ? "bg-[#D13817]"
        : "bg-black dark:bg-white";
  return { StatusIcon, statusColor, progressPct, iconBg, barColor, isOverdue };
};

const TaskListEmpty = () => (
  <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
    <Target className="w-10 h-10 mb-2 opacity-50" />
    <p className="text-sm">No tasks yet</p>
  </div>
);

const TaskListItems = ({ recentTasks, navigate }) => (
  <ul className="space-y-2">
    {recentTasks.map((task) => {
      const { StatusIcon, statusColor, progressPct, iconBg, barColor } =
        taskListStatusMeta(task);
      return (
        <li
          key={task.id || task._id}
          className="flex items-center gap-3 py-2.5 px-3 rounded-lg border border-gray-100 dark:border-white/5 bg-[#F8F9FA] dark:bg-white/5 hover:bg-gray-100/80 dark:hover:bg-white/10 transition-colors cursor-pointer"
          onClick={() => navigate("/dashboard/tasks")}
        >
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}
          >
            <StatusIcon className={`w-4 h-4 ${statusColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {task.title || task.name || "Untitled task"}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              {task.dueDate && (
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="w-3.5 h-3.5 icon" />
                  {new Date(task.dueDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
              <div className="flex-1 max-w-[100px] h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </li>
      );
    })}
  </ul>
);

export const TaskListCard = ({ recentTasks, navigate }) => (
  <m.div
    className="dashboard-card p-5 w-full"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.35 }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="dashboard-section-icon !w-8 !h-8 !rounded-lg">
          <Target className="w-4 h-4" />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Task List
        </h3>
      </div>
      <button
        type="button"
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 dark:hover:text-gray-300 transition-colors"
        aria-label="More options"
        onClick={() => navigate("/dashboard/tasks")}
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>
    </div>
    {recentTasks.length === 0 ? (
      <TaskListEmpty />
    ) : (
      <TaskListItems recentTasks={recentTasks} navigate={navigate} />
    )}
    <Button
      variant="outline"
      size="sm"
      className="w-full mt-4 rounded-lg border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
      onClick={() => navigate("/dashboard/tasks")}
    >
      Show details
    </Button>
  </m.div>
);

const hasMeetingChartData = (meetingStatusData) =>
  meetingStatusData.some((item) => item.value > 0);

export const MeetingStatusCard = ({
  weeklyMeetingsList,
  meetingStatusData,
  meetingStatusOption,
}) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="dashboard-card p-5 w-full"
  >
    <div className="flex items-center justify-between mb-3">
      <div>
        <h4 className="text-base font-bold text-gray-900 dark:text-white">
          Meeting Status
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This week · {weeklyMeetingsList.length} total
        </p>
      </div>
    </div>
    <div style={{ width: "100%", height: "160px" }}>
      {hasMeetingChartData(meetingStatusData) ? (
        <ReactECharts
          option={meetingStatusOption}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "svg" }}
          notMerge={true}
          lazyUpdate={true}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
          No meeting data available
        </div>
      )}
    </div>
    <div className="grid grid-cols-2 gap-2 mt-3">
      {meetingStatusData.map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-[#F8F9FA] dark:bg-white/5"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate">
              {item.name}
            </span>
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  </m.div>
);

const projectRowClass = (highlight) =>
  highlight
    ? "bg-[#75FC96]/25 dark:bg-[#75FC96]/15"
    : "hover:bg-gray-50 dark:hover:bg-white/5";

const projectTasksLabel = (openTasks) =>
  `${openTasks} task${openTasks === 1 ? "" : "s"} due soon`;

export const ProjectsSpotlightCard = ({ projectSpotlight, navigate }) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.45 }}
    className="dashboard-card p-5 w-full"
  >
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-base font-bold text-gray-900 dark:text-white">
        Task Statistics
      </h4>
      <button
        type="button"
        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
        onClick={() => navigate("/dashboard/projects")}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
    {projectSpotlight.length === 0 ? (
      <p className="text-sm text-gray-400 py-6 text-center">No projects yet</p>
    ) : (
      <ul className="space-y-2">
        {projectSpotlight.map((project, index) => (
          <li key={project.id}>
            <button
              type="button"
              onClick={() => navigate("/dashboard/projects")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${projectRowClass(project.highlight)}`}
            >
              <span className="w-7 h-7 rounded-full bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-200">
                {index + 1}
              </span>
              <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                <Folder className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {project.name}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {projectTasksLabel(project.openTasks)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    )}
  </m.div>
);

const githubAvatarSrc = (githubData) => githubData?.profile?.avatar_url;

const githubLoginLabel = (githubData) =>
  githubData?.profile?.login || "GitHub";

const githubEmptyMessage = (isGithubConnected) =>
  isGithubConnected
    ? "No repositories to show."
    : "Connect GitHub to see repos.";

const GithubAvatar = ({ githubData }) => {
  const avatarUrl = githubAvatarSrc(githubData);
  if (avatarUrl) {
    return (
      <img
        className="w-full h-full object-cover"
        src={avatarUrl}
        alt={githubLoginLabel(githubData)}
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Github className="w-4 h-4 text-gray-400" />
    </div>
  );
};

const GithubReposList = ({
  displayedRepos,
  hasMoreRepos,
  githubRepos,
  navigate,
  onCreateTaskFromRepo,
}) => (
  <>
    <ul className="space-y-1.5">
      {displayedRepos.slice(0, 5).map((repo) => (
        <li key={repo.id ?? repo.full_name ?? repo.name}>
          <span
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/dashboard/repos/${repo.id}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate(`/dashboard/repos/${repo.id}`);
              }
            }}
            className="flex items-center gap-2.5 py-2 w-full px-2.5 relative rounded-lg border border-gray-100 dark:border-white/5 bg-[#F8F9FA] dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group cursor-pointer"
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-200/80 dark:bg-white/10 flex items-center justify-center">
              <FolderGit2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            </div>
            <p className="text-xs font-medium text-gray-900 dark:text-white truncate flex-1 group-hover:text-theme">
              {repo.name}
            </p>
            <button
              type="button"
              className="w-4 h-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:text-theme transition-[opacity,color]"
              title={`Create task for ${repo.name}`}
              onClick={(e) => {
                e.stopPropagation();
                onCreateTaskFromRepo(repo);
              }}
            >
              <PlusCircle className="w-3.5 h-3.5" />
            </button>
          </span>
        </li>
      ))}
    </ul>
    {hasMoreRepos && (
      <Button
        variant="outline"
        size="sm"
        className="w-full mt-3 rounded-lg text-xs border-gray-200 dark:border-white/10"
        onClick={() => navigate("/dashboard/repos")}
      >
        View all ({githubRepos.length})
      </Button>
    )}
  </>
);

const GithubEmptyState = ({ isGithubConnected }) => (
  <div className="text-center py-4 px-2">
    <Github className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
      {githubEmptyMessage(isGithubConnected)}
    </p>
    {!isGithubConnected && (
      <Button
        type="button"
        size="sm"
        onClick={connectGithub}
        className="rounded-xl w-[200px] bg-black text-white dark:bg-white dark:text-black"
      >
        Connect Github
      </Button>
    )}
  </div>
);

const shouldShowGithubRepos = (isGithubConnected, githubRepos) =>
  isGithubConnected && githubRepos.length > 0;

const GithubReposBody = ({
  githubData,
  isGithubConnected,
  githubRepos,
  displayedRepos,
  hasMoreRepos,
  navigate,
  onCreateTaskFromRepo,
}) => (
  <m.div
    className="dashboard-card p-5 w-full"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
  >
    <div className="flex gap-2 items-center justify-between mb-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 overflow-hidden border border-gray-200/50 dark:border-white/10">
          <GithubAvatar githubData={githubData} />
        </div>
        <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">
          {githubLoginLabel(githubData)}
        </h2>
      </div>
    </div>
    {shouldShowGithubRepos(isGithubConnected, githubRepos) ? (
      <GithubReposList
        displayedRepos={displayedRepos}
        hasMoreRepos={hasMoreRepos}
        githubRepos={githubRepos}
        navigate={navigate}
        onCreateTaskFromRepo={onCreateTaskFromRepo}
      />
    ) : (
      <GithubEmptyState isGithubConnected={isGithubConnected} />
    )}
  </m.div>
);

export const GithubReposCard = ({
  githubLoading,
  githubData,
  isGithubConnected,
  githubRepos,
  displayedRepos,
  hasMoreRepos,
  navigate,
  onCreateTaskFromRepo,
}) => {
  if (githubLoading) {
    return <GithubReposSkeleton />;
  }
  return (
    <GithubReposBody
      githubData={githubData}
      isGithubConnected={isGithubConnected}
      githubRepos={githubRepos}
      displayedRepos={displayedRepos}
      hasMoreRepos={hasMoreRepos}
      navigate={navigate}
      onCreateTaskFromRepo={onCreateTaskFromRepo}
    />
  );
};

const calendarDayClasses = ({
  d,
  isPast,
  isToday,
  isSelected,
  hasEvents,
}) =>
  [
    "relative h-10 w-10 sm:h-12 sm:w-12 rounded-xl border flex flex-col items-center justify-center text-sm transition-all duration-200 group",
    !d
      ? "border-transparent cursor-default"
      : isPast
        ? "border-[#ADADAD]/30 dark:border-gray-700 opacity-40 cursor-not-allowed"
        : "border-[#ADADAD]/35 dark:border-gray-700 hover:border-black dark:hover:border-[#75FC96] hover:shadow-md cursor-pointer",
    isToday ? "ring-2 ring-[#75FC96] ring-offset-1" : "",
    isSelected
      ? "bg-black border-none text-white font-bold"
      : "text-black dark:text-gray-200",
    hasEvents && !isSelected ? "bg-gray-100 dark:bg-gray-800/50" : "",
  ].join(" ");

const meetingDotClass = (isSelected) =>
  `w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-black"} dark:bg-white`;

export const DashboardCalendarCard = ({
  calendarMonth,
  selectedDate,
  setSelectedDate,
  setCalendarMonth,
  addMonths,
  isSameDay,
  getMonthDaysGrid,
  getEventsForDate,
  permissions,
  navigate,
}) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="dashboard-card p-5 w-full"
  >
    <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
      <div className="dashboard-section-title">
        <div className="dashboard-section-icon">
          <CalendarIcon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
          Calendar
        </h3>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            const today = new Date();
            setSelectedDate(today);
            setCalendarMonth(today);
          }}
          className="px-3 py-1.5 text-xs font-medium rounded-[15px] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => setCalendarMonth(addMonths(calendarMonth, -1))}
          className="p-2 rounded-[15px] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Previous month"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 min-w-[140px] text-center">
          {calendarMonth.toLocaleString("default", {
            month: "long",
          })}{" "}
          {calendarMonth.getFullYear()}
        </div>
        <button
          onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
          className="p-2 rounded-[15px] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Next month"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>

    <div className="grid grid-cols-9 gap-2 sm:gap-3 mb-4 w-full">
      {getMonthDaysGrid(calendarMonth).map((d, idx) => {
        const isToday = d && isSameDay(d, new Date());
        const isSelected = d && isSameDay(d, selectedDate);
        const isPast =
          d && !isToday && d < new Date(new Date().setHours(0, 0, 0, 0));
        const events = d
          ? getEventsForDate(d)
          : { tasks: [], meetings: [], total: 0 };
        const hasEvents = events.total > 0;

        return (
          <button
            key={idx}
            onClick={() => d && !isPast && setSelectedDate(d)}
            className={calendarDayClasses({
              d,
              isPast,
              isToday,
              isSelected,
              hasEvents,
            })}
            disabled={!d || isPast}
            aria-label={d ? d.toDateString() : "empty"}
          >
            {d && (
              <>
                <span>{d.getDate()}</span>
                {hasEvents && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {events.tasks.length > 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#75FC96]"></div>
                    )}
                    {events.meetings.length > 0 && (
                      <div className={meetingDotClass(isSelected)}></div>
                    )}
                  </div>
                )}
                {events.total > 2 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#75FC96] text-black text-[10px] font-bold flex items-center justify-center">
                    {events.total}
                  </span>
                )}
              </>
            )}
          </button>
        );
      })}
    </div>

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
      <div className="flex flex-row gap-3 sm:max-w-md w-full">
        <Button
          variant={"default"}
          onClick={() => {
            if (!permissions.canCreateTask) {
              toastScheduleTaskDenied();
              return;
            }
            navigate("/dashboard/tasks", {
              state: {
                date: selectedDate.toLocaleDateString("en-CA", {
                  timeZone: "Asia/Karachi",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }),
                openModal: true,
              },
            });
          }}
          disabled={!permissions.canCreateTask}
          className="flex-1 h-11 font-semibold w-[100px] rounded-xl text-sm bg-gradient-to-r from-[#75FC96] to-[#4fd972] text-black transition-[opacity,box-shadow] shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Target className="w-4 h-4" />
          Schedule Task
        </Button>
        <Button
          variant={"outline"}
          onClick={() => {
            if (!permissions.canCreateMeeting) {
              toastScheduleMeetingDenied();
              return;
            }
            navigate("/dashboard/meetings", {
              state: {
                date: selectedDate.toLocaleDateString("en-CA", {
                  timeZone: "Asia/Karachi",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }),
                openModal: true,
              },
            });
          }}
          disabled={!permissions.canCreateMeeting}
          className="flex-1 h-11 rounded-xl text-sm border border-gray-300 dark:border-gray-700 font-semibold text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-[background-color,color,opacity] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Video className="w-4 h-4" />
          Schedule Meeting
        </Button>
      </div>
    </div>
  </m.div>
);

const toastScheduleTaskDenied = () =>
  toast.error(
    "You do not have permission to create tasks. Contact an admin.",
  );

const toastScheduleMeetingDenied = () =>
  toast.error(
    "You do not have permission to create meetings. Contact an admin.",
  );

const pillDotColor = (variant) => {
  if (variant === "green") return "#10b981";
  if (variant === "orange") return "var(--theme-accent)";
  if (variant === "theme") return "var(--theme-accent)";
  return "#6b7280";
};

const pillThemeClass = (variant) =>
  variant === "theme" ? "dashboard-pill--theme" : "";

export const DashboardQuickPills = ({ quickPills }) => (
  <m.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="grid grid-cols-2 md:grid-cols-4 gap-3"
  >
    {quickPills.map((pill) => (
      <div
        key={pill.label}
        className={`dashboard-pill ${pillThemeClass(pill.variant)}`}
      >
        <div
          className="dashboard-pill__dot"
          style={{ background: pillDotColor(pill.variant) }}
        />
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {pill.label}
          </p>
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {pill.value}
          </p>
        </div>
      </div>
    ))}
  </m.div>
);
