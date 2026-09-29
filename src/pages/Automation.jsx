import { useEffect, useState } from "react";
import { m } from "framer-motion";
import {
  Zap,
  Plus,
  GitBranch,
  Bell,
  Calendar,
  CheckCircle,
  Sparkles,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TbMessage } from "react-icons/tb";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import automationService from "@/services/automation-service";

const AUTOMATION_TEMPLATES = [
  {
    key: "auto-assign-tasks",
    icon: CheckCircle,
    title: "Auto-assign new tasks",
    description:
      "Assign from the selected workspace. Match a job role from the dropdown, skip busy members, and pick the least-loaded match.",
    trigger: "Task created",
    action: "Assign member",
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    key: "overdue-reminders",
    icon: Bell,
    title: "Overdue reminders",
    description:
      "Email and notify the assignee and project owner when a task passes its due date.",
    trigger: "Task overdue",
    action: "Send email + notification",
    color: "text-red-500 bg-red-500/10",
  },
  {
    key: "meeting-follow-ups",
    icon: Calendar,
    title: "Meeting follow-ups",
    description:
      "Create a follow-up task automatically after every completed meeting.",
    trigger: "Meeting completed",
    action: "Create task",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    key: "pr-task-sync",
    icon: GitBranch,
    title: "PR to task sync",
    description:
      "Move a task to In Progress when a linked pull request is opened.",
    trigger: "PR opened",
    action: "Update status",
    color: "text-purple-500 bg-purple-500/10",
  },
  {
    key: "daily-standup-digest",
    icon: TbMessage,
    title: "Daily standup digest",
    description:
      "Post a summary of yesterday's progress to the workspace chat every morning.",
    trigger: "Every day 9:00",
    action: "Send message",
    color: "text-orange-500 bg-orange-500/10",
  },
  {
    key: "welcome-new-members",
    icon: Sparkles,
    title: "Welcome new members",
    description: "Email and notify a member when they join a workspace.",
    trigger: "Member added",
    action: "Send welcome email",
    color: "text-cyan-500 bg-cyan-500/10",
  },
];

const Automation = () => {
  document.title = "Automation";
  const { isAdmin } = useAuth();
  const [automations, setAutomations] = useState(() =>
    AUTOMATION_TEMPLATES.map((tpl) => ({ ...tpl, enabled: false })),
  );
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [canManage, setCanManage] = useState(isAdmin);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const res = await automationService.getAutomations();
        if (cancelled) return;

        const byKey = new Map(
          (res.automations || []).map((item) => [item.key, item]),
        );

        setAutomations(
          AUTOMATION_TEMPLATES.map((tpl) => {
            const saved = byKey.get(tpl.key);
            return {
              ...tpl,
              title: saved?.title || tpl.title,
              description: saved?.description || tpl.description,
              trigger: saved?.trigger || tpl.trigger,
              action: saved?.action || tpl.action,
              enabled: !!saved?.enabled,
            };
          }),
        );
        setCanManage(!!res.canManage || isAdmin);
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to load automations",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const toggle = async (key) => {
    if (!canManage) {
      toast.error("Only admin or superadmin can enable automations");
      return;
    }

    const current = automations.find((item) => item.key === key);
    if (!current || savingKey) return;

    const nextEnabled = !current.enabled;
    setSavingKey(key);
    setAutomations((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, enabled: nextEnabled } : item,
      ),
    );

    try {
      const res = await automationService.toggleAutomation(key, nextEnabled);
      toast.success(res.message || `${current.title} updated`);
    } catch (error) {
      setAutomations((prev) =>
        prev.map((item) =>
          item.key === key ? { ...item, enabled: current.enabled } : item,
        ),
      );
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update automation",
      );
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-6rem)] overflow-hidden rounded-[24px]">
      <div className="relative z-10 pt-6 md:pt-10 pb-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#FF914B] to-[#ff6a3d] text-white shadow-lg shadow-[#FF914B]/20">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white md:text-3xl">
                Automation
              </h1>
              <p className="mt-0.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                {canManage
                  ? "Enable rules for your workspace. Auto-assign, overdue reminders, and welcome emails are live."
                  : "Only admin or superadmin can enable these rules"}
              </p>
            </div>
          </div>
          <Button className="w-full sm:w-auto" disabled>
            <Plus className="mr-2 h-4 w-4" />
            New Automation
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {automations.map((tpl, index) => {
            const Icon = tpl.icon;
            const isOn = tpl.enabled;
            const busy = savingKey === tpl.key || loading;
            return (
              <m.div
                key={tpl.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative flex flex-col rounded-[20px] border bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 dark:bg-white/[0.04] ${
                  isOn
                    ? "border-[#FF914B]/40 shadow-lg shadow-[#FF914B]/5"
                    : "border-gray-200/70 hover:border-[#FF914B]/40 hover:shadow-xl dark:border-white/10"
                }`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${tpl.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    {!canManage && (
                      <Lock className="h-3.5 w-3.5 text-gray-400" />
                    )}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isOn}
                      aria-label={`Toggle ${tpl.title}`}
                      disabled={busy || !canManage}
                      onClick={() => toggle(tpl.key)}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed ${
                        isOn ? "bg-[#FF914B]" : "bg-gray-200 dark:bg-white/10"
                      } ${!canManage ? "opacity-60" : ""}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          isOn ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {tpl.title}
                </h3>
                <p className="mt-1 flex-1 text-sm text-gray-500 dark:text-gray-400">
                  {tpl.description}
                </p>

                <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-white/10">
                  <span className="rounded-lg bg-gray-100 capitalize px-5 py-2 text-[11px] font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300">
                    {tpl.trigger}
                  </span>
                  <div className="h-[1px] w-10 bg-gray-400" />
                  <span className="rounded-lg bg-gray-100 capitalize px-5 py-2 text-[11px] font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300">
                    {tpl.action}
                  </span>
                </div>
              </m.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Automation;
