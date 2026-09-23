import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CircleHelp, FolderGit2, X } from "lucide-react";
import { toast } from "sonner";
import useGithubRepos, { connectGithub } from "@/hooks/use-github-repos";
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
import taskService from "@/services/task-service";
import projectService from "@/services/project-service";
import friendService from "@/services/friend-service";
import teamService from "@/services/team-service";
import automationService from "@/services/automation-service";
import { useAuth } from "@/contexts/auth-context";
import UserAvatar from "@/components/user-avatar";
import { toUTCDate } from "@/utils/time-converter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const JOB_ROLES = [
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "qa", label: "QA" },
  { key: "devops", label: "DevOps" },
  { key: "fullstack", label: "Full Stack" },
  { key: "designer", label: "Designer" },
];

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
  teamId: "none",
  jobRole: "",
};

export default function CreateTaskModal({
  open,
  onOpenChange,
  repository = null,
  defaultDueDate = "",
  captureMetadata = null,
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
  const [teams, setTeams] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [autoAssignHint, setAutoAssignHint] = useState("");
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [detectedRoles, setDetectedRoles] = useState([]);

  const resetForm = useCallback(() => {
    setForm({
      ...emptyForm,
      dueDate: defaultDueDate || "",
      repoId: repository?.repoId ? String(repository.repoId) : "none",
    });
    setShowSuggestions(false);
    setAutoAssignHint("");
    setShowSuggestModal(false);
    setCandidates([]);
    setDetectedRoles([]);
  }, [defaultDueDate, repository?.repoId]);

  useEffect(() => {
    if (!open) {
      setShowSuggestModal(false);
      setCandidates([]);
      return;
    }

    resetForm();

    const load = async () => {
      try {
        const [friendsRes, projectsRes, automationsRes, teamsRes] =
          await Promise.all([
            friendService.getFriends(),
            projectService.getProjects({ limit: 100 }),
            automationService.getAutomations().catch(() => null),
            teamService.getTeams({ limit: 100 }).catch(() => ({ teams: [] })),
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
        setTeams(teamsRes.teams || []);
        setAutoAssignEnabled(
          !!automationsRes?.automations?.find(
            (item) => item.key === "auto-assign-tasks" && item.enabled,
          ),
        );
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
    setAutoAssignHint("");
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

  const applyAssignee = (person, reason) => {
    if (person.availability === "busy" || person.isBusy) {
      toast.error(
        `${person.username || person.name} is busy and can't be assigned tasks right now`,
      );
      return false;
    }
    setForm((prev) => ({
      ...prev,
      assignedTo: person.username || person.name,
      assignedToId: person.id,
    }));
    setShowSuggestions(false);
    setShowSuggestModal(false);
    setAutoAssignHint(reason || person.reason || `Assigned to ${person.username}`);
    return true;
  };

  const selectUser = (selected) => {
    applyAssignee(selected);
  };

  const eligibleCandidates = (list = []) =>
    (list || []).filter(
      (person) =>
        person.jobRole === form.jobRole &&
        person.availability !== "busy" &&
        !person.isBusy,
    );

  const fetchSuggestions = async () => {
    const res = await automationService.suggestAssignee({
      title: form.title,
      description: form.description,
      teamId: form.teamId,
      jobRole: form.jobRole,
    });
    const eligible = eligibleCandidates(res.candidates);
    setCandidates(eligible);
    setDetectedRoles(res.detectedRoles || (form.jobRole ? [form.jobRole] : []));
    return { ...res, candidates: eligible, user: eligible[0] || null };
  };

  const handleAutoAssign = async () => {
    if (!form.jobRole) {
      toast.error("Select a job role so we can match the right developer");
      return;
    }
    try {
      setAutoAssigning(true);
      const res = await fetchSuggestions();
      const hasTeam = form.teamId && form.teamId !== "none";
      const pick = res.user;

      if (!hasTeam) {
        setShowSuggestModal(true);
        if (!res.candidates?.length) {
          toast.error(
            res.reason ||
              res.message ||
              `No free ${form.jobRole} member to suggest`,
          );
        }
        return;
      }

      if (!pick?.id) {
        setShowSuggestModal(true);
        toast.error(
          res.reason ||
            `No free ${form.jobRole} member with capacity right now`,
        );
        return;
      }

      applyAssignee(pick, res.reason || pick.reason);
      toast.success(`Auto-assigned to ${pick.username}`);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to auto-assign",
      );
    } finally {
      setAutoAssigning(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    if (!form.assignedToId) {
      if (autoAssignEnabled) {
        handleAutoAssign();
        return;
      }
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

      if (captureMetadata) {
        payload.captureMetadata = captureMetadata;
      }

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
                  {captureMetadata
                    ? "Add a title and description — page details are saved automatically"
                    : "Assign work to your workspace"}
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

            {captureMetadata?.website?.url && (
              <div className="mb-4 px-3 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-900/50">
                <p className="text-[10px] uppercase tracking-wider font-bold text-teal-700 dark:text-teal-300">
                  Captured from browser
                </p>
                <p className="text-xs text-teal-900/80 dark:text-teal-100/80 truncate mt-0.5">
                  {captureMetadata.website.url}
                </p>
                <p className="text-[11px] text-teal-700/70 dark:text-teal-200/60 mt-1">
                  Full page, browser, and device details stay hidden here and
                  appear in the task side drawer after create.
                </p>
                {captureMetadata.screenshot && (
                  <img
                    src={captureMetadata.screenshot}
                    alt="Page screenshot"
                    className="mt-2 w-full rounded-lg border border-teal-200/60 dark:border-teal-900/40 max-h-40 object-cover object-top"
                  />
                )}
              </div>
            )}

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

              {autoAssignEnabled && (
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    value={form.teamId}
                    onValueChange={(value) => {
                      setForm((p) => ({
                        ...p,
                        teamId: value,
                        assignedTo: "",
                        assignedToId: "",
                      }));
                      setAutoAssignHint("");
                    }}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select a workspace" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        No Workspace — suggest developers
                      </SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={form.jobRole || undefined}
                    onValueChange={(value) => {
                      setForm((p) => ({
                        ...p,
                        jobRole: value,
                        assignedTo: "",
                        assignedToId: "",
                      }));
                      setAutoAssignHint("");
                    }}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Job Role (required)" />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_ROLES.map((role) => (
                        <SelectItem key={role.key} value={role.key}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                {autoAssignEnabled ? (
                  <div className="flex gap-2">
                    <div className="relative min-w-0 flex-1">
                      <div className="flex h-12 items-center gap-2 rounded-md border border-input bg-transparent px-3">
                        {form.assignedToId ? (
                          <>
                            <span className="min-w-0 flex-1 truncate text-sm font-bold">
                              {form.assignedTo}
                            </span>
                            {autoAssignHint && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="shrink-0 rounded-sm p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
                                    aria-label="Why this developer"
                                    title={autoAssignHint}
                                  >
                                    <CircleHelp className="h-4 w-4" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  align="end"
                                  className="w-auto max-w-xs p-2"
                                >
                                  <span className="inline-flex items-center rounded-sm bg-[#FF914B]/15 px-3 py-1 text-[11px] font-semibold text-[#FF914B]">
                                    {autoAssignHint}
                                  </span>
                                </PopoverContent>
                              </Popover>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {form.teamId !== "none"
                              ? "Assign From This Workspace"
                              : "Suggest Developers!"}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAutoAssign}
                      disabled={autoAssigning}
                      className="h-12 w-12 bg-[#FF914B] px-4 text-white capitalize"
                    >
                      {autoAssigning ? (
                        <span className="loader w-4 h-4" />
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="relative min-w-0 flex-1">
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
                                <UserAvatar user={u} size="md" />
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

      {showSuggestModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[110]"
          onClick={() => setShowSuggestModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 max-w-md w-full p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  Suggested developers
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {detectedRoles.length
                    ? `Free ${detectedRoles.join(", ")} members with the lightest load`
                    : "Free members with the lightest load"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSuggestModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            {candidates.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No free {form.jobRole || "matching"} member right now. They
                may be busy, or nobody in the workspace has that role.
              </p>
            ) : (
              <div className="space-y-2">
                {candidates.map((person) => {
                  const isBusy = person.isBusy || person.availability === "busy";
                  return (
                    <div
                      key={person.id}
                      className={`w-full rounded-xl border p-3 text-left transition-colors ${
                        isBusy
                          ? "border-red-200/70 bg-red-50/50 opacity-80 dark:border-red-900/40 dark:bg-red-950/20"
                          : "border-gray-200 hover:border-[#FF914B]/50 hover:bg-[#FF914B]/5 dark:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => {
                            if (applyAssignee(person, person.reason)) {
                              toast.success(`Assigned to ${person.username}`);
                            }
                          }}
                          className={`flex min-w-0 flex-1 items-center gap-3 text-left ${
                            isBusy ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                        >
                          <UserAvatar user={person} size="lg" />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {person.username}
                              </span>
                              {person.jobRole &&
                                person.jobRole !== "unassigned" && (
                                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold capitalize text-gray-600 dark:bg-white/10 dark:text-gray-300">
                                    {person.jobRole}
                                  </span>
                                )}
                              {isBusy && (
                                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-500">
                                  Busy
                                </span>
                              )}
                              {person.recommended && !isBusy && (
                                <span className="rounded-full bg-[#FF914B]/15 px-2 py-0.5 text-[10px] font-semibold text-[#FF914B]">
                                  Suggested
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-[11px] text-gray-500 truncate">
                              {person.teamName}
                              {person.activeTaskCount != null
                                ? ` · ${person.activeTaskCount} open`
                                : ""}
                            </p>
                          </div>
                        </button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="shrink-0 rounded-sm p-1 uppercase text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
                              aria-label="Why this developer"
                              title={person.reason}
                            >
                              <CircleHelp className="h-4 w-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="end"
                            className="w-auto max-w-xs p-2"
                          >
                            <span className="inline-flex items-center rounded-sm bg-[#FF914B]/15 px-3 py-1 text-[11px] font-semibold text-[#FF914B]">
                              {person.reason}
                            </span>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
