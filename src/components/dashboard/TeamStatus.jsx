import { useEffect, useMemo, useState, memo } from "react";
import { motion } from "framer-motion";
import { Users, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { userService } from "../../services/userService";
import friendService from "../../services/friendService";
import { getAvatarProps } from "../../utils/avatarUtils";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import { PiUsersDuotone } from "react-icons/pi";

const STATUS_OPTIONS = [
  { key: "available", label: "Available", color: "#10b981" },
  { key: "busy", label: "Busy", color: "#ef4444" },
  { key: "away", label: "Away", color: "#6b7280" },
  { key: "meeting", label: "In a meeting", color: "#8b5cf6" },
];

const JOB_ROLES = [
  { key: "frontend", label: "Frontend", full: "Frontend Developer", color: "#3b82f6" },
  { key: "backend", label: "Backend", full: "Backend Developer", color: "#10b981" },
  { key: "qa", label: "QA", full: "QA Engineer", color: "#a855f7" },
  { key: "devops", label: "DevOps", full: "DevOps Engineer", color: "#f97316" },
  { key: "fullstack", label: "Full Stack", full: "Full Stack Developer", color: "#06b6d4" },
  { key: "designer", label: "Design", full: "UI/UX Designer", color: "#ec4899" },
  { key: "unassigned", label: "Member", full: "Member", color: "#9ca3af" },
];

const getRole = (key) =>
  JOB_ROLES.find((r) => r.key === key) || JOB_ROLES[JOB_ROLES.length - 1];

const OFFLINE_STATUS = { label: "Offline", color: "#9ca3af" };

const getStatus = (key) =>
  STATUS_OPTIONS.find((s) => s.key === key) || STATUS_OPTIONS[0];

const RoleLabel = ({ roleKey }) => {
  const role = getRole(roleKey);
  return (
    <span
      title={role.full}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-2 py-1 text-[11px] font-semibold tracking-wide text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
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
  inProgressCount = 0,
  onUserClick,
}) {
  const { isUserOnline, onlineUsers } = useChat();
  const { updateUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentUserId = String(currentUser?.id || currentUser?._id || "");
  const myAvailability = currentUser?.availability || "available";
  const myJobRole = currentUser?.jobRole || "unassigned";
  const activeStatus = getStatus(myAvailability);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await friendService.getFriends();
        const list = (res?.friends || []).map((f) => ({
          id: f.friend?.id,
          username: f.friend?.username,
          avatar: f.friend?.avatar,
          availability: f.friend?.availability,
          jobRole: f.friend?.jobRole,
        }));
        if (active) setMembers(list);
      } catch {
        if (active) setMembers([]);
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
    <motion.div
      className="dashboard-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="dashboard-section-icon !w-8 !h-8 !rounded-lg">
            <PiUsersDuotone className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Team Status
          </h3>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <span
            className={`h-1.5 w-1.5 rounded-full ${onlineCount > 0 ? "bg-emerald-500" : "bg-gray-400"}`}
          />
          {onlineCount} online
        </span>
      </div>

      {/* Current user status */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              {...getAvatarProps(
                currentUser?.avatar,
                currentUser?.username || "You",
              )}
              alt={currentUser?.username || "You"}
              className="h-10 w-10 rounded-[12px] object-cover"
            />
            <span
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white dark:ring-black"
              style={{ background: activeStatus.color }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-bold text-gray-900 dark:text-white">
                {currentUser?.username || "You"}
              </p>
            </div>
          </div>
        </div>

        {/* Availability selector */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((option) => {
            const active = option.key === myAvailability;
            return (
              <button
                key={option.key}
                type="button"
                disabled={saving}
                onClick={() => updateAvailability(option.key)}
                className={`flex items-center gap-1.5 rounded-xl border font-bold h-10 pl-2 pr-5 text-[11px] font-medium transition-colors disabled:opacity-60 ${
                  active
                    ? "border-transparent bg-gray-200 text-black dark:bg-white dark:text-black"
                    : "border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
                }`}
              >
                <div className="flex p-2 bg-white rounded-md">
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
            You're marked busy — new tasks can't be assigned to you.
          </p>
        )}
      </div>

      {/* Team members */}
      <div className="mt-4 space-y-1">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Team Members
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
          <div className="flex flex-col items-center justify-center py-6 text-gray-400 dark:text-gray-500">
            <PiUsersDuotone className="mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">No teammates yet</p>
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
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2 transition-colors hover:bg-gray-100/80 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div className="relative shrink-0">
                    <img
                      {...getAvatarProps(
                        member.avatar,
                        member.username || member.name,
                      )}
                      alt={member.username || member.name}
                      className="h-9 w-9 rounded-[10px] object-cover"
                    />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-sm ring-2 ring-white dark:ring-black"
                      style={{ background: status.color }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900 dark:text-white">
                      {member.username || member.name || "Member"}
                    </p>
                    <p className="truncate py-1 text-xs text-gray-500 dark:text-gray-400">
                      {status.label}
                    </p>
                  </div>
                  <RoleLabel roleKey={roleKey} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </motion.div>
  );
});

export default TeamStatus;
