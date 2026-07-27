import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderGit2, X } from "lucide-react";
import { toast } from "sonner";
import useGithubRepos, { connectGithub } from "@/hooks/useGithubRepos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker, TimePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import taskService from "@/services/taskService";
import projectService from "@/services/projectService";
import friendService from "@/services/friendService";
import { useAuth } from "@/contexts/AuthContext";
import { getAvatarProps } from "@/utils/avatarUtils";
import { toUTCDate } from "@/utils/timeConverter";

const emptyForm = {
  title: "",
  description: "",
  priority: "medium",
  assignedTo: "",
  assignedToId: "",
  dueDate: "",
  dueTime: "",
  projectId: "none",
  repoId: "none",
};

export default function CreateTaskModal({
  open,
  onOpenChange,
  repository = null,
  defaultDueDate = "",
  onCreated,
}) {
  const { user } = useAuth();
  const {
    githubRepos,
    loading: githubLoading,
    isGithubConnected,
    fetchRepos,
  } = useGithubRepos({ autoFetch: false });

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const resetForm = useCallback(() => {
    setForm({
      ...emptyForm,
      dueDate: defaultDueDate || "",
      repoId: repository?.repoId ? String(repository.repoId) : "none",
    });
    setShowSuggestions(false);
  }, [defaultDueDate, repository?.repoId]);

  useEffect(() => {
    if (!open) return;

    resetForm();

    const load = async () => {
      try {
        const [friendsRes, projectsRes] = await Promise.all([
          friendService.getFriends(),
          projectService.getProjects({ limit: 100 }),
        ]);

        const friends = (friendsRes.friends || [])
          .map((f) => ({
            id: f.friend.id,
            name: f.friend.username,
            username: f.friend.username,
            email: f.friend.email,
            avatar: f.friend.avatar,
            availability: f.friend.availability || "available",
            jobRole: f.friend.jobRole || "unassigned",
          }))
          .filter((f) => f.id !== user?.id);

        setUsers(friends);
        setProjects(projectsRes.projects || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load form data");
      }
    };

    load();

    if (isGithubConnected) {
      fetchRepos();
    }
  }, [open, user?.id, resetForm, isGithubConnected, fetchRepos]);

  const handleAssignedToChange = (value) => {
    setForm((prev) => ({ ...prev, assignedTo: value, assignedToId: "" }));
    if (value.length > 0) {
      const filtered = users.filter(
        (u) =>
          (u.username || u.name).toLowerCase().includes(value.toLowerCase()) ||
          u.email?.toLowerCase().includes(value.toLowerCase()),
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectUser = (selected) => {
    if (selected.availability === "busy") {
      toast.error(
        `${selected.username || selected.name} is busy and can't be assigned tasks right now`,
      );
      return;
    }
    setForm((prev) => ({
      ...prev,
      assignedTo: selected.username || selected.name,
      assignedToId: selected.id,
    }));
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    if (!form.assignedToId) {
      toast.error("Please select someone to assign the task to");
      return;
    }

    try {
      setLoading(true);

      let dueDate;
      if (form.dueDate) {
        const time = form.dueTime || "18:00";
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        dueDate = toUTCDate(form.dueDate, time, timeZone);
      }

      const payload = {
        title: form.title.trim(),
        description: form.description,
        assignTo: form.assignedToId,
        priority: form.priority,
        dueDate,
        projectId:
          form.projectId && form.projectId !== "none"
            ? form.projectId
            : undefined,
      };

      if (repository?.repoId && repository?.repoName) {
        payload.repository = {
          repoId: String(repository.repoId),
          repoName: repository.repoName,
        };
      } else if (form.repoId && form.repoId !== "none") {
        const selectedRepo = githubRepos.find(
          (repo) => repo.id === form.repoId,
        );
        if (selectedRepo) {
          payload.repository = {
            repoId: selectedRepo.id,
            repoName: selectedRepo.name,
          };
        }
      }

      await taskService.createTask(payload);

      try {
        await taskService.clearTaskCaches?.();
      } catch {
        /* optional cache clear */
      }

      toast.success("Task created successfully!");
      onOpenChange(false);
      onCreated?.();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create task",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">
                  Create Task
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Assign work to your team
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            {repository?.repoName ? (
              <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl bg-theme-subtle border border-theme-subtle">
                <FolderGit2 className="w-4 h-4 text-theme shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
                    GitHub Repository
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {repository.repoName}
                  </p>
                </div>
              </div>
            ) : !isGithubConnected ? (
              <div className="mb-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10 p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Connect GitHub to link a repository to this task
                </p>
                <Button
                  type="button"
                  onClick={connectGithub}
                  className="h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black"
                >
                  Connect GitHub
                </Button>
              </div>
            ) : (
              <div className="mb-4">
                <Select
                  value={form.repoId}
                  onValueChange={(value) =>
                    setForm((p) => ({ ...p, repoId: value }))
                  }
                  disabled={githubLoading}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue
                      placeholder={
                        githubLoading
                          ? "Loading your repositories..."
                          : "Repository (optional)"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Repository</SelectItem>
                    {githubRepos.map((repo) => (
                      <SelectItem key={repo.id} value={repo.id}>
                        {repo.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-4">
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                className="h-12"
                placeholder="Task title"
              />

              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Description (optional)"
                rows={3}
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={form.priority}
                  onValueChange={(value) =>
                    setForm((p) => ({ ...p, priority: value }))
                  }
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>

                <DatePicker
                  value={form.dueDate}
                  onChange={(value) =>
                    setForm((p) => ({ ...p, dueDate: value }))
                  }
                  placeholder="Due date"
                  disablePast
                />
              </div>

              <TimePicker
                value={form.dueTime}
                onChange={(value) => setForm((p) => ({ ...p, dueTime: value }))}
                placeholder="Due time"
              />

              <div className="relative">
                <Input
                  value={form.assignedTo}
                  onChange={(e) => handleAssignedToChange(e.target.value)}
                  onFocus={() => {
                    if (form.assignedTo.length > 0) setShowSuggestions(true);
                  }}
                  className="h-12"
                  placeholder="Assign to (search friends)"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-[210] w-full mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {suggestions.map((u) => {
                      const isBusy = u.availability === "busy";
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => selectUser(u)}
                          aria-disabled={isBusy}
                          className={`w-full px-4 py-3 text-left border-b border-gray-100 dark:border-white/5 last:border-0 ${
                            isBusy
                              ? "opacity-60 cursor-not-allowed"
                              : "hover:bg-gray-50 dark:hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              {...getAvatarProps(
                                u.avatar,
                                u.username || u.name,
                              )}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                  {u.username || u.name}
                                </span>
                                {isBusy && (
                                  <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-500">
                                    Busy
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <Select
                value={form.projectId}
                onValueChange={(value) =>
                  setForm((p) => ({ ...p, projectId: value }))
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 h-12"
              >
                {loading ? <span className="loader w-5 h-5" /> : "Create Task"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
