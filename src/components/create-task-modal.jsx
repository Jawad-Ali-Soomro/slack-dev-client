import { useState, useEffect, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
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
  priority: "",
  assignedTo: "",
  assignedToId: "",
  dueDate: "",
  dueTime: "",
  projectId: "",
  repoId: "",
  teamId: "",
  jobRole: "",
};

const modalSubtitle = (captureMetadata) => {
  if (captureMetadata) {
    return "Add a title and description — page details are saved automatically";
  }
  return "Assign work to your workspace";
};

const captureUrl = (captureMetadata) => captureMetadata?.website?.url;

const repoSelectPlaceholder = (githubLoading) => {
  if (githubLoading) return "Loading your repositories...";
  return "Repository (optional)";
};

const assigneePlaceholder = (teamId) => {
  if (teamId && teamId !== "none") return "Assign From This Workspace";
  return "Suggest Developers!";
};

const suggestModalSubtitle = (detectedRoles) => {
  if (detectedRoles.length) {
    return `Free ${detectedRoles.join(", ")} members with the lightest load`;
  }
  return "Free members with the lightest load";
};

const emptyCandidatesCopy = (jobRole) => (
  <>
    No free {jobRole || "matching"} member right now. They
    may be busy, or nobody in the workspace has that role.
  </>
);

const candidateCardClass = (isBusy) => {
  if (isBusy) {
    return "w-full rounded-xl border p-3 text-left transition-colors border-red-200/70 bg-red-50/50 opacity-80 dark:border-red-900/40 dark:bg-red-950/20";
  }
  return "w-full rounded-xl border p-3 text-left transition-colors border-gray-200 hover:border-[#FF914B]/50 hover:bg-[#FF914B]/5 dark:border-white/10";
};

const candidateButtonClass = (isBusy) => {
  if (isBusy) {
    return "flex min-w-0 flex-1 items-center gap-3 text-left cursor-not-allowed";
  }
  return "flex min-w-0 flex-1 items-center gap-3 text-left cursor-pointer";
};

const suggestionRowClass = (isBusy) => {
  if (isBusy) {
    return "w-full px-4 py-3 text-left border-b border-gray-100 dark:border-white/5 last:border-0 opacity-60 cursor-not-allowed";
  }
  return "w-full px-4 py-3 text-left border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5";
};

const personDisplayName = (person) => person.username || person.name;

const candidateMetaLine = (person) => {
  if (person.activeTaskCount != null) {
    return `${person.teamName} · ${person.activeTaskCount} open`;
  }
  return person.teamName;
};

const showJobRoleBadge = (jobRole) =>
  Boolean(jobRole && jobRole !== "unassigned");

const CreateTaskModalHeader = ({ captureMetadata, onClose }) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <h2 className="text-lg font-black text-gray-900 dark:text-white">
        Create Task
      </h2>
      <p className="text-xs text-muted-foreground mt-0.5">
        {modalSubtitle(captureMetadata)}
      </p>
    </div>
    <button
      type="button"
      onClick={onClose}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"
    >
      <X size={18} />
    </button>
  </div>
);

const CaptureMetadataBanner = ({ captureMetadata }) => {
  const url = captureUrl(captureMetadata);
  if (!url) return null;

  return (
    <div className="mb-4 px-3 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-900/50">
      <p className="text-[10px] uppercase tracking-wider font-bold text-teal-700 dark:text-teal-300">
        Captured from browser
      </p>
      <p className="text-xs text-teal-900/80 dark:text-teal-100/80 truncate mt-0.5">
        {url}
      </p>
      <p className="text-[11px] text-teal-700/70 dark:text-teal-200/60 mt-1">
        Full page, browser, and device details stay hidden here and appear in
        the task side drawer after create.
      </p>
      {captureMetadata.screenshot ? (
        <img
          src={captureMetadata.screenshot}
          alt="Page screenshot"
          className="mt-2 w-full rounded-lg border border-teal-200/60 dark:border-teal-900/40 max-h-40 object-cover object-top"
        />
      ) : null}
    </div>
  );
};

const LockedRepositoryBanner = ({ repoName }) => (
  <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl bg-theme-subtle border border-theme-subtle">
    <FolderGit2 className="w-4 h-4 text-theme shrink-0" />
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
        GitHub Repository
      </p>
      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
        {repoName}
      </p>
    </div>
  </div>
);

const ConnectGithubPrompt = () => (
  <div className="mb-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10 p-4 text-center">
    <p className="text-sm text-muted-foreground mb-3">
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
);

const RepositorySelect = ({
  repoId,
  onRepoChange,
  githubLoading,
  githubRepos,
}) => (
  <div className="mb-4">
    <Select
      value={repoId || undefined}
      onValueChange={onRepoChange}
      disabled={githubLoading}
    >
      <SelectTrigger className="h-12">
        <SelectValue placeholder={repoSelectPlaceholder(githubLoading)} />
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
);

const RepositorySection = ({
  repository,
  isGithubConnected,
  form,
  setForm,
  githubLoading,
  githubRepos,
}) => {
  if (repository?.repoName) {
    return <LockedRepositoryBanner repoName={repository.repoName} />;
  }
  if (!isGithubConnected) {
    return <ConnectGithubPrompt />;
  }
  return (
    <RepositorySelect
      repoId={form.repoId}
      onRepoChange={(value) => setForm((p) => ({ ...p, repoId: value }))}
      githubLoading={githubLoading}
      githubRepos={githubRepos}
    />
  );
};

const AutoAssignFields = ({
  autoAssignEnabled,
  form,
  setForm,
  teams,
  setAutoAssignHint,
}) => {
  if (!autoAssignEnabled) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <Select
        value={form.teamId || undefined}
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
          <SelectItem value="none">No Workspace — suggest developers</SelectItem>
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
  );
};

const AutoAssignHintPopover = ({ autoAssignHint }) => {
  if (!autoAssignHint) return null;

  return (
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
      <PopoverContent align="end" className="w-auto max-w-xs p-2">
        <span className="inline-flex items-center rounded-sm bg-[#FF914B]/15 px-3 py-1 text-[11px] font-semibold text-[#FF914B]">
          {autoAssignHint}
        </span>
      </PopoverContent>
    </Popover>
  );
};

const AutoAssignAssigneeField = ({
  form,
  autoAssignHint,
  handleAutoAssign,
  autoAssigning,
}) => (
  <div className="flex gap-2">
    <div className="relative min-w-0 flex-1 rounded-[15px]">
      <div className="flex h-12 items-center gap-2 rounded-[15px] bg-black border border-gray-200 dark:border-white/10 bg-transparent px-3">
        {form.assignedToId ? (
          <>
            <span className="min-w-0 flex-1 truncate text-sm font-bold text-gray-900 dark:text-white">
              {form.assignedTo}
            </span>
            <AutoAssignHintPopover autoAssignHint={autoAssignHint} />
          </>
        ) : (
          <span className="text-sm text-muted-foreground">
            {assigneePlaceholder(form.teamId)}
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
);

const ManualAssigneeField = ({
  form,
  handleAssignedToChange,
  setShowSuggestions,
  showSuggestions,
  suggestions,
  selectUser,
}) => (
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
    {showSuggestions && suggestions.length > 0 ? (
      <div className="absolute z-[210] w-full mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-lg max-h-48 overflow-y-auto">
        {suggestions.map((u) => {
          const isBusy = u.availability === "busy";
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => selectUser(u)}
              aria-disabled={isBusy}
              className={suggestionRowClass(isBusy)}
            >
              <div className="flex items-center gap-3">
                <UserAvatar user={u} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {personDisplayName(u)}
                    </span>
                    {isBusy ? (
                      <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-500">
                        Busy
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    ) : null}
  </div>
);

const AssigneeSection = ({
  autoAssignEnabled,
  form,
  autoAssignHint,
  handleAutoAssign,
  autoAssigning,
  handleAssignedToChange,
  setShowSuggestions,
  showSuggestions,
  suggestions,
  selectUser,
}) => (
  <div>
    {autoAssignEnabled ? (
      <AutoAssignAssigneeField
        form={form}
        autoAssignHint={autoAssignHint}
        handleAutoAssign={handleAutoAssign}
        autoAssigning={autoAssigning}
      />
    ) : (
      <ManualAssigneeField
        form={form}
        handleAssignedToChange={handleAssignedToChange}
        setShowSuggestions={setShowSuggestions}
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        selectUser={selectUser}
      />
    )}
  </div>
);

const TaskFormFields = ({
  form,
  setForm,
  autoAssignEnabled,
  teams,
  setAutoAssignHint,
  autoAssignHint,
  handleAutoAssign,
  autoAssigning,
  handleAssignedToChange,
  setShowSuggestions,
  showSuggestions,
  suggestions,
  selectUser,
  projects,
}) => (
  <div className="space-y-4">
    <Input
      value={form.title}
      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
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
        value={form.priority || undefined}
        onValueChange={(value) => setForm((p) => ({ ...p, priority: value }))}
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
        onChange={(value) => setForm((p) => ({ ...p, dueDate: value }))}
        placeholder="Due date"
        disablePast
      />
    </div>

    <TimePicker
      value={form.dueTime}
      onChange={(value) => setForm((p) => ({ ...p, dueTime: value }))}
      placeholder="Due time"
    />

    <AutoAssignFields
      autoAssignEnabled={autoAssignEnabled}
      form={form}
      setForm={setForm}
      teams={teams}
      setAutoAssignHint={setAutoAssignHint}
    />

    <AssigneeSection
      autoAssignEnabled={autoAssignEnabled}
      form={form}
      autoAssignHint={autoAssignHint}
      handleAutoAssign={handleAutoAssign}
      autoAssigning={autoAssigning}
      handleAssignedToChange={handleAssignedToChange}
      setShowSuggestions={setShowSuggestions}
      showSuggestions={showSuggestions}
      suggestions={suggestions}
      selectUser={selectUser}
    />

    <Select
      value={form.projectId || undefined}
      onValueChange={(value) => setForm((p) => ({ ...p, projectId: value }))}
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
);

const CreateTaskFooter = ({ onClose, onSubmit, loading }) => (
  <div className="flex gap-3 mt-6">
    <Button variant="outline" onClick={onClose} className="flex-1 h-12">
      Cancel
    </Button>
    <Button onClick={onSubmit} disabled={loading} className="flex-1 h-12">
      {loading ? <span className="loader w-5 h-5" /> : "Create Task"}
    </Button>
  </div>
);

const CandidateBadges = ({ person, isBusy }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
      {person.username}
    </span>
    {showJobRoleBadge(person.jobRole) ? (
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground dark:bg-white/10">
        {person.jobRole}
      </span>
    ) : null}
    {isBusy ? (
      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-500">
        Busy
      </span>
    ) : null}
    {person.recommended && !isBusy ? (
      <span className="rounded-full bg-[#FF914B]/15 px-2 py-0.5 text-[10px] font-semibold text-[#FF914B]">
        Suggested
      </span>
    ) : null}
  </div>
);

const SuggestCandidateCard = ({ person, applyAssignee }) => {
  const isBusy = Boolean(person.isBusy || person.availability === "busy");

  return (
    <div key={person.id} className={candidateCardClass(isBusy)}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={isBusy}
          onClick={() => {
            if (applyAssignee(person, person.reason)) {
              toast.success(`Assigned to ${person.username}`);
            }
          }}
          className={candidateButtonClass(isBusy)}
        >
          <UserAvatar user={person} size="lg" />
          <div className="min-w-0 flex-1">
            <CandidateBadges person={person} isBusy={isBusy} />
            <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
              {candidateMetaLine(person)}
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
          <PopoverContent align="end" className="w-auto max-w-xs p-2">
            <span className="inline-flex items-center rounded-sm bg-[#FF914B]/15 px-3 py-1 text-[11px] font-semibold text-[#FF914B]">
              {person.reason}
            </span>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

const SuggestCandidatesList = ({ candidates, form, applyAssignee }) => {
  if (candidates.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyCandidatesCopy(form.jobRole)}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {candidates.map((person) => (
        <SuggestCandidateCard
          key={person.id}
          person={person}
          applyAssignee={applyAssignee}
        />
      ))}
    </div>
  );
};

const SuggestDevelopersModal = ({
  showSuggestModal,
  setShowSuggestModal,
  detectedRoles,
  candidates,
  form,
  applyAssignee,
}) => {
  if (!showSuggestModal) return null;

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[110]"
      onClick={() => setShowSuggestModal(false)}
    >
      <m.div
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
            <p className="text-xs text-muted-foreground mt-0.5">
              {suggestModalSubtitle(detectedRoles)}
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

        <SuggestCandidatesList
          candidates={candidates}
          form={form}
          applyAssignee={applyAssignee}
        />
      </m.div>
    </m.div>
  );
};

const CreateTaskModalPanel = ({
  onClose,
  captureMetadata,
  repository,
  isGithubConnected,
  form,
  setForm,
  githubLoading,
  githubRepos,
  autoAssignEnabled,
  teams,
  setAutoAssignHint,
  autoAssignHint,
  handleAutoAssign,
  autoAssigning,
  handleAssignedToChange,
  setShowSuggestions,
  showSuggestions,
  suggestions,
  selectUser,
  projects,
  handleSubmit,
  loading,
}) => (
  <m.div
    initial={{ scale: 0.95, opacity: 0, y: 12 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    exit={{ scale: 0.95, opacity: 0, y: 12 }}
    className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
    onClick={(e) => e.stopPropagation()}
  >
    <CreateTaskModalHeader
      captureMetadata={captureMetadata}
      onClose={onClose}
    />
    <CaptureMetadataBanner captureMetadata={captureMetadata} />
    <RepositorySection
      repository={repository}
      isGithubConnected={isGithubConnected}
      form={form}
      setForm={setForm}
      githubLoading={githubLoading}
      githubRepos={githubRepos}
    />
    <TaskFormFields
      form={form}
      setForm={setForm}
      autoAssignEnabled={autoAssignEnabled}
      teams={teams}
      setAutoAssignHint={setAutoAssignHint}
      autoAssignHint={autoAssignHint}
      handleAutoAssign={handleAutoAssign}
      autoAssigning={autoAssigning}
      handleAssignedToChange={handleAssignedToChange}
      setShowSuggestions={setShowSuggestions}
      showSuggestions={showSuggestions}
      suggestions={suggestions}
      selectUser={selectUser}
      projects={projects}
    />
    <CreateTaskFooter
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
    />
  </m.div>
);

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
      repoId: repository?.repoId ? String(repository.repoId) : "",
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
    if (!form.priority) {
      toast.error("Please select a priority");
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
      {open ? (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
          onClick={() => onOpenChange(false)}
        >
          <CreateTaskModalPanel
            onClose={() => onOpenChange(false)}
            captureMetadata={captureMetadata}
            repository={repository}
            isGithubConnected={isGithubConnected}
            form={form}
            setForm={setForm}
            githubLoading={githubLoading}
            githubRepos={githubRepos}
            autoAssignEnabled={autoAssignEnabled}
            teams={teams}
            setAutoAssignHint={setAutoAssignHint}
            autoAssignHint={autoAssignHint}
            handleAutoAssign={handleAutoAssign}
            autoAssigning={autoAssigning}
            handleAssignedToChange={handleAssignedToChange}
            setShowSuggestions={setShowSuggestions}
            showSuggestions={showSuggestions}
            suggestions={suggestions}
            selectUser={selectUser}
            projects={projects}
            handleSubmit={handleSubmit}
            loading={loading}
          />
        </m.div>
      ) : null}

      <SuggestDevelopersModal
        showSuggestModal={showSuggestModal}
        setShowSuggestModal={setShowSuggestModal}
        detectedRoles={detectedRoles}
        candidates={candidates}
        form={form}
        applyAssignee={applyAssignee}
      />
    </AnimatePresence>
  );
}
