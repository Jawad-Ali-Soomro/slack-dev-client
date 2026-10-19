export const tableBadgeClass =
  "status-chip inline-flex items-center justify-center gap-1 font-bold text-[9px] uppercase px-3 min-w-[100px] border";

export const detailBadgeClass =
  "status-chip inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold normal-case border";

const completed =
  "bg-emerald-500/15 text-emerald-800 border-emerald-400/50 dark:bg-emerald-500/20 dark:text-emerald-100 dark:border-emerald-400/40";
const progress =
  "bg-orange-500/15 text-orange-800 border-orange-400/50 dark:bg-orange-500/20 dark:text-orange-100 dark:border-orange-400/40";
const waiting =
  "bg-amber-500/15 text-amber-800 border-amber-400/50 dark:bg-amber-500/20 dark:text-amber-100 dark:border-amber-400/40";
const danger =
  "bg-red-500/15 text-red-700 border-red-400/50 dark:bg-red-500/20 dark:text-red-100 dark:border-red-400/40";
const neutral =
  "bg-gray-500/10 text-gray-700 border-gray-300 dark:bg-white/10 dark:text-gray-200 dark:border-white/15";
const info =
  "bg-sky-500/15 text-sky-800 border-sky-400/50 dark:bg-sky-500/20 dark:text-sky-100 dark:border-sky-400/40";

export const projectBadgeTone =
  "border-transparent bg-[var(--theme-accent)] text-[#1c1c1e]";

export function statusBadgeTone(status, overdue = false) {
  if (overdue || status === "overdue") return danger;
  switch (status) {
    case "completed":
      return completed;
    case "in_progress":
    case "pregress":
      return progress;
    case "pending":
    case "scheduled":
      return waiting;
    case "cancelled":
      return danger;
    default:
      return neutral;
  }
}

export function priorityBadgeTone(priority) {
  switch (priority) {
    case "urgent":
    case "high":
      return danger;
    case "medium":
      return progress;
    case "low":
      return completed;
    default:
      return completed;
  }
}

export function roleBadgeTone(role) {
  switch (role) {
    case "superadmin":
      return progress;
    case "admin":
      return danger;
    default:
      return neutral;
  }
}

export function verificationBadgeTone(verified) {
  return verified ? completed : waiting;
}

export function permissionBadgeTone(key) {
  switch (key) {
    case "canCreateTeam":
      return info;
    case "canCreateProject":
      return progress;
    case "canCreateTask":
      return completed;
    case "canCreateMeeting":
      return waiting;
    case "canManageUsers":
      return danger;
    case "canViewAllData":
      return info;
    default:
      return neutral;
  }
}

export function meetingTypeBadgeTone(type) {
  switch (type) {
    case "online":
      return info;
    case "in-person":
      return completed;
    case "hybrid":
      return progress;
    default:
      return neutral;
  }
}
