import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSkeleton from "../components/dashboard/dashboard-skeleton";
import { usePermissions } from "../hooks/use-permissions";
import { useAuth } from "../contexts/auth-context";
import UserDetailsModal from "../components/user-details-modal";
import taskService from "../services/task-service";
import { applyTaskToList, taskIdOf } from "../utils/apply-task-event";
import meetingService from "../services/meeting-service";
import projectService from "../services/project-service";
import { toast } from "sonner";
import DashboardStatChips from "../components/dashboard-stat-chips";
import useGithubRepos from "@/hooks/use-github-repos";
import { RiDashboard2Line } from "react-icons/ri";
import CreateTaskModal from "../components/create-task-modal";
import TeamStatus from "../components/dashboard/team-status";
import {
  SortableWidget,
  useDashboardLayout,
  DashboardLayoutReset,
} from "../components/dashboard/dashboard-sortable-grid";
import {
  DashboardQuickPills,
  ProjectOverviewCard,
  TaskStatisticsCard,
  FeaturedMeetingCard,
  TaskListCard,
  MeetingStatusCard,
  ProjectsSpotlightCard,
  GithubReposCard,
  DashboardCalendarCard,
} from "../components/dashboard/dashboard-board-widgets";

const welcomeUsername = (user) => user?.username || "Developer";

const Dashboard = () => {
  document.title = "Dashboard";
  const { user } = useAuth();
  const { permissions } = usePermissions();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    tasksThisWeek: 0,
    tasksThisMonth: 0,
    completionRate: 0,

    totalMeetings: 0,
    scheduledMeetings: 0,
    completedMeetings: 0,
    cancelledMeetings: 0,
    pendingMeetings: 0,
    meetingsThisWeek: 0,
    meetingsThisMonth: 0,
    meetingCompletionRate: 0,

    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    averageProgress: 0,
  });

  const {
    githubData,
    repos: githubReposRaw,
    loading: githubLoading,
    isGithubConnected,
  } = useGithubRepos();
  const [loading, setLoading] = useState(true);
  const hasLoadedOnce = useRef(false);
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [taskRepoModal, setTaskRepoModal] = useState(null);
  const { order, sizes, moveWidget, setWidgetSize, resetLayout } =
    useDashboardLayout();

  const handleCreateTaskFromRepo = (repo) => {
    if (!permissions.canCreateTask) {
      toast.error(
        "You do not have permission to create tasks. Contact an admin.",
      );
      return;
    }
    setTaskRepoModal({
      repoId: String(repo.id),
      repoName: repo.name,
    });
  };

  const startOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const addMonths = (date, months) =>
    new Date(date.getFullYear(), date.getMonth() + months, 1);
  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const getMonthDaysGrid = (monthDate) => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const days = [];

    const leading = (start.getDay() + 6) % 7; // convert to Mon=0 ... Sun=6
    for (let i = 0; i < leading; i++) {
      days.push(null);
    }
    for (let d = 1; d <= end.getDate(); d++) {
      days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), d));
    }
    return days;
  };

  const getEventsForDate = useCallback(
    (date) => {
      if (!date) return { tasks: [], meetings: [], total: 0 };

      const dateStr = date.toDateString();
      const dayTasks = tasks.filter((task) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === dateStr;
      });

      const dayMeetings = meetings.filter((meeting) => {
        if (!meeting.startDate) return false;
        const meetingDate = new Date(meeting.startDate);
        return meetingDate.toDateString() === dateStr;
      });

      return {
        tasks: dayTasks,
        meetings: dayMeetings,
        total: dayTasks.length + dayMeetings.length,
      };
    },
    [tasks, meetings],
  );

  const loadDashboardData = useCallback(async () => {
    try {
      // Only show the full-page skeleton on the first load. Tab focus / visibility
      // refreshes must not flip `loading` or the whole dashboard (incl. Team Status)
      // unmounts and remounts.
      if (!hasLoadedOnce.current) {
        setLoading(true);
      }

      const taskResponse = await taskService.getTasks({
        page: 1,
        limit: 100,
      });

      const allTasks = taskResponse.tasks || [];

      const userTasks = allTasks.filter((task) => {
        if (!user || !user.id) return false;
        return task.assignTo?.id === user.id || task.assignedBy?.id === user.id;
      });

      setTasks(userTasks);

      const meetingResponse = await meetingService.getMeetings({
        page: 1,
        limit: 100,
      });

      const allMeetings = meetingResponse.meetings || [];

      // A related party may be returned either as a populated object ({ id/_id })
      // or as a raw id string, so normalize before comparing.
      const matchesUser = (party, userId) => {
        if (!party || !userId) return false;
        const partyId =
          typeof party === "object" ? party.id || party._id : party;
        return String(partyId) === String(userId);
      };

      const userMeetings = allMeetings.filter((meeting) => {
        if (!user || !user.id) return false;
        return (
          matchesUser(meeting.assignedTo, user.id) ||
          matchesUser(meeting.assignedBy, user.id) ||
          (Array.isArray(meeting.attendees) &&
            meeting.attendees.some((attendee) =>
              matchesUser(attendee, user.id),
            ))
        );
      });

      setMeetings(userMeetings);

      const projectResponse = await projectService.getProjects({
        page: 1,
        limit: 100,
      });

      const allProjects = projectResponse.projects || [];
      setProjects(allProjects);

      const projectStatsResponse = await projectService.getProjectStats();
      const projectStats = projectStatsResponse.stats || {};

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const isOverdue = (task) =>
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== "completed";

      const totalTasks = userTasks.length;
      const completedTasks = userTasks.filter(
        (task) => task.status === "completed",
      ).length;
      // Buckets are mutually exclusive so the status breakdown sums to the
      // total: an overdue task counts only as "overdue", not also as
      // pending/in_progress.
      const pendingTasks = userTasks.filter(
        (task) => task.status === "pending" && !isOverdue(task),
      ).length;
      const inProgressTasks = userTasks.filter(
        (task) => task.status === "in_progress" && !isOverdue(task),
      ).length;
      const overdueTasks = userTasks.filter((task) => isOverdue(task)).length;

      const tasksThisWeek = userTasks.filter(
        (task) => new Date(task.createdAt) >= oneWeekAgo,
      ).length;

      const tasksThisMonth = userTasks.filter(
        (task) => new Date(task.createdAt) >= oneMonthAgo,
      ).length;

      const completionRate =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const totalMeetings = userMeetings.length;
      const scheduledMeetings = userMeetings.filter(
        (meeting) => meeting.status === "scheduled",
      ).length;
      const completedMeetings = userMeetings.filter(
        (meeting) => meeting.status === "completed",
      ).length;
      const cancelledMeetings = userMeetings.filter(
        (meeting) => meeting.status === "cancelled",
      ).length;
      const pendingMeetings = userMeetings.filter(
        (meeting) => meeting.status === "pending",
      ).length;

      const meetingsThisWeek = userMeetings.filter(
        (meeting) => new Date(meeting.createdAt) >= oneWeekAgo,
      ).length;

      const meetingsThisMonth = userMeetings.filter(
        (meeting) => new Date(meeting.createdAt) >= oneMonthAgo,
      ).length;

      const meetingCompletionRate =
        totalMeetings > 0
          ? Math.round((completedMeetings / totalMeetings) * 100)
          : 0;

      const totalProjects = projectStats.totalProjects || 0;
      const activeProjects = projectStats.activeProjects || 0;
      const completedProjects = projectStats.completedProjects || 0;
      const averageProgress = projectStats.averageProgress || 0;

      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        tasksThisWeek,
        tasksThisMonth,
        completionRate,
        totalMeetings,
        scheduledMeetings,
        completedMeetings,
        cancelledMeetings,
        pendingMeetings,
        meetingsThisWeek,
        meetingsThisMonth,
        meetingCompletionRate,
        totalProjects,
        activeProjects,
        completedProjects,
        averageProgress,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      hasLoadedOnce.current = true;
    }
    // Only depends on the user id; status/role changes shouldn't reload the dashboard
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (user && user.id) {
      loadDashboardData();
    }
  }, [user?.id, loadDashboardData]);

  // Re-sync dashboard stats when the user returns to this tab/window, or when a
  // task changes elsewhere (e.g. deleted on the Tasks page), so the stats here
  // stay in sync without requiring a full page reload.
  useEffect(() => {
    if (!user?.id) return;

    const handleVisibilityRefresh = () => {
      if (document.visibilityState === "visible") {
        loadDashboardData();
      }
    };

    const handleDataChanged = (event) => {
      const updated = event?.detail;
      if (!taskIdOf(updated)) {
        loadDashboardData();
        return;
      }
      setTasks((prev) =>
        applyTaskToList(prev, updated, {
          include: (task) =>
            task.assignTo?.id === user.id ||
            task.assignedBy?.id === user.id ||
            task.assignTo?._id === user.id ||
            task.assignedBy?._id === user.id,
        }),
      );
    };

    window.addEventListener("focus", handleVisibilityRefresh);
    document.addEventListener("visibilitychange", handleVisibilityRefresh);
    window.addEventListener("tasks:changed", handleDataChanged);

    return () => {
      window.removeEventListener("focus", handleVisibilityRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityRefresh);
      window.removeEventListener("tasks:changed", handleDataChanged);
    };
  }, [user?.id, loadDashboardData]);

  const getWeeklyData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

      const tasksOnDay = tasks.filter((task) => {
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === date.toDateString();
      }).length;

      const meetingsOnDay = meetings.filter((meeting) => {
        const meetingDate = new Date(meeting.createdAt);
        return meetingDate.toDateString() === date.toDateString();
      }).length;

      const projectsOnDay = projects.filter((project) => {
        const projectDate = new Date(project.createdAt);
        return projectDate.toDateString() === date.toDateString();
      }).length;

      days.push({
        day: dayName,
        Task: tasksOnDay,
        Meeting: meetingsOnDay,
        Project: projectsOnDay,
      });
    }
    return days;
  };

  const weeklyData = getWeeklyData();

  const weeklyMeetingsList = useMemo(() => {
    // Current calendar week (Sunday 00:00 -> Saturday 23:59). We must NOT cap at
    // "now", otherwise meetings scheduled for later today or upcoming days this
    // week (a common case) get wrongly excluded from the count/distribution.
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return meetings.filter((meeting) => {
      const dateValue = meeting.startDate || meeting.createdAt;
      if (!dateValue) return false;
      const date = new Date(dateValue);
      return date >= weekStart && date <= weekEnd;
    });
  }, [meetings]);

  const meetingStatusData = useMemo(
    () => [
      {
        name: "Scheduled",
        value: weeklyMeetingsList.filter((m) => m.status === "scheduled")
          .length,
        color: "#000000",
      },
      {
        name: "Concluded",
        value: weeklyMeetingsList.filter((m) => m.status === "completed")
          .length,
        color: "#75FC96",
      },
      {
        name: "Draft",
        value: weeklyMeetingsList.filter((m) => m.status === "pending").length,
        color: "#ADADAD",
      },
      {
        name: "Cancelled",
        value: weeklyMeetingsList.filter((m) => m.status === "cancelled")
          .length,
        color: "#D13817",
      },
    ],
    [weeklyMeetingsList],
  );

  const meetingStatusOption = useMemo(() => {
    const dayLabels = [];
    const weeklyMeetings = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      dayLabels.push(
        date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
      );

      const count = weeklyMeetingsList.filter((meeting) => {
        const meetingDate = new Date(meeting.startDate || meeting.createdAt);
        return meetingDate.toDateString() === date.toDateString();
      }).length;

      weeklyMeetings.push(count);
    }

    const maxValue = Math.max(...weeklyMeetings, 1);

    return {
      grid: {
        left: "3%",
        right: "3%",
        bottom: "8%",
        top: "8%",
        containLabel: true,
      },

      tooltip: {
        trigger: "item",
        formatter: "{c} meetings",
      },

      xAxis: {
        type: "category",
        data: dayLabels,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          color: "#777",
          fontSize: 12,
        },
      },

      yAxis: {
        type: "value",
        minInterval: 1,
        lineStyle: {
          axisLine: {
            color: "#9CA3AF",
          },
        },
        splitLine: {
          lineStyle: {
            color: "#9CA3AF",
            opacity: 0.3,
            type: "dashed",
          },
        },
      },

      series: [
        {
          type: "bar",
          barWidth: "60%",
          barMaxWidth: 80,

          data: weeklyMeetings.map((value) => ({
            value,
            itemStyle: {
              color: value === maxValue ? "#75FC96" : "#000000",
              borderRadius: 40,
            },
          })),
        },
      ],
    };
  }, [weeklyMeetingsList]);

  const recentTasks = useMemo(() => {
    if (!tasks?.length) return [];
    const sorted = [...tasks].sort((a, b) => {
      const dateA = a.dueDate
        ? new Date(a.dueDate)
        : new Date(a.createdAt || 0);
      const dateB = b.dueDate
        ? new Date(b.dueDate)
        : new Date(b.createdAt || 0);
      return dateA - dateB;
    });
    return sorted.slice(0, 3);
  }, [tasks]);

  const recentMeetings = useMemo(() => {
    if (!meetings?.length) return [];
    const sorted = [...meetings].sort((a, b) => {
      const dateA = a.startDate
        ? new Date(a.startDate)
        : new Date(a.createdAt || 0);
      const dateB = b.startDate
        ? new Date(b.startDate)
        : new Date(b.createdAt || 0);
      return dateA - dateB;
    });
    return sorted.slice(0, 7);
  }, [meetings]);

  const featuredMeeting = useMemo(() => {
    if (!meetings?.length) return null;
    const now = new Date();
    const upcoming = meetings
      .filter((m) => {
        const status = (m.status || "").toLowerCase();
        if (status === "cancelled") return false;
        const end = new Date(m.endDate || m.startDate || 0);
        return !Number.isNaN(end.getTime()) && end >= now;
      })
      .sort(
        (a, b) =>
          new Date(a.startDate || 0).getTime() -
          new Date(b.startDate || 0).getTime(),
      );
    if (upcoming.length) return upcoming[0];
    return recentMeetings[0] || null;
  }, [meetings, recentMeetings]);

  const featuredTask = useMemo(() => {
    if (!tasks?.length) return null;
    const now = new Date();
    const open = tasks.filter((t) => {
      const status = (t.status || "").toLowerCase();
      return status !== "completed" && status !== "cancelled";
    });
    const upcoming = open
      .filter((t) => t.dueDate && !Number.isNaN(new Date(t.dueDate).getTime()))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const dueSoon = upcoming.find((t) => new Date(t.dueDate) >= now);
    if (dueSoon) return dueSoon;
    if (upcoming.length) return upcoming[0];
    if (open.length) {
      return [...open].sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.createdAt || 0),
      )[0];
    }
    return [...tasks].sort(
      (a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    )[0];
  }, [tasks]);

  const featuredProject = useMemo(() => {
    if (!projects?.length) return null;
    return [...projects].sort((a, b) => {
      const aActive = (a.status || "") === "active" ? 0 : 1;
      const bActive = (b.status || "") === "active" ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return (
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0)
      );
    })[0];
  }, [projects]);

  const sampleInProgressTask = useMemo(
    () =>
      tasks.find((t) => (t.status || "").toLowerCase() === "in_progress") ||
      null,
    [tasks],
  );

  const sampleCompletedTask = useMemo(
    () =>
      tasks.find((t) => (t.status || "").toLowerCase() === "completed") || null,
    [tasks],
  );

  const taskSegmentPercents = useMemo(() => {
    const total = Math.max(1, stats.totalTasks || 0);
    const done = stats.completedTasks || 0;
    const inProg = stats.inProgressTasks || 0;
    const other = Math.max(0, total - done - inProg);
    return {
      done: Math.round((done / total) * 100),
      inProgress: Math.round((inProg / total) * 100),
      other: Math.round((other / total) * 100),
      doneCount: done,
      inProgressCount: inProg,
      otherCount: other,
    };
  }, [stats.totalTasks, stats.completedTasks, stats.inProgressTasks]);

  const projectSpotlight = useMemo(() => {
    if (!projects?.length) return [];
    return [...projects]
      .sort((a, b) => {
        const aActive = (a.status || "") === "active" ? 0 : 1;
        const bActive = (b.status || "") === "active" ? 0 : 1;
        return aActive - bActive;
      })
      .slice(0, 5)
      .map((project, index) => {
        const pid = String(project.id || project._id || "");
        const related = (tasks || []).filter((t) => {
          const tp =
            t.projectId?.id ||
            t.projectId?._id ||
            t.projectId ||
            t.project?.id ||
            t.project?._id;
          return tp && String(tp) === pid;
        });
        const open = related.filter(
          (t) => (t.status || "").toLowerCase() !== "completed",
        ).length;
        return {
          id: pid || `p-${index}`,
          name: project.name || project.title || "Untitled project",
          openTasks: open || related.length,
          highlight: index === 0,
        };
      });
  }, [projects, tasks]);

  const githubRepos = useMemo(() => {
    return githubReposRaw ?? [];
  }, [githubReposRaw]);

  const displayedRepos = githubRepos.slice(0, 8);
  const hasMoreRepos = githubRepos.length > 6;

  const inProgressCount = useMemo(
    () =>
      tasks.filter((t) => (t.status || "").toLowerCase() === "in_progress")
        .length,
    [tasks],
  );

  const handleTeamUserClick = useCallback((id) => {
    setSelectedUserId(id);
    setShowUserDetails(true);
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const quickPills = [
    { label: "System Status", value: "All Systems Active", variant: "theme" },
    {
      label: "Tasks This Week",
      value: `${stats.tasksThisWeek} new`,
      variant: "green",
    },
    {
      label: "Completion Rate",
      value: `${stats.completionRate}%`,
      variant: "orange",
    },
    {
      label: "Active Projects",
      value: `${stats.activeProjects} running`,
      variant: "neutral",
    },
  ];

  return (
    <div className="dashboard-page min-h-screen pt-6 md:pt-10">
      <div className="mx-auto">
        <div className="mb-8">
          <div className="dashboard-page-header">
            <div className="dashboard-welcome">
              <div className="dashboard-welcome__icon">
                <RiDashboard2Line size={22} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                  Welcome back, {welcomeUsername(user)}
                </p>
              </div>
            </div>
            <DashboardLayoutReset onReset={resetLayout} />
          </div>

          <DashboardQuickPills quickPills={quickPills} />
        </div>
        <div className="mb-8">
          <DashboardStatChips
            stats={stats}
            tasks={tasks}
            meetings={meetings}
            projects={projects}
          />
        </div>
        <div
          data-dashboard-board
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10 items-start"
        >
          <SortableWidget
            id="overview"
            order={order.indexOf("overview")}
            cols={sizes.overview?.cols}
            height={sizes.overview?.height}
            onMove={moveWidget}
            onSetSize={setWidgetSize}
          >
            <ProjectOverviewCard weeklyData={weeklyData} />
          </SortableWidget>

          <SortableWidget
            id="taskStats"
            order={order.indexOf("taskStats")}
            cols={sizes.taskStats?.cols}
            height={sizes.taskStats?.height}
            onMove={moveWidget}
            onSetSize={setWidgetSize}
          >
            <TaskStatisticsCard
              stats={stats}
              taskSegmentPercents={taskSegmentPercents}
              sampleInProgressTask={sampleInProgressTask}
              sampleCompletedTask={sampleCompletedTask}
            />
          </SortableWidget>

          <SortableWidget
            id="meeting"
            order={order.indexOf("meeting")}
            cols={sizes.meeting?.cols}
            height={sizes.meeting?.height}
            onMove={moveWidget}
            onSetSize={setWidgetSize}
          >
            <FeaturedMeetingCard
              featuredTask={featuredTask}
              featuredMeeting={featuredMeeting}
              featuredProject={featuredProject}
              navigate={navigate}
            />
          </SortableWidget>

          <SortableWidget
            id="taskList"
            order={order.indexOf("taskList")}
            cols={sizes.taskList?.cols}
            height={sizes.taskList?.height}
            onMove={moveWidget}
            onSetSize={setWidgetSize}
          >
            <TaskListCard recentTasks={recentTasks} navigate={navigate} />
          </SortableWidget>

          <SortableWidget
            id="meetingStatus"
            order={order.indexOf("meetingStatus")}
            cols={sizes.meetingStatus?.cols}
            height={sizes.meetingStatus?.height}
            onMove={moveWidget}
            onSetSize={setWidgetSize}
          >
            <MeetingStatusCard
              weeklyMeetingsList={weeklyMeetingsList}
              meetingStatusData={meetingStatusData}
              meetingStatusOption={meetingStatusOption}
            />
          </SortableWidget>

          <SortableWidget
            id="projects"
            order={order.indexOf("projects")}
            cols={sizes.projects?.cols}
            height={sizes.projects?.height}
            onMove={moveWidget}
            onSetSize={setWidgetSize}
          >
            <ProjectsSpotlightCard
              projectSpotlight={projectSpotlight}
              navigate={navigate}
            />
          </SortableWidget>

          <SortableWidget
            id="github"
            order={order.indexOf("github")}
            cols={sizes.github?.cols}
            height={sizes.github?.height}
            onMove={moveWidget}
            onSetSize={setWidgetSize}
          >
            <GithubReposCard
              githubLoading={githubLoading}
              githubData={githubData}
              isGithubConnected={isGithubConnected}
              githubRepos={githubRepos}
              displayedRepos={displayedRepos}
              hasMoreRepos={hasMoreRepos}
              navigate={navigate}
              onCreateTaskFromRepo={handleCreateTaskFromRepo}
            />
          </SortableWidget>

          <SortableWidget
            id="calendar"
            order={order.indexOf("calendar")}
            cols={sizes.calendar?.cols}
            height={sizes.calendar?.height}
            onMove={moveWidget}
            onSetSize={setWidgetSize}
          >
            <DashboardCalendarCard
              calendarMonth={calendarMonth}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              setCalendarMonth={setCalendarMonth}
              addMonths={addMonths}
              isSameDay={isSameDay}
              getMonthDaysGrid={getMonthDaysGrid}
              getEventsForDate={getEventsForDate}
              permissions={permissions}
              navigate={navigate}
            />
          </SortableWidget>

          <SortableWidget
            id="team"
            order={order.indexOf("team")}
            cols={sizes.team?.cols}
            height={sizes.team?.height}
            onMove={moveWidget}
            onSetSize={setWidgetSize}
          >
            <TeamStatus
              currentUser={user}
              inProgressCount={inProgressCount}
              onUserClick={handleTeamUserClick}
            />
          </SortableWidget>
        </div>
      </div>

      <CreateTaskModal
        open={!!taskRepoModal}
        onOpenChange={(open) => !open && setTaskRepoModal(null)}
        repository={taskRepoModal}
        onCreated={loadDashboardData}
      />
      <UserDetailsModal
        userId={selectedUserId}
        isOpen={showUserDetails}
        onClose={() => {
          setShowUserDetails(false);
          setSelectedUserId(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
