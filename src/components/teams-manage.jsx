import { useState, useEffect, useCallback } from "react";
import { m } from "framer-motion";
import { BsPlusCircleFill } from "react-icons/bs";
import { usePermissions } from "../hooks/use-permissions";
import {
  Search,
  MoreVertical,
  Eye,
  Trash2,
  X,
  Calendar,
  Target,
  Settings,
  ChevronDown,
  Trash,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Crown,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";
import teamService from "../services/team-service";
import invitationService from "../services/invitation-service";
import friendService from "../services/friend-service";
import UserAvatar, { AvatarGroup } from "./user-avatar";
import { useAuth } from "../contexts/auth-context";
import {
  PiUserPlusDuotone,
  PiUsersDuotone,
} from "react-icons/pi";
import { Skeleton } from "./ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const JOB_ROLES = [
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "qa", label: "QA" },
  { key: "devops", label: "DevOps" },
  { key: "fullstack", label: "Full Stack" },
  { key: "designer", label: "Designer" },
];

const jobRoleLabel = (key) =>
  JOB_ROLES.find((r) => r.key === key)?.label || "Unassigned";

const getRoleColor = (role) => {
  switch (role) {
    case "owner":
      return "bg-yellow-500 text-white dark:bg-yellow-600";
    case "admin":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    default:
      return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

const getStatusColor = (isActive) =>
  isActive
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";

const getInviteStatusColor = (status) => {
  switch (status) {
    case "accepted":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "cancelled":
      return "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
    default:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  }
};

const isTeamOwner = (team, user) =>
  team.createdBy?.id === user?.id || team.createdBy?._id === user?.id;

const isTeamAdmin = (team, user) => {
  if (!team || !user) return false;
  if (isTeamOwner(team, user)) return true;
  return (team.members || []).some((member) => {
    const memberId = member.user?.id || member.user?._id;
    return (
      String(memberId) === String(user.id) &&
      (member.role === "admin" || member.role === "owner")
    );
  });
};

const inviteJobRoleSuffix = (jobRole) =>
  jobRole && jobRole !== "unassigned"
    ? ` as ${jobRoleLabel(jobRole)}`
    : "";

const inviteDetailSuffix = (invite) =>
  invite.jobRole && invite.jobRole !== "unassigned"
    ? ` · ${jobRoleLabel(invite.jobRole)}`
    : "";

const emptyWorkspacesHint = (searchTerm) =>
  searchTerm
    ? "Try adjusting your search terms"
    : "Get started by creating your first workspace";

const inviteIdOf = (invite) => invite._id || invite.id;

const memberKey = (member, index, refreshKey) =>
  `${member.user?.id || member.user?._id}-${index}-${refreshKey}`;

const projectStatusClass = (status) => {
  if (status === "active")
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (status === "completed")
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  if (status === "on_hold")
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
};

const projectPriorityClass = (priority) => {
  if (priority === "urgent")
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  if (priority === "high")
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  if (priority === "medium")
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
};

const settingBadgeClass = (enabled) =>
  enabled
    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400";

const projectsChevronClass = (showProjects) =>
  `w-5 h-5 icon text-gray-500 transition-transform duration-200 ${
    showProjects ? "rotate-180" : ""
  }`;

const TeamsManageToolbar = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  canCreateTeam,
  onOpenNewTeam,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <div className="relative ">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 icon icon" />
          <Input
            placeholder="Search workspaces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 w-full md:w-[500px] h-13 bg-white dark:bg-[black] text-black dark:text-white border border-gray-200 dark:border-gray-700"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="md:w-[180px] w-full sm:w-[180px] px-5 text-gray-600 dark:text-white cursor-pointer bg-white dark:bg-[black] h-13">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className={"h-10 px-5 cursor-pointer"} value="all">
                All Workspaces
              </SelectItem>
              <SelectItem className={"h-10 px-5 cursor-pointer"} value="active">
                Active
              </SelectItem>
              <SelectItem
                className={"h-10 px-5 cursor-pointer"}
                value="inactive"
              >
                Inactive
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-3">
      {canCreateTeam && (
        <Button
          onClick={onOpenNewTeam}
          className={"md:w-[200px] w-full rounded-[15px] h-12 font-bold"}
        >
          <PiUserPlusDuotone />
          New Workspace
        </Button>
      )}
    </div>
  </div>
);

const TeamsIncomingInvites = ({
  incomingInvites,
  onRespond,
}) => {
  if (incomingInvites.length === 0) return null;
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {incomingInvites.map((invite) => {
        const inviteId = inviteIdOf(invite);
        return (
          <div
            key={inviteId}
            className="rounded-[15px] border border-[#FF914B]/30 bg-[#FF914B]/5 p-5 dark:bg-[#FF914B]/10"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF914B]">
              Workspace invitation
            </p>
            <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
              {invite.targetName || "Workspace"}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {invite.inviter?.username || "A member"} invited you
              {inviteJobRoleSuffix(invite.jobRole)}.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                className="h-10 flex-1 rounded-[12px] font-bold"
                onClick={() => onRespond(inviteId, "accept")}
              >
                Accept
              </Button>
              <Button
                variant="outline"
                className="h-10 flex-1 rounded-[12px] font-bold"
                onClick={() => onRespond(inviteId, "reject")}
              >
                Decline
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TeamsLoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div
        key={i}
        className="bg-white dark:bg-[rgba(255,255,255,.1)] rounded-[15px] border dark:border-none p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-[160px] rounded-md" />
            <Skeleton className="h-4 w-full max-w-[220px] rounded-md" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-8 w-[80px] rounded-[15px]" />
        </div>
        <div className="mb-4">
          <div className="flex -space-x-1">
            <Skeleton className="h-10 w-10 rounded-[15px]" />
            <Skeleton className="h-10 w-10 rounded-[15px]" />
            <Skeleton className="h-10 w-10 rounded-[15px]" />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
          <Skeleton className="h-4 w-[100px] rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

const TeamsEmptyState = ({
  searchTerm,
  canCreateTeam,
  onOpenNewTeam,
}) => (
  <div className="text-center py-12">
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No workspaces found
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-4">
      {emptyWorkspacesHint(searchTerm)}
    </p>
    {!searchTerm && (
      <Button
        onClick={onOpenNewTeam}
        disabled={!canCreateTeam}
        className={"md:w-[200px] w-full"}
      >
        <BsPlusCircleFill className="w-4 h-4 icon mr-2" />
        Create Workspace
      </Button>
    )}
  </div>
);

const TeamCardMenu = ({
  team,
  user,
  onViewDetails,
  onEditMembers,
  onDelete,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" className="p-2 w-12">
        <MoreVertical className="w-4 h-4 icon icon icon" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem
        className={"h-11 px-5 pr-8 cursor-pointer"}
        onClick={onViewDetails}
      >
        <Eye className="w-4 h-4 icon icon mr-2 icon" />
        View Details
      </DropdownMenuItem>
      {isTeamAdmin(team, user) && (
        <>
          <DropdownMenuItem
            className={"h-11 px-5 pr-8 cursor-pointer"}
            onClick={onEditMembers}
          >
            <Settings className="w-4 h-4 icon icon mr-2 icon" />
            Edit Members
          </DropdownMenuItem>
          {isTeamOwner(team, user) && (
            <DropdownMenuItem
              className={"h-11 px-5 pr-8 cursor-pointer"}
              onClick={() => onDelete(team.id)}
            >
              <Trash2 className="w-4 h-4 text-red-600 icon icon mr-2" />
              <span className="text-red-600 hover:text-red-600">Delete</span>
            </DropdownMenuItem>
          )}
        </>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

const TeamCard = ({
  team,
  user,
  itemVariants,
  onViewDetails,
  onEditMembers,
  onDelete,
}) => (
  <m.div
    variants={itemVariants}
    className="bg-white dark:bg-[rgba(255,255,255,.1)] rounded-[15px] border dark:border-none p-6  transition-shadow duration-300"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-lg  text-gray-900 dark:text-white line-clamp-1 font-bold">
          {team.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
          {team.description || "No description provided"}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewDetails}
          className="p-2 text-gray-400 w-12 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <Eye className="w-4 h-4 icon icon icon" />
        </Button>
        <TeamCardMenu
          team={team}
          user={user}
          onViewDetails={onViewDetails}
          onEditMembers={onEditMembers}
          onDelete={onDelete}
        />
      </div>
    </div>

    <div className="flex gap-2 mb-4">
      <span
        className={`inline-flex items-center rounded-[10px] px-2.5 py-1 text-[10px] font-semibold uppercase ${getStatusColor(team.isActive)}`}
      >
        {team.isActive ? "Active" : "Inactive"}
      </span>
    </div>

    <div className="mb-4">
      <AvatarGroup
        users={team.members}
        max={3}
        size="lg"
        emptyLabel="No members yet"
      />
    </div>

    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
      <div className="flex items-center gap-2 font-bold">
        <FolderOpen className="w-4 h-4 icon icon" />
        {team.projects?.length || 0} Projects
      </div>
    </div>
  </m.div>
);

const TeamsGrid = ({
  filteredTeams,
  containerVariants,
  itemVariants,
  user,
  onSelectTeamDetails,
  onSelectTeamMembers,
  onDeleteTeam,
}) => (
  <m.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
  >
    {filteredTeams.map((team) => (
      <TeamCard
        key={team.id}
        team={team}
        user={user}
        itemVariants={itemVariants}
        onViewDetails={() => onSelectTeamDetails(team)}
        onEditMembers={() => onSelectTeamMembers(team)}
        onDelete={onDeleteTeam}
      />
    ))}
  </m.div>
);

const TeamsListBody = ({
  loading,
  filteredTeams,
  searchTerm,
  canCreateTeam,
  onOpenNewTeam,
  containerVariants,
  itemVariants,
  user,
  onSelectTeamDetails,
  onSelectTeamMembers,
  onDeleteTeam,
}) => {
  if (loading) return <TeamsLoadingSkeleton />;
  if (filteredTeams.length === 0) {
    return (
      <TeamsEmptyState
        searchTerm={searchTerm}
        canCreateTeam={canCreateTeam}
        onOpenNewTeam={onOpenNewTeam}
      />
    );
  }
  return (
    <TeamsGrid
      filteredTeams={filteredTeams}
      containerVariants={containerVariants}
      itemVariants={itemVariants}
      user={user}
      onSelectTeamDetails={onSelectTeamDetails}
      onSelectTeamMembers={onSelectTeamMembers}
      onDeleteTeam={onDeleteTeam}
    />
  );
};

const TeamsPagination = ({ pagination, setPagination }) => {
  if (!pagination || pagination.pages <= 1) return null;

  return (
    <div className="flex items-center absolute right-5 -bottom-0 justify-end w-full col-span-3 gap-2 mt-8 mb-10">
      <Button
        className="w-10 h-10 bg-white hover:bg-white text-black"
        onClick={() =>
          setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
        }
        disabled={pagination.page === 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: pagination.pages }, (_, i) => i + 1)
          .filter((page) => {
            if (pagination.pages <= 9) return true;
            return (
              page === 1 ||
              page === pagination.pages ||
              Math.abs(page - pagination.page) <= 1
            );
          })
          .map((page, index, arr) => {
            const prevPage = arr[index - 1];
            return (
              <div key={page} className="flex items-center gap-1">
                {prevPage && page - prevPage > 1 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
                <Button
                  size="sm"
                  className={`w-10 h-10 font-bold bg-[#ff914b] hover:bg-[#ff914b] ${pagination.page === page ? "bg-[#ff914b] dark:text-white hover:bg-[#ff914b]" : "bg-white text-black hover:bg-gray-100"}`}
                  onClick={() => setPagination((prev) => ({ ...prev, page }))}
                >
                  {page < 10 ? `0${page}` : page}
                </Button>
              </div>
            );
          })}
      </div>

      <Button
        className="w-10 h-10 bg-white hover:bg-white text-black"
        onClick={() =>
          setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
        }
        disabled={pagination.page === pagination.pages}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

const NewTeamModal = ({
  newTeam,
  setNewTeam,
  loading,
  onClose,
  onSubmit,
}) => (
  <m.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 icon  backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50"
    onClick={onClose}
  >
    <m.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 max-w-md w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Input
              value={newTeam.name}
              onChange={(e) =>
                setNewTeam({ ...newTeam, name: e.target.value })
              }
              placeholder="Enter workspace name"
              required
              className="w-full"
            />
          </div>

          <div>
            <Textarea
              value={newTeam.description}
              onChange={(e) =>
                setNewTeam({ ...newTeam, description: e.target.value })
              }
              placeholder="Enter workspace description"
              rows={3}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-muted-foreground">
              Workspace Settings
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={newTeam.settings.allowMemberInvites}
                  onCheckedChange={(checked) =>
                    setNewTeam({
                      ...newTeam,
                      settings: {
                        ...newTeam.settings,
                        allowMemberInvites: checked,
                      },
                    })
                  }
                  className={"rounded-[8px]"}
                />
                <span className="text-sm text-muted-foreground">
                  Allow Member Invites
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={newTeam.settings.allowProjectCreation}
                  onCheckedChange={(checked) =>
                    setNewTeam({
                      ...newTeam,
                      settings: {
                        ...newTeam.settings,
                        allowProjectCreation: checked,
                      },
                    })
                  }
                  className={"rounded-[8px]"}
                />
                <span className="text-sm text-muted-foreground">
                  Allow Project Creation
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="loader w-5 h-5 icon"></span>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </div>
        </form>
      </div>
    </m.div>
  </m.div>
);

const roleBadgeClass = (role) =>
  `inline-flex h-7 min-w-[68px] items-center justify-center rounded-[10px] px-2 text-[10px] font-semibold uppercase tracking-wide ${getRoleColor(role)}`;

const TeamMembersList = ({ members, refreshKey }) => {
  const ordered = [...(members || [])].sort((a, b) => {
    const rank = (role) => (role === "owner" || role === "admin" ? 0 : 1);
    return rank(a.role) - rank(b.role);
  });

  return (
    <div key={refreshKey} className="flex items-end pt-3">
      {ordered.map((member, index) => {
        const lead = member.role === "owner" || member.role === "admin";
        return (
          <div
            key={memberKey(member, index, refreshKey)}
            className="relative"
            style={{
              marginLeft: index === 0 ? 0 : -12,
              zIndex: lead ? ordered.length + 2 : index + 1,
            }}
          >
            {lead && (
              <Crown className="pointer-events-none absolute -top-3.5 left-1/2 z-20 h-4 w-4 -translate-x-1/2 fill-[#FF914B] text-[#FF914B]" />
            )}
            <UserAvatar
              user={member}
              size="xl"
              className="rounded-[10px] ring-2 ring-white dark:ring-zinc-900"
            />
          </div>
        );
      })}
    </div>
  );
};

const TeamInvitationsList = ({ teamInvites, onCancelInvite }) => {
  if (teamInvites.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No invitations sent yet
      </p>
    );
  }
  return teamInvites.map((invite) => {
    const inviteId = inviteIdOf(invite);
    return (
      <div
        key={inviteId}
        className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-black rounded-[15px]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar user={invite.invitee} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {invite.invitee?.username || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {invite.invitee?.email} · {invite.role}
              {inviteDetailSuffix(invite)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`rounded-[10px] px-2.5 py-1 text-[10px] font-semibold uppercase ${getInviteStatusColor(invite.status)}`}
          >
            {invite.status}
          </span>
          {invite.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onCancelInvite(inviteId)}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  });
};

const TeamDetailsMembersPanel = ({
  selectedTeam,
  user,
  teamInvites,
  refreshKey,
  onCancelInvite,
}) => {
  if (isTeamOwner(selectedTeam, user)) {
    return (
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="mb-4 h-10 bg-gray-100 dark:bg-white/5">
          <TabsTrigger value="members" className="px-7">
            Members ({selectedTeam.members?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="px-7">
            Invitations ({teamInvites.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="members">
          <TeamMembersList
            members={selectedTeam.members}
            refreshKey={refreshKey}
          />
        </TabsContent>
        <TabsContent value="invitations">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <TeamInvitationsList
              teamInvites={teamInvites}
              onCancelInvite={onCancelInvite}
            />
          </div>
        </TabsContent>
      </Tabs>
    );
  }
  return (
    <>
      <h3 className="text-lg text-gray-900 dark:text-white mb-4">
        Members ({selectedTeam.members?.length || 0})
      </h3>
      <TeamMembersList
        members={selectedTeam.members}
        refreshKey={refreshKey}
      />
    </>
  );
};

const TeamProjectCard = ({ project, index }) => (
  <m.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="p-4 bg-gray-50 dark:bg-black rounded-[15px] border"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
          {project.name}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
          {project.description || "No description"}
        </p>
      </div>
    </div>

    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <span
          className={`rounded-[10px] px-2 py-1 text-[10px] font-semibold uppercase ${projectStatusClass(project.status)}`}
        >
          {project.status || "planning"}
        </span>
        <span
          className={`rounded-[10px] px-2 py-1 text-[10px] font-semibold uppercase ${projectPriorityClass(project.priority)}`}
        >
          {project.priority || "low"}
        </span>
      </div>
      {project.progress !== undefined && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {project.progress}%
        </div>
      )}
    </div>

    {project.startDate && (
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <Calendar className="w-3 h-3 icon inline mr-1" />
        Started {new Date(project.startDate).toLocaleDateString()}
      </div>
    )}
  </m.div>
);

const TeamDetailsProjects = ({
  selectedTeam,
  showProjects,
  setShowProjects,
}) => (
  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 ma">
    <button
      onClick={() => setShowProjects(!showProjects)}
      className="flex items-center justify-between w-full text-left mb-4 hover:bg-gray-50 dark:hover:bg-gray-800 p-4 border cursor-pointer rounded-[15px] transition-colors"
    >
      <h3 className="text-lg  text-gray-900 dark:text-white">
        Projects ({selectedTeam.projects?.length || 0})
      </h3>
      <ChevronDown className={projectsChevronClass(showProjects)} />
    </button>

    {showProjects && (
      <m.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden max-h-[300px] overflow-y-auto"
      >
        {selectedTeam.projects?.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No projects in this workspace yet</p>
            <p className="text-sm">Projects will appear here when created</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
            {selectedTeam.projects?.map((project, index) => (
              <TeamProjectCard
                key={index}
                project={project}
                index={index}
              />
            ))}
          </div>
        )}
      </m.div>
    )}
  </div>
);

const TeamDetailsModal = ({
  selectedTeam,
  user,
  teamInvites,
  refreshKey,
  showProjects,
  setShowProjects,
  onClose,
  onCancelInvite,
}) => (
  <m.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 icon  backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50"
    onClick={onClose}
  >
    <m.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedTeam.name}
              </h2>
              <span
                className={`inline-flex items-center rounded-[10px] px-2.5 py-1 text-[10px] font-semibold uppercase ${getStatusColor(selectedTeam.isActive)}`}
              >
                {selectedTeam.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Created by {selectedTeam.createdBy?.username} •{" "}
              {new Date(selectedTeam.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-[10px] p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {selectedTeam.description || "No description provided"}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center rounded-[10px] px-2.5 py-1 text-[10px] font-semibold uppercase ${settingBadgeClass(selectedTeam.settings?.allowMemberInvites)}`}
          >
            Member invites
          </span>
          <span
            className={`inline-flex items-center rounded-[10px] px-2.5 py-1 text-[10px] font-semibold uppercase ${settingBadgeClass(selectedTeam.settings?.allowProjectCreation)}`}
          >
            Project creation
          </span>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-5 dark:border-white/10">
          <TeamDetailsMembersPanel
            selectedTeam={selectedTeam}
            user={user}
            teamInvites={teamInvites}
            refreshKey={refreshKey}
            onCancelInvite={onCancelInvite}
          />
        </div>

        <TeamDetailsProjects
          selectedTeam={selectedTeam}
          showProjects={showProjects}
          setShowProjects={setShowProjects}
        />
      </div>
    </m.div>
  </m.div>
);

const MembersManageModal = ({
  selectedTeam,
  refreshKey,
  memberSearch,
  showMemberSuggestions,
  memberSuggestions,
  newMember,
  setNewMember,
  onClose,
  onMemberSearch,
  onAddMember,
  onUpdateJobRole,
  onRemoveMember,
}) => (
  <m.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm  bg-opacity-50 flex items-center justify-center p-4 z-50"
    onClick={onClose}
  >
    <m.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Edit members
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedTeam.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-[10px] p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1 member-search-container">
                <Input
                  value={memberSearch}
                  onChange={(e) => onMemberSearch(e.target.value)}
                  placeholder="Search friends..."
                  className="h-11 w-full rounded-[10px]"
                />
                {showMemberSuggestions && memberSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-black  border-gray-200 dark:border-gray-700 rounded-[15px] shadow-lg max-h-48 overflow-y-auto">
                    {memberSuggestions.map((user) => (
                      <div
                        key={user.id}
                        onClick={() =>
                          onAddMember(
                            user.id,
                            newMember.role,
                            newMember.jobRole,
                          )
                        }
                        className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} size="md" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {user.username}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Select
                value={newMember.role || undefined}
                onValueChange={(value) =>
                  setNewMember({ ...newMember, role: value })
                }
              >
                <SelectTrigger className="h-11 w-32 shrink-0 cursor-pointer rounded-[10px] px-3">
                  <SelectValue placeholder="Access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    className={"cursor-pointer px-5"}
                    value="member"
                  >
                    Member
                  </SelectItem>
                  <SelectItem className={"cursor-pointer px-5"} value="admin">
                    Admin
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select
              value={newMember.jobRole || undefined}
              onValueChange={(value) =>
                setNewMember({ ...newMember, jobRole: value })
              }
            >
              <SelectTrigger className="h-11 w-full cursor-pointer rounded-[10px] px-3">
                <SelectValue placeholder="Select job role (required)" />
              </SelectTrigger>
              <SelectContent>
                {JOB_ROLES.map((role) => (
                  <SelectItem
                    key={role.key}
                    className={"cursor-pointer px-5"}
                    value={role.key}
                  >
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            Current members
          </h3>
          <div
            className="max-h-72 space-y-1.5 overflow-y-auto"
            key={refreshKey}
          >
            {selectedTeam.members?.map((member, index) => (
              <div
                key={memberKey(member, index, refreshKey)}
                className="flex flex-col gap-3 rounded-[12px] border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-white/5 dark:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar user={member} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {member.user?.username}
                      </p>
                      {member.user?.availability === "busy" && (
                        <span className="shrink-0 rounded-[10px] bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-500">
                          Busy
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {member.user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0">
                  <Select
                    value={member.jobRole || "unassigned"}
                    onValueChange={(value) =>
                      onUpdateJobRole(
                        member.user?.id || member.user?._id,
                        value,
                      )
                    }
                  >
                    <SelectTrigger className="h-8 w-[120px] rounded-[10px] px-3 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_ROLES.map((role) => (
                        <SelectItem
                          key={role.key}
                          className="cursor-pointer px-5"
                          value={role.key}
                        >
                          {role.label}
                        </SelectItem>
                      ))}
                      <SelectItem
                        className="cursor-pointer px-5"
                        value="unassigned"
                      >
                        Unassigned
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <span className={roleBadgeClass(member.role)}>
                    {member.role}
                  </span>
                  {member.role !== "owner" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onRemoveMember(
                          member.user?.id || member.user?._id,
                        )
                      }
                      className="h-8 w-8 rounded-[10px] p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </m.div>
  </m.div>
);

const TeamsManageModals = ({
  showNewTeamModal,
  newTeam,
  setNewTeam,
  loading,
  onCloseNewTeam,
  onCreateTeam,
  showTeamDetails,
  selectedTeam,
  user,
  teamInvites,
  refreshKey,
  showProjects,
  setShowProjects,
  onCloseTeamDetails,
  onCancelInvite,
  showMembersModal,
  memberSearch,
  showMemberSuggestions,
  memberSuggestions,
  newMember,
  setNewMember,
  onCloseMembers,
  onMemberSearch,
  onAddMember,
  onUpdateJobRole,
  onRemoveMember,
}) => (
  <>
    {showNewTeamModal && (
      <NewTeamModal
        newTeam={newTeam}
        setNewTeam={setNewTeam}
        loading={loading}
        onClose={onCloseNewTeam}
        onSubmit={onCreateTeam}
      />
    )}
    {showTeamDetails && selectedTeam && (
      <TeamDetailsModal
        selectedTeam={selectedTeam}
        user={user}
        teamInvites={teamInvites}
        refreshKey={refreshKey}
        showProjects={showProjects}
        setShowProjects={setShowProjects}
        onClose={onCloseTeamDetails}
        onCancelInvite={onCancelInvite}
      />
    )}
    {showMembersModal && selectedTeam && (
      <MembersManageModal
        selectedTeam={selectedTeam}
        refreshKey={refreshKey}
        memberSearch={memberSearch}
        showMemberSuggestions={showMemberSuggestions}
        memberSuggestions={memberSuggestions}
        newMember={newMember}
        setNewMember={setNewMember}
        onClose={onCloseMembers}
        onMemberSearch={onMemberSearch}
        onAddMember={onAddMember}
        onUpdateJobRole={onUpdateJobRole}
        onRemoveMember={onRemoveMember}
      />
    )}
  </>
);

const TeamsManage = () => {
  document.title = "Workspace - Manage Your Workspaces";

  const { user } = useAuth();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showNewTeamModal, setShowNewTeamModal] = useState(false);
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showProjects, setShowProjects] = useState(false);
  const [teamInvites, setTeamInvites] = useState([]);
  const [incomingInvites, setIncomingInvites] = useState([]);
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    members: [],
    settings: {
      allowMemberInvites: true,
      allowProjectCreation: true,
    },
  });
  const [newMember, setNewMember] = useState({
    userId: "",
    role: "",
    jobRole: "",
  });
  const [memberSearch, setMemberSearch] = useState("");
  const [memberSuggestions, setMemberSuggestions] = useState([]);
  const [showMemberSuggestions, setShowMemberSuggestions] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    pages: 0,
  });

  const loadTeams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await teamService.getTeams({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        isActive:
          filterStatus === "all" ? undefined : filterStatus === "active",
      });

      setTeams(response.teams || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      toast.error("Failed to load workspaces");
      console.error("Error loading teams:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filterStatus]);

  const loadUsers = useCallback(async () => {
    try {
      const response = await friendService.getFriends();
      const friends = response.friends || [];

      const transformedUsers = friends
        .map((friendship) => ({
          id: friendship.friend.id,
          name: friendship.friend.username,
          username: friendship.friend.username,
          email: friendship.friend.email,
          role: "Friend",
          avatar: friendship.friend.avatar,
        }))
        .filter((friend) => friend.id !== user?.id);

      setUsers(transformedUsers);
    } catch (error) {
      console.error("Error loading friends:", error);
      toast.error("Failed to load friends");
      setUsers([]);
    }
  }, []);

  const loadTeamInvites = useCallback(async (teamId) => {
    if (!teamId) return;
    try {
      const response = await invitationService.getInvitations("sent", undefined, {
        targetId: teamId,
        targetType: "team",
      });
      setTeamInvites(response.invitations || []);
    } catch (error) {
      setTeamInvites([]);
    }
  }, []);

  const loadIncomingInvites = useCallback(async () => {
    try {
      const response = await invitationService.getInvitations(
        "received",
        "pending",
        { targetType: "team" },
      );
      setIncomingInvites(response.invitations || []);
    } catch (error) {
      setIncomingInvites([]);
    }
  }, []);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadIncomingInvites();
  }, [loadIncomingInvites]);

  useEffect(() => {
    if (showTeamDetails && selectedTeam && isTeamOwner(selectedTeam, user)) {
      loadTeamInvites(selectedTeam.id || selectedTeam._id);
    }
  }, [showTeamDetails, selectedTeam, loadTeamInvites, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showMemberSuggestions &&
        !event.target.closest(".member-search-container")
      ) {
        setShowMemberSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMemberSuggestions]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeam.name.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    try {
      setLoading(true);
      const response = await teamService.createTeam(newTeam);
      setTeams((prev) => [response.team, ...prev]);
      setShowNewTeamModal(false);
      setNewTeam({
        name: "",
        description: "",
        members: [],
        settings: {
          allowMemberInvites: true,
          allowProjectCreation: true,
        },
      });
      toast.success("Workspace created successfully");
    } catch (error) {
      toast.error(error.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!confirm("Are you sure you want to delete this workspace?")) return;

    try {
      setLoading(true);
      await teamService.deleteTeam(teamId);
      setTeams((prev) => prev.filter((team) => team.id !== teamId));
      toast.success("Workspace deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSearch = (value) => {
    setMemberSearch(value);
    if (value.length > 0) {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(value.toLowerCase()) &&
          !selectedTeam.members?.some((member) => member.user?.id === user.id),
      );
      setMemberSuggestions(filtered);
      setShowMemberSuggestions(true);
    } else {
      setMemberSuggestions([]);
      setShowMemberSuggestions(false);
    }
  };

  const handleAddMember = async (userId, role, jobRole) => {
    if (!userId) {
      toast.error("Please select a user");
      return;
    }
    if (!role) {
      toast.error("Please select access");
      return;
    }
    if (!jobRole) {
      toast.error("Select a job role before inviting this member");
      return;
    }

    try {
      setLoading(true);

      await invitationService.sendInvitation({
        targetType: "team",
        targetId: selectedTeam.id || selectedTeam._id,
        inviteeId: userId,
        role,
        jobRole,
      });

      setMemberSearch("");
      setShowMemberSuggestions(false);
      setMemberSuggestions([]);
      setNewMember({ userId: "", role: "", jobRole: "" });
      toast.success("Invitation sent successfully");
      if (selectedTeam) {
        await loadTeamInvites(selectedTeam.id || selectedTeam._id);
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      setLoading(true);

      await teamService.removeMember(selectedTeam.id, { userId });
      await loadTeams();

      if (selectedTeam) {
        const response = await teamService.getTeamById(selectedTeam.id);
        setSelectedTeam(response.team);
        setRefreshKey((prev) => prev + 1);
      }
      setMemberSearch("");
      setShowMemberSuggestions(false);
      setMemberSuggestions([]);

      toast.success("Member removed successfully");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error(error.message || "Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMemberJobRole = async (userId, jobRole) => {
    try {
      setLoading(true);
      await teamService.updateMemberRole(selectedTeam.id, { userId, jobRole });

      await loadTeams();

      if (selectedTeam) {
        const response = await teamService.getTeamById(selectedTeam.id);
        setSelectedTeam(response.team);
        setRefreshKey((prev) => prev + 1);
      }

      toast.success("Member role updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update member role");
    } finally {
      setLoading(false);
    }
  };

  const handleRespondIncomingInvite = async (invitationId, action) => {
    try {
      setLoading(true);
      await invitationService.respondToInvitation(invitationId, action);
      toast.success(
        action === "accept" ? "You're in the workspace" : "Invitation declined",
      );
      await loadIncomingInvites();
      await loadTeams();
    } catch (error) {
      toast.error(error.message || `Failed to ${action} invitation`);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" ? team.isActive : !team.isActive);
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [filterStatus, searchTerm]);

  const handleCancelTeamInvite = async (invitationId) => {
    try {
      await invitationService.cancelInvitation(invitationId);
      toast.success("Invitation cancelled");
      if (selectedTeam) {
        await loadTeamInvites(selectedTeam.id || selectedTeam._id);
      }
    } catch (error) {
      toast.error(error.message || "Failed to cancel invitation");
    }
  };

  const handleOpenNewTeam = () => {
    if (!permissions.canCreateTeam) {
      toast.error(
        "You do not have permission to create workspaces. Contact an admin.",
      );
      return;
    }
    setShowNewTeamModal(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="pt-10">
      <div className="flex py-6 gap-3 items-center fixed z-10 md:-top-3 -top-30 z-10">
        <div className="flex p-2 border-2 items-center gap-2 pr-10 rounded-[15px]">
          <div className="flex p-3 bg-white dark:bg-gray-800 rounded-[15px]">
            <PiUsersDuotone size={15} />
          </div>
          <h1 className="text-2xl font-bold">Your Workspaces</h1>
        </div>
      </div>

      <TeamsManageToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        canCreateTeam={permissions.canCreateTeam}
        onOpenNewTeam={handleOpenNewTeam}
      />

      <TeamsIncomingInvites
        incomingInvites={incomingInvites}
        onRespond={handleRespondIncomingInvite}
      />

      <TeamsListBody
        loading={loading}
        filteredTeams={filteredTeams}
        searchTerm={searchTerm}
        canCreateTeam={permissions.canCreateTeam}
        onOpenNewTeam={handleOpenNewTeam}
        containerVariants={containerVariants}
        itemVariants={itemVariants}
        user={user}
        onSelectTeamDetails={(team) => {
          setSelectedTeam(team);
          setShowTeamDetails(true);
        }}
        onSelectTeamMembers={(team) => {
          setSelectedTeam(team);
          setNewMember({ userId: "", role: "", jobRole: "" });
          setShowMembersModal(true);
        }}
        onDeleteTeam={handleDeleteTeam}
      />

      <TeamsPagination
        pagination={pagination}
        setPagination={setPagination}
      />

      <TeamsManageModals
        showNewTeamModal={showNewTeamModal}
        newTeam={newTeam}
        setNewTeam={setNewTeam}
        loading={loading}
        onCloseNewTeam={() => setShowNewTeamModal(false)}
        onCreateTeam={handleCreateTeam}
        showTeamDetails={showTeamDetails}
        selectedTeam={selectedTeam}
        user={user}
        teamInvites={teamInvites}
        refreshKey={refreshKey}
        showProjects={showProjects}
        setShowProjects={setShowProjects}
        onCloseTeamDetails={() => {
          setShowTeamDetails(false);
          setShowProjects(false);
        }}
        onCancelInvite={handleCancelTeamInvite}
        showMembersModal={showMembersModal}
        memberSearch={memberSearch}
        showMemberSuggestions={showMemberSuggestions}
        memberSuggestions={memberSuggestions}
        newMember={newMember}
        setNewMember={setNewMember}
        onCloseMembers={() => setShowMembersModal(false)}
        onMemberSearch={handleMemberSearch}
        onAddMember={handleAddMember}
        onUpdateJobRole={handleUpdateMemberJobRole}
        onRemoveMember={handleRemoveMember}
      />
    </div>
  );
};

export default TeamsManage;
