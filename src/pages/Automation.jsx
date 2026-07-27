import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Plus,
  GitBranch,
  Bell,
  Calendar,
  CheckCircle,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AUTOMATION_TEMPLATES = [
  {
    icon: CheckCircle,
    title: "Auto-assign new tasks",
    description:
      "When a task is created without an assignee, assign it to the least busy team member.",
    trigger: "Task created",
    action: "Assign member",
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    icon: Bell,
    title: "Overdue reminders",
    description:
      "Notify the assignee and project owner when a task passes its due date.",
    trigger: "Task overdue",
    action: "Send notification",
    color: "text-red-500 bg-red-500/10",
  },
  {
    icon: Calendar,
    title: "Meeting follow-ups",
    description:
      "Create a follow-up task automatically after every completed meeting.",
    trigger: "Meeting completed",
    action: "Create task",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: GitBranch,
    title: "PR to task sync",
    description:
      "Move a task to In Progress when a linked pull request is opened.",
    trigger: "PR opened",
    action: "Update status",
    color: "text-purple-500 bg-purple-500/10",
  },
  {
    icon: MessageSquare,
    title: "Daily standup digest",
    description:
      "Post a summary of yesterday's progress to the team chat every morning.",
    trigger: "Every day 9:00",
    action: "Send message",
    color: "text-orange-500 bg-orange-500/10",
  },
  {
    icon: Sparkles,
    title: "Welcome new members",
    description: "Send onboarding resources when a member joins a project.",
    trigger: "Member added",
    action: "Send message",
    color: "text-cyan-500 bg-cyan-500/10",
  },
];

const Automation = () => {
  document.title = "Automation";
  const [enabled, setEnabled] = useState(() => new Set());

  const toggle = (title) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  };

  return (
    <div className="relative min-h-[calc(100vh-6rem)] overflow-hidden rounded-[24px]">
      {/* Grid background (same family as the landing page) */}
      <div className="automation-grid" aria-hidden="true" />

      <div className="relative z-10 pt-6 md:pt-10 pb-20">
        {/* Header */}
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
                Put your workflow on autopilot with rules and triggers
              </p>
            </div>
          </div>
          <Button className="w-full sm:w-auto" disabled>
            <Plus className="mr-2 h-4 w-4" />
            New Automation
          </Button>
        </div>

        {/* Coming soon banner */}
        <div className="mb-8 flex items-center gap-3 rounded-[18px] border border-[#FF914B]/30 bg-[#FF914B]/10 px-4 py-3">
          <Sparkles className="h-5 w-5 shrink-0 text-[#FF914B]" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Automations are coming soon. Browse the templates below — toggle the
            ones you'd like to enable when they launch.
          </p>
        </div>

        {/* Templates grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AUTOMATION_TEMPLATES.map((tpl, index) => {
            const Icon = tpl.icon;
            const isOn = enabled.has(tpl.title);
            return (
              <motion.div
                key={tpl.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative flex flex-col rounded-[20px] border border-gray-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[#FF914B]/40 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${tpl.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isOn}
                    onClick={() => toggle(tpl.title)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      isOn ? "bg-[#FF914B]" : "bg-gray-200 dark:bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        isOn ? "translate-x-0" : "-translate-x-5"
                      }`}
                    />
                  </button>
                </div>

                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {tpl.title}
                </h3>
                <p className="mt-1 flex-1 text-sm text-gray-500 dark:text-gray-400">
                  {tpl.description}
                </p>

                <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-white/10">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300">
                    {tpl.trigger}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300">
                    {tpl.action}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Automation;
