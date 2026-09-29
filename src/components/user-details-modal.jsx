import { useState, useEffect } from "react";
import { m } from "framer-motion";
import {
  X,
  Mail,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  User as UserIcon,
  Building,
  MapPin,
  Globe,
  Phone,
  Briefcase,
  Award,
  FileText,
  Heart,
  MessageCircle,
  UserCircle,
  UsersRoundIcon,
  UsersRound,
  CheckSquare,
} from "lucide-react";
import { Button } from "./ui/button";
import UserAvatar from "./user-avatar";
import { userService } from "../services/user-service";
import { applyTaskToUser } from "../utils/apply-task-event";
import { exploreService } from "../services/explore-service";
import { PiUserDuotone, PiUsersDuotone } from "react-icons/pi";

const USER_DETAIL_TABS = [
  { id: "overview", label: "Overview", icon: PiUserDuotone },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "projects", label: "Projects", icon: Briefcase },
];

const formatDate = (dateString) => {
  if (!dateString) return "Not specified";
  return new Date(dateString).toLocaleDateString();
};

const getStatusColor = (status) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 uppercase";
    case "inactive":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
};

const getRoleColor = (role) => {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "moderator":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "user":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
};

const assignedTasksFor = (user) =>
  (user?.tasks || []).filter(
    (task) => !task.role || task.role === "assignee",
  );

const projectCount = (publicProjects) => publicProjects?.length || 0;

const teamCount = (user) => user.teams?.length || 0;

const challengePoints = (user) => {
  if (user.totalChallengePoints !== undefined && user.totalChallengePoints !== null) {
    return user.totalChallengePoints;
  }
  return 0;
};

const emailVerifiedLabel = (verified) => (verified ? "Verified" : "Unverified");

const emailVerifiedClass = (verified) => {
  if (verified) return "font-bold text-green-600 dark:text-green-400";
  return "font-bold text-orange-600 dark:text-orange-400";
};

const tabButtonClass = (isActive) => {
  if (isActive) {
    return "flex items-center gap-2 py-4 px-4 border-b-2 icon  text-sm transition-all duration-200 rounded-t-lg border-b-black dark:border-b-white border-b shadow-sm";
  }
  return "flex items-center gap-2 py-4 px-4 border-b-2 icon  text-sm transition-all duration-200 rounded-t-lg border-transparent text-muted-foreground hover:text-gray-900 dark:hover:text-white cursor-pointer";
};

const taskStatusLabel = (status) => (status || "pending").replace(/_/g, " ");

const resolveLogoUrl = (logo) => {
  if (logo.startsWith("http")) return logo;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  return `${apiUrl}${logo}`;
};

const ownedProjectsFrom = (user) =>
  (user.projects || []).filter((project) => project.role === "creator");

const mapPublicProject = (item) => {
  const project = item.project || item;
  return {
    id: project._id || project.id,
    name: project.title,
    description: project.description,
    logo: project.previewImages?.[0] || null,
    status: project.isActive ? "active" : "inactive",
    role: item.type === "created" ? "creator" : "purchased",
    progress: 0,
    type: item.type,
    isPublic: true,
    price: project.price,
    category: project.category,
  };
};

const buildAllProjects = (user, publicProjects) => [
  ...ownedProjectsFrom(user).map((project) => ({
    ...project,
    type: "owned",
    isPublic: false,
  })),
  ...publicProjects.map(mapPublicProject),
];

const publicTypeBadgeClass = (type) => {
  if (type === "created") return "px-3 py-1 rounded-[15px] text-xs shadow-sm uppercase font-bold bg-blue-600 text-white";
  return "px-3 py-1 rounded-[15px] text-xs shadow-sm uppercase font-bold bg-purple-600 text-white";
};

const publicTypeLabel = (type) => (type === "created" ? "Created" : "Purchased");

const privateStatusBadgeClass = (status) => {
  if (status === "active") {
    return "px-3 py-1 rounded-[15px] text-xs shadow-sm bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300";
  }
  if (status === "completed") {
    return "px-3 py-1 rounded-[15px] text-xs shadow-sm bg-green-600 text-white uppercase font-bold text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
  return "px-3 py-1 rounded-[15px] text-xs shadow-sm bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
};

const InfoRow = ({ icon: Icon, iconClass, label, children }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-[15px]">
    <Icon className={`w-5 h-5 icon icon ${iconClass}`} />
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      {children}
    </div>
  </div>
);

const UserDetailsLoading = () => (
  <div className="flex items-center justify-center h-96">
    <span className="loader w-12 h-12"></span>
  </div>
);

const UserDetailsNotFound = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-muted-foreground">User not found</p>
    </div>
  </div>
);

const UserDetailsHeader = ({ user, onClose }) => (
  <div className="relative p-8  border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-100 dark:bg-gray-800 tex-white dark:text-black">
    <div className="absolute bg-black dark:bg-white"></div>
    <div className="relative flex items-center justify-between">
      <div className="flex items-center justify-center gap-6">
        <div className="relative group flex ">
          <div className="absolute -inset-1 rounded-[15px] opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          <UserAvatar user={user} size="2xl" />
        </div>
        <h2 className="text-3xl  text-black dark:text-white font-bold">
          {user.username}
        </h2>
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  </div>
);

const UserDetailsTabs = ({ activeTab, setActiveTab }) => (
  <div className="border-b icon border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
    <nav className="flex space-x-1 px-6">
      {USER_DETAIL_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={tabButtonClass(activeTab === tab.id)}
        >
          <tab.icon className="w-4 h-4 icon icon icon" />
        </button>
      ))}
    </nav>
  </div>
);

const OverviewContactColumn = ({ user }) => (
  <div className="space-y-6">
    <div className="space-y-4">
      <InfoRow icon={Mail} iconClass="text-blue-500" label="Email">
        <p className="text-gray-900 dark:text-white font-bold">{user.email}</p>
      </InfoRow>

      {user.phone ? (
        <InfoRow icon={Phone} iconClass="text-green-500" label="Phone">
          <p className="text-gray-900 dark:text-white font-medium">
            {user.phone}
          </p>
        </InfoRow>
      ) : null}

      {user.userLocation ? (
        <InfoRow icon={MapPin} iconClass="text-red-500" label="Location">
          <p className="text-gray-900 dark:text-white font-medium">
            {user.userLocation}
          </p>
        </InfoRow>
      ) : null}
    </div>
  </div>
);

const OverviewMetaColumn = ({ user }) => (
  <div className="space-y-6">
    <div className="space-y-4">
      {user.dateOfBirth ? (
        <InfoRow icon={Calendar} iconClass="text-pink-500" label="Date of Birth">
          <p className="text-gray-900 dark:text-white font-medium">
            {formatDate(user.dateOfBirth)}
          </p>
        </InfoRow>
      ) : null}

      {user.emailVerified !== undefined ? (
        <InfoRow icon={Mail} iconClass="text-emerald-500" label="Status">
          <p className={emailVerifiedClass(user.emailVerified)}>
            {emailVerifiedLabel(user.emailVerified)}
          </p>
        </InfoRow>
      ) : null}

      {user.website ? (
        <InfoRow icon={Globe} iconClass="text-indigo-500" label="Website">
          <a
            href={user.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {user.website}
          </a>
        </InfoRow>
      ) : null}
    </div>
  </div>
);

const OverviewStats = ({ user, publicProjects }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-[15px] border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between gap-3 text-blue-600 dark:text-blue-400">
          <div className="p-2 bg-blue-500/10 rounded-[15px]">
            <Briefcase className="w-5 h-5 icon icon" />
          </div>
          <p className="text-3xl  text-blue-700 dark:text-blue-300 font-bold">
            {projectCount(publicProjects)}
          </p>
        </div>
      </div>
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-[15px] border border-purple-200/50 dark:border-purple-700/50 hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between gap-3 text-purple-600 dark:text-purple-400">
          <div className="p-2 bg-purple-500/10 rounded-[15px]">
            <PiUsersDuotone className="w-5 h-5 icon icon" />
          </div>
          <p className="text-3xl  text-purple-700 dark:text-purple-300 font-bold">
            {teamCount(user)}
          </p>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      <h4 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Award className="w-5 h-5 text-yellow-500" />
        Challenge Achievements
      </h4>

      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-[15px] border border-yellow-200/50 dark:border-yellow-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 justify-between w-full">
            <p className="text-xl text-muted-foreground uppercase">
              Total Points
            </p>
            <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300 text-right">
              {challengePoints(user)}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const UserDetailsOverview = ({ user, publicProjects }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <OverviewContactColumn user={user} />
      <OverviewMetaColumn user={user} />
    </div>
    <OverviewStats user={user} publicProjects={publicProjects} />
  </div>
);

const TaskCard = ({ task }) => (
  <div
    key={task.id || task.title}
    className="flex items-start justify-between gap-3 rounded-[15px] border border-gray-200/60 bg-gray-50 p-4 dark:border-gray-700/50 dark:bg-gray-800"
  >
    <div className="min-w-0">
      <p className="font-semibold text-gray-900 dark:text-white">{task.title}</p>
      {task.projectName ? (
        <p className="mt-1 text-xs text-muted-foreground">{task.projectName}</p>
      ) : null}
    </div>
    <div className="flex shrink-0 flex-col items-end gap-1">
      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-600 dark:bg-gray-700 dark:text-gray-200">
        {taskStatusLabel(task.status)}
      </span>
      {task.priority ? (
        <span className="text-[10px] font-medium uppercase text-muted-foreground">
          {task.priority}
        </span>
      ) : null}
    </div>
  </div>
);

const UserDetailsTasks = ({ assignedTasks }) => {
  if (!assignedTasks.length) {
    return (
      <div className="space-y-3">
        <div className="py-10 text-center text-muted-foreground">
          <CheckSquare className="mx-auto mb-2 h-10 w-10 opacity-40" />
          <p>No assigned tasks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assignedTasks.map((task) => (
        <TaskCard key={task.id || task.title} task={task} />
      ))}
    </div>
  );
};

const PublicProjectBadges = ({ project }) => (
  <>
    {project.price ? (
      <span className="px-3 py-1 rounded-[15px] text-xs shadow-sm bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
        ${project.price}
      </span>
    ) : null}
    <span className={publicTypeBadgeClass(project.type)}>
      {publicTypeLabel(project.type)}
    </span>
    {project.category ? (
      <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-[15px] uppercase font-bold">
        {project.category}
      </span>
    ) : null}
  </>
);

const PrivateProjectBadges = ({ project }) => (
  <>
    <span className={privateStatusBadgeClass(project.status)}>
      {project.status}
    </span>
    <span className="px-3 py-1 rounded-[15px] text-xs shadow-sm uppercase font-bold bg-blue-600 text-white">
      {project.role}
    </span>
    {project.progress !== undefined ? (
      <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-[15px] uppercase font-bold">
        {project.progress}%
      </span>
    ) : null}
  </>
);

const ProjectBadges = ({ project }) => {
  if (project.isPublic) {
    return <PublicProjectBadges project={project} />;
  }
  return <PrivateProjectBadges project={project} />;
};

const ProjectCard = ({ project, index }) => (
  <div
    key={project.id || index}
    className="bg-white dark:bg-gray-800 p-5 rounded-[15px] border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-[border-color,box-shadow] duration-200 hover:border-blue-300 dark:hover:border-blue-600"
  >
    <div className="flex items-start gap-4">
      {project.logo ? (
        <div className="relative">
          <img
            src={resolveLogoUrl(project.logo)}
            alt={project.name}
            className="w-12 h-12 rounded-[15px] object-cover border-gray-200 dark:border-gray-700 shadow-sm"
          />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[15px]"></div>
        </div>
      ) : null}
      <div className="flex-1">
        <h4 className="text-gray-900 dark:text-white text-lg mb-2 font-bold">
          {project.name}
        </h4>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {project.description}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <ProjectBadges project={project} />
        </div>
      </div>
    </div>
  </div>
);

const ProjectsGrid = ({ allProjects }) => {
  if (allProjects.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No projects found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {allProjects.map((project, index) => (
        <ProjectCard
          key={project.id || index}
          project={project}
          index={index}
        />
      ))}
    </div>
  );
};

const UserDetailsProjects = ({
  loadingPublicProjects,
  user,
  publicProjects,
}) => {
  if (loadingPublicProjects) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-[15px] h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const allProjects = buildAllProjects(user, publicProjects);

  return (
    <div className="space-y-4">
      <ProjectsGrid allProjects={allProjects} />
    </div>
  );
};

const UserDetailsContent = ({
  activeTab,
  user,
  publicProjects,
  assignedTasks,
  loadingPublicProjects,
}) => {
  if (activeTab === "overview") {
    return (
      <UserDetailsOverview user={user} publicProjects={publicProjects} />
    );
  }
  if (activeTab === "tasks") {
    return <UserDetailsTasks assignedTasks={assignedTasks} />;
  }
  if (activeTab === "projects") {
    return (
      <UserDetailsProjects
        loadingPublicProjects={loadingPublicProjects}
        user={user}
        publicProjects={publicProjects}
      />
    );
  }
  return null;
};

const UserDetailsBody = ({
  user,
  onClose,
  activeTab,
  setActiveTab,
  publicProjects,
  assignedTasks,
  loadingPublicProjects,
}) => (
  <>
    <UserDetailsHeader user={user} onClose={onClose} />
    <UserDetailsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    <div className="p-6 overflow-y-auto h-96">
      <UserDetailsContent
        activeTab={activeTab}
        user={user}
        publicProjects={publicProjects}
        assignedTasks={assignedTasks}
        loadingPublicProjects={loadingPublicProjects}
      />
    </div>
  </>
);

const UserDetailsModalShell = ({
  overlayClassName,
  onClose,
  loading,
  user,
  activeTab,
  setActiveTab,
  publicProjects,
  assignedTasks,
  loadingPublicProjects,
}) => {
  let body = <UserDetailsNotFound />;
  if (loading) body = <UserDetailsLoading />;
  else if (user) {
    body = (
      <UserDetailsBody
        user={user}
        onClose={onClose}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        publicProjects={publicProjects}
        assignedTasks={assignedTasks}
        loadingPublicProjects={loadingPublicProjects}
      />
    );
  }

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black/50 icon flex items-center backdrop-blur-sm justify-center p-4 ${overlayClassName}`}
      onClick={onClose}
    >
      <m.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 max-w-5xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {body}
      </m.div>
    </m.div>
  );
};

const UserDetailsModal = ({
  userId,
  isOpen,
  onClose,
  overlayClassName = "z-50",
  initialTab = "overview",
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [publicProjects, setPublicProjects] = useState([]);
  const [loadingPublicProjects, setLoadingPublicProjects] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      setActiveTab(initialTab);
      loadUserDetails();
    }
  }, [isOpen, userId, initialTab]);

  useEffect(() => {
    if (!isOpen || !userId) return undefined;
    const onTasksChanged = (event) => {
      const detail = event?.detail;
      if (!detail) {
        userService
          .getUserDetails(userId)
          .then((response) => setUser(response.user))
          .catch(() => {});
        return;
      }
      setUser((prev) => applyTaskToUser(prev, detail, userId));
    };
    window.addEventListener("tasks:changed", onTasksChanged);
    return () => window.removeEventListener("tasks:changed", onTasksChanged);
  }, [isOpen, userId]);

  useEffect(() => {
    setPublicProjects([]);
  }, [userId]);

  useEffect(() => {
    if (activeTab === "projects" && userId) {
      loadPublicProjects();
    }
  }, [activeTab, userId]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserDetails(userId);
      setUser(response.user);
    } catch (error) {
      console.error("Failed to load user details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPublicProjects();
    }
  }, [user]);

  const loadPublicProjects = async () => {
    try {
      setLoadingPublicProjects(true);

      const response = await exploreService.getPublicProjects({
        page: 1,
        limit: 100,
        createdBy: userId,
      });
      if (response.projects) {
        const userPublicProjects = response.projects.filter((project) => {
          const projectCreatorId =
            project.createdBy?.id ||
            project.createdBy?._id ||
            project.createdBy;
          const currentUserId = userId?.toString() || userId;
          return projectCreatorId?.toString() === currentUserId?.toString();
        });
        setPublicProjects(
          userPublicProjects.map((project) => ({
            project,
            type: "created",
          })),
        );
      }
    } catch (error) {
      console.error("Failed to load public projects:", error);
      setPublicProjects([]);
    } finally {
      setLoadingPublicProjects(false);
    }
  };

  if (!isOpen) return null;

  const assignedTasks = assignedTasksFor(user);

  return (
    <UserDetailsModalShell
      overlayClassName={overlayClassName}
      onClose={onClose}
      loading={loading}
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      publicProjects={publicProjects}
      assignedTasks={assignedTasks}
      loadingPublicProjects={loadingPublicProjects}
    />
  );
};

export default UserDetailsModal;
