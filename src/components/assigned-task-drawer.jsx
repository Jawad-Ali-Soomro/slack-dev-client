import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  GripVertical,
  Kanban,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/auth-context";
import taskService from "../services/task-service";
import UserAvatar from "./user-avatar";
import { STATUS_TABS } from "@/constants/assingned-tasks-constants";

const taskIdOf = (task) => task?.id || task?._id;

export default function AssignedTaskDrawer({
  open,
  onOpenChange,
  onOpenTask,
}) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [draggingId, setDraggingId] = useState(null);
  const [overStatus, setOverStatus] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const loadAssigned = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await taskService.getTasks({ assignTo: user.id });
      const mine = (response.tasks || []).filter(
        (task) => (task.assignTo?.id || task.assignTo?._id) === user.id,
      );
      setTasks(mine);
    } catch (error) {
      toast.error(error?.message || "Failed to load your tasks");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (open && user?.id) loadAssigned();
  }, [open, user?.id, loadAssigned]);

  useEffect(() => {
    const onChanged = (event) => {
      const updated = event?.detail;
      const id = taskIdOf(updated);
      if (!id) {
        if (open) loadAssigned();
        return;
      }
      setTasks((prev) => {
        const idx = prev.findIndex((task) => taskIdOf(task) === id);
        const assignedToMe =
          (updated.assignTo?.id || updated.assignTo?._id) === user?.id;
        if (!assignedToMe) {
          if (idx === -1) return prev;
          return prev.filter((task) => taskIdOf(task) !== id);
        }
        if (idx === -1) return [updated, ...prev];
        const next = [...prev];
        next[idx] = { ...next[idx], ...updated };
        return next;
      });
    };
    window.addEventListener("tasks:changed", onChanged);
    return () => window.removeEventListener("tasks:changed", onChanged);
  }, [open, user?.id, loadAssigned]);

  const grouped = useMemo(() => {
    const buckets = {
      pending: [],
      in_progress: [],
      completed: [],
      cancelled: [],
    };
    for (const task of tasks) {
      const status = buckets[task.status] ? task.status : "pending";
      buckets[status].push(task);
    }
    return buckets;
  }, [tasks]);

  const moveTask = async (task, nextStatus) => {
    const id = taskIdOf(task);
    if (!id || task.status === nextStatus) return;

    const previous = task.status;
    setSavingId(id);
    setTasks((prev) =>
      prev.map((item) =>
        taskIdOf(item) === id ? { ...item, status: nextStatus } : item,
      ),
    );

    try {
      const res = await taskService.updateTaskStatus(id, nextStatus);
      const updated = res?.task || { ...task, status: nextStatus };
      setTasks((prev) =>
        prev.map((item) => (taskIdOf(item) === id ? { ...item, ...updated } : item)),
      );
      window.dispatchEvent(
        new CustomEvent("tasks:changed", { detail: updated }),
      );
      toast.success(`Moved to ${STATUS_TABS.find((t) => t.id === nextStatus)?.label}`);
    } catch (error) {
      setTasks((prev) =>
        prev.map((item) =>
          taskIdOf(item) === id ? { ...item, status: previous } : item,
        ),
      );
      toast.error(error?.message || "Could not update status");
    } finally {
      setSavingId(null);
    }
  };

  const handleDropOn = (status) => async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setOverStatus(null);
    const id =
      event.dataTransfer.getData("text/task-id") ||
      event.dataTransfer.getData("text/plain");
    const task = tasks.find((item) => taskIdOf(item) === id);
    setDraggingId(null);
    if (task) await moveTask(task, status);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg p-0 border-none"
      >
        <div className="flex h-full flex-col bg-white dark:bg-gray-900">
          <div className="px-6 pt-7 pb-4">
            <SheetHeader className="space-y-1">
              <div className="flex items-center gap-2 text-[#FF914B]">
                <Kanban className="h-5 w-5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Assigned to you
                </span>
              </div>
              <SheetTitle className="text-xl font-semibold text-black dark:text-white">
                My board
              </SheetTitle>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Drag a task onto to-do, pending, completed, or canceled. Status
                updates live for everyone on the ticket.
              </p>
            </SheetHeader>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex min-h-0 flex-1 flex-col px-4 pb-6"
          >
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-[16px] bg-gray-100 p-1 dark:bg-white/10 sm:grid-cols-4">
              {STATUS_TABS.map((tab) => {
                const Icon = tab.icon;
                const count = grouped[tab.id]?.length || 0;
                const isOver = overStatus === tab.id;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setOverStatus(tab.id);
                    }}
                    onDragLeave={() =>
                      setOverStatus((current) =>
                        current === tab.id ? null : current,
                      )
                    }
                    onDrop={handleDropOn(tab.id)}
                    className={cn(
                      "flex h-11 flex-col rounded-[12px] px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide",
                      isOver && "bg-[#FF914B]/15 text-[#FF914B] ring-2 ring-[#FF914B]/40",
                    )}
                  >
                    <span className="flex items-center gap-1">
                      <Icon className={cn("h-3.5 w-3.5 mr-2", tab.accent)} />
                      {tab.label}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {STATUS_TABS.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setOverStatus(tab.id);
                    }}
                onDrop={handleDropOn(tab.id)}
                className="mt-4 min-h-0 flex-1 overflow-y-auto"
              >
                {loading ? (
                  <p className="px-2 py-10 text-center text-sm text-gray-500">
                    Loading your tasks…
                  </p>
                ) : grouped[tab.id].length === 0 ? (
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center rounded-[20px] border border-dashed border-gray-200 px-4 py-16 text-center dark:border-white/10",
                      overStatus === tab.id && "border-[#FF914B] bg-[#FF914B]/5",
                    )}
                  >
                    <tab.icon className={cn("mb-3 h-8 w-8", tab.accent)} />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {tab.empty}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Drop a task here to move it to {tab.label.toLowerCase()}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 pb-8">
                    {grouped[tab.id].map((task) => {
                      const id = taskIdOf(task);
                      const overdue =
                        task.dueDate &&
                        task.status !== "completed" &&
                        task.status !== "cancelled" &&
                        new Date(task.dueDate) < new Date();
                      return (
                        <article
                          key={id}
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.setData("text/plain", id);
                            event.dataTransfer.setData("text/task-id", id);
                            event.dataTransfer.effectAllowed = "move";
                            setDraggingId(id);
                          }}
                          onDragEnd={() => {
                            setDraggingId(null);
                            setOverStatus(null);
                          }}
                          className={cn(
                            "rounded-[18px] border border-gray-200 bg-white p-4 shadow-sm transition dark:border-white/10 dark:bg-white/[0.04]",
                            draggingId === id && "opacity-50",
                            savingId === id && "pointer-events-none opacity-70",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-gray-300" />
                            <div className="min-w-0 flex-1">
                              <button
                                type="button"
                                className="w-full text-left"
                                onClick={() => onOpenTask?.(task)}
                              >
                                <p className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">
                                  {task.title}
                                </p>
                              </button>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                {overdue && (
                                  <Badge className="rounded-[12px] border border-red-400/40 bg-red-500/15 text-[10px] font-bold uppercase text-red-600">
                                    <AlertCircle className="mr-1 h-3 w-3" />
                                    Overdue
                                  </Badge>
                                )}
                                {task.priority && (
                                  <Badge className="rounded-[12px] border border-gray-200 bg-gray-50 text-[10px] font-bold uppercase text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                                    {task.priority}
                                  </Badge>
                                )}
                                {task.dueDate && (
                                  <span className="text-[11px] font-medium text-gray-400">
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              {task.assignedBy?.username && (
                                <div className="mt-3 flex items-center gap-2">
                                  <UserAvatar user={task.assignedBy} size="sm" />
                                  <span className="text-[11px] text-gray-500">
                                    From {task.assignedBy.username}
                                  </span>
                                </div>
                              )}
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {STATUS_TABS.filter((tab) => tab.id !== task.status).map(
                                  (tab) => (
                                    <button
                                      key={tab.id}
                                      type="button"
                                      disabled={savingId === id}
                                      onClick={() => moveTask(task, tab.id)}
                                      className="rounded-[10px] border border-gray-200 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500 transition hover:border-[#FF914B]/40 hover:text-[#FF914B] disabled:opacity-50 dark:border-white/10 dark:text-gray-400"
                                    >
                                      {tab.label}
                                    </button>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
