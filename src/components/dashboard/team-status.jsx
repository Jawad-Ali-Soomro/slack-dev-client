import { useEffect, useMemo, useState, memo } from "react";
import { m } from "framer-motion";
import { toast } from "sonner";
import { userService } from "../../services/user-service";
import friendService from "../../services/friend-service";
import teamService from "../../services/team-service";
import UserAvatar from "../../components/user-avatar";
import { useChat } from "../../contexts/chat-context";
import { useAuth } from "../../contexts/auth-context";
import { PiUsersDuotone } from "react-icons/pi";

const STATUS_OPTIONS = [
  { key: "available", label: "Available", color: "#10b981" },
  { key: "busy", label: "Busy", color: "#ef4444" },
  { key: "away", label: "Away", color: "#6b7280" },
  { key: "meeting", label: "In a meeting", color: "#8b5cf6" },
];

const JOB_ROLES = [
  { key: "frontend", label: "Frontend", full: "Frontend Developer", color: "#75FC96" },
  { key: "backend", label: "Backend", full: "Backend Developer", color: "#4fd972" },
  { key: "qa", label: "QA", full: "QA Engineer", color: "#ADADAD" },
  { key: "devops", label: "DevOps", full: "DevOps Engineer", color: "#D13817" },
  { key: "fullstack", label: "Full Stack", full: "Full Stack Developer", color: "#000000" },
  { key: "designer", label: "Design", full: "UI/UX Designer", color: "#75FC96" },
  { key: "unassigned", label: "Member", full: "Member", color: "#ADADAD" },
];

const getRole = (key) =>
  JOB_ROLES.find((r) => r.key === key) || JOB_ROLES[JOB_ROLES.length - 1];

const OFFLINE_STATUS = { label: "Offline", color: "#ADADAD" };

const getStatus = (key) =>
  STATUS_OPTIONS.find((s) => s.key === key) || STATUS_OPTIONS[0];

const RoleLabel = ({ roleKey }) => {
  const role = getRole(roleKey);
  return (
    <span
      title={role.full}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#ADADAD]/40 bg-white px-2 py-1 text-[10px] font-semibold tracking-wide text-black dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: role.color }}
      />
      {role.label}
    </span>
  );
};

const TeamStatus = memo(function TeamStatus({
  currentUser,
  onUserClick,
}) {
  const { isUserOnline, onlineUsers } = useChat();
  const { updateUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentUserId = String(currentUser?.id || currentUser?._id || "");
  const myAvailability = currentUser?.availability || "available";
  const activeStatus = getStatus(myAvailability);

  useEffect(() => {
    const onWorkspaceStatus = (event) => {
      const status = event?.detail;
      const statusUserId = String(status?.id || status?.userId || "");
      if (!statusUserId) return;

      if (statusUserId === currentUserId) {
        updateUser({
          availability: status.availability,
          jobRole: status.jobRole,
          statusMessage: status.statusMessage,
        });
        return;
      }

      setMembers((prev) =>
        prev.map((member) => {
          const memberId = String(member.id || member._id || "");
          if (memberId !== statusUserId) return member;
          return {
            ...member,
            username: status.username || member.username,
            avatar: status.avatar ?? member.avatar,
            availability: status.availability ?? member.availability,
            statusMessage: status.statusMessage ?? member.statusMessage,
          };
        }),
      );
    };

    window.addEventListener("workspace:status", onWorkspaceStatus);
    return () =>
      window.removeEventListener("workspace:status", onWorkspaceStatus);
  }, [currentUserId, updateUser]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await teamService.getTeams({ limit: 100 });
        const seen = new Map();
        for (const team of res?.teams || []) {
          for (const member of team.members || []) {
            const id = member.user?.id || member.user?._id;
            if (!id) continue;
            const jobRole = member.jobRole || "unassigned";
            const existing = seen.get(String(id));
            if (
              !existing ||
              (existing.jobRole === "unassigned" && jobRole !== "unassigned")
            ) {
              seen.set(String(id), {
                id,
                username: member.user?.username,
                avatar: member.user?.avatar,
                availability: member.user?.availability,
                jobRole,
              });
            }
          }
        }
        if (active) setMembers([...seen.values()]);
      } catch {
        try {
          const res = await friendService.getFriends();
          const list = (res?.friends || []).map((f) => ({
            id: f.friend?.id,
            username: f.friend?.username,
            avatar: f.friend?.avatar,
            availability: f.friend?.availability,
            jobRole: "unassigned",
          }));
          if (active) setMembers(list);
        } catch {
          if (active) setMembers([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const teamMembers = useMemo(
    () =>
      members
        .filter((m) => String(m.id || m._id) !== currentUserId)
        .map((m) => ({ ...m, online: isUserOnline(m.id || m._id) }))
        .sort((a, b) => Number(b.online) - Number(a.online))
        .slice(0, 6),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [members, currentUserId, onlineUsers],
  );

  const onlineCount = teamMembers.filter((m) => m.online).length;

  const updateAvailability = async (key) => {
    if (key === myAvailability || saving) return;
    const previous = myAvailability;
    updateUser({ availability: key });
    setSaving(true);
    try {
      await userService.updateStatus({ availability: key });
    } catch (err) {
      updateUser({ availability: previous });
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <m.div
      className="dashboard-card p-5 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="dashboard-section-icon !w-8 !h-8 !rounded-lg">
            <PiUsersDuotone className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-black dark:text-white truncate">
            Workspace Status
          </h3>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-[#ADADAD] shrink-0">
          <span
            className={`h-1.5 w-1.5 rounded-full ${onlineCount > 0 ? "bg-[#75FC96]" : "bg-[#ADADAD]"}`}
          />
          {onlineCount} online
        </span>
      </div>

      <div className="rounded-xl border border-gray-100 bg-[#F8F9FA] p-3 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative shrink-0">
            <UserAvatar
              user={currentUser}
              name={currentUser?.username || "You"}
              size="lg"
            />
            <span
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white dark:ring-black"
              style={{ background: activeStatus.color }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-black dark:text-white">
              {currentUser?.username || "You"}
            </p>
            <p className="text-[11px] text-[#ADADAD]">{activeStatus.label}</p>
          </div>
        </div>

        {/* Availability selector — original chip style */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((option) => {
            const active = option.key === myAvailability;
            return (
              <button
                key={option.key}
                type="button"
                disabled={saving}
                onClick={() => updateAvailability(option.key)}
                className={`flex items-center gap-1.5 rounded-xl border h-10 pl-2 pr-4 text-[11px] font-medium transition-colors disabled:opacity-60 ${
                  active
                    ? "border-transparent bg-gray-200 text-black dark:bg-white dark:text-black"
                    : "border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
                }`}
              >
                <div className="flex p-2 bg-white rounded-md dark:bg-white/90">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: option.color }}
                  />
                </div>
                {option.label}
              </button>
            );
          })}
        </div>
        {myAvailability === "busy" && (
          <p className="mt-2 text-[11px] font-medium text-red-500">
            You&apos;re marked busy — new tasks can&apos;t be assigned to you.
          </p>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-[#ADADAD]/25 dark:border-white/10">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-[#ADADAD]">
          Workspace Members
        </p>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-gray-100 dark:bg-white/5"
              />
            ))}
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-[#ADADAD]">
            <PiUsersDuotone className="mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">No members yet</p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {teamMembers.map((member) => {
              const memberId = member.id || member._id;
              const roleKey = member.jobRole || "unassigned";
              const status = member.online
                ? getStatus(member.availability)
                : OFFLINE_STATUS;
              return (
                <li
                  key={memberId}
                  onClick={() => onUserClick?.(memberId)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[#ADADAD]/25 bg-white px-2.5 py-2 transition-colors hover:bg-[#75FC96]/15 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div className="relative shrink-0">
                    <UserAvatar
                      user={member}
                      size="md"
                      onClick={(id) => id && onUserClick?.(id)}
                    />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-black"
                      style={{ background: status.color }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-black dark:text-white">
                      {member.username || member.name || "Member"}
                    </p>
                    <p className="truncate text-[11px] text-[#ADADAD]">
                      {member.statusMessage
                        ? member.statusMessage
                        : member.availability === "busy"
                          ? "Busy · cannot take new tasks"
                          : status.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {member.availability === "busy" && (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-500">
                        Busy
                      </span>
                    )}
                    <RoleLabel roleKey={roleKey} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </m.div>
  );
});

export default TeamStatus;
