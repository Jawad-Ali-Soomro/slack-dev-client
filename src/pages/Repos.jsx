import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Star,
  GitFork,
  CircleDot,
  Lock,
  Globe,
  ExternalLink,
  ChevronRight,
  Plus,
  Github,
  FolderGit2,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { cn } from "../lib/utils";
import useGithubRepos, { connectGithub } from "@/hooks/useGithubRepos";
import { usePermissions } from "../hooks/usePermissions";
import HorizontalLoader from "../components/HorizontalLoader";
import LanguageIcon from "@/components/Languages";
import CreateTaskModal from "../components/CreateTaskModal";

const formatNumber = (n) => {
  if (n == null) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const VisibilityBadge = ({ isPrivate }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 py-1 pl-1 pr-3 rounded-full text-xs font-semibold border",
      isPrivate
        ? "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20"
        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    )}
  >
    <span
      className={cn(
        "flex items-center justify-center w-5 h-5 rounded-full text-white shadow-sm",
        isPrivate
          ? "bg-gradient-to-br from-slate-500 to-gray-600"
          : "bg-gradient-to-br from-emerald-500 to-green-500",
      )}
    >
      {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
    </span>
    {isPrivate ? "Private" : "Public"}
  </span>
);

const Repos = () => {
  const navigate = useNavigate();
  const { repos, loading, isGithubConnected } = useGithubRepos();
  const { permissions } = usePermissions();

  const [searchTerm, setSearchTerm] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [taskRepo, setTaskRepo] = useState(null);
  const [queue, setQueue] = useState([]);

  document.title = "Repositories";

  const filteredRepos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return repos.filter((repo) => {
      const matchesSearch =
        !term ||
        repo.name?.toLowerCase().includes(term) ||
        repo.full_name?.toLowerCase().includes(term) ||
        repo.language?.toLowerCase().includes(term) ||
        repo.description?.toLowerCase().includes(term);
      const matchesVisibility =
        visibility === "all" ||
        (visibility === "private" && repo.private) ||
        (visibility === "public" && !repo.private);
      return matchesSearch && matchesVisibility;
    });
  }, [repos, searchTerm, visibility]);

  const allIds = useMemo(
    () => filteredRepos.map((r) => String(r.id)),
    [filteredRepos],
  );

  const headerChecked =
    allIds.length === 0
      ? false
      : selectedRepos.length === allIds.length
        ? true
        : selectedRepos.length > 0
          ? "indeterminate"
          : false;

  const handleSelectAll = () => {
    setSelectedRepos((prev) => (prev.length === allIds.length ? [] : allIds));
  };

  const handleSelectRepo = (id) => {
    setSelectedRepos((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const openTaskForRepo = (repo) => {
    if (!permissions.canCreateTask) {
      toast.error(
        "You do not have permission to create tasks. Contact an admin.",
      );
      return;
    }
    setQueue([]);
    setTaskRepo({ repoId: String(repo.id), repoName: repo.name });
  };

  const handleBulkCreateTasks = () => {
    if (!permissions.canCreateTask) {
      toast.error(
        "You do not have permission to create tasks. Contact an admin.",
      );
      return;
    }
    const selected = filteredRepos.filter((r) =>
      selectedRepos.includes(String(r.id)),
    );
    if (selected.length === 0) {
      toast.error("No repositories selected");
      return;
    }
    const [first, ...rest] = selected;
    setQueue(rest);
    setTaskRepo({ repoId: String(first.id), repoName: first.name });
  };

  // Called after a task is successfully created; advances to the next queued repo.
  const advanceQueue = () => {
    setQueue((prev) => {
      if (prev.length === 0) {
        setSelectedRepos([]);
        return [];
      }
      const [next, ...rest] = prev;
      setTaskRepo({ repoId: String(next.id), repoName: next.name });
      return rest;
    });
  };

  if (loading && repos.length === 0) {
    return (
      <HorizontalLoader
        message="Loading repositories..."
        subMessage="Fetching your GitHub data"
        progress={70}
        className="min-h-[60vh]"
      />
    );
  }

  if (!isGithubConnected) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <Github className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          GitHub not connected
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
          Connect your GitHub account to browse all your repositories here.
        </p>
        <Button
          onClick={connectGithub}
          className="rounded-[12px] bg-theme hover:bg-theme text-white"
        >
          <Github className="w-4 h-4 mr-2" />
          Connect GitHub
        </Button>
      </div>
    );
  }

  return (
    <div className="ambient-light">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 py-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="rounded-[12px] w-[150px]"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>
          <div className="flex p-2 border-2 items-center gap-2 pr-5 rounded-[15px] fixed z-10 md:top-3 -top-10">
            <div className="flex p-3 bg-white dark:bg-gray-800 rounded-[15px]">
              <FolderGit2 size={15} />
            </div>
            <h1 className="text-2xl font-bold">
              Repositories
              <span className="text-gray-400 font-medium">
                {" "}
                ({repos.length})
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 md:max-w-[500px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 icon" />
            <Input
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full bg-white dark:bg-[black] text-black dark:text-white border border-gray-200 dark:border-gray-700 rounded-[15px]"
            />
          </div>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="md:w-[200px] w-full px-5 text-gray-600 dark:text-white cursor-pointer bg-white dark:bg-[black] h-12 rounded-[15px]">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="px-5 cursor-pointer h-10" value="all">
                All Repositories
              </SelectItem>
              <SelectItem className="px-5 cursor-pointer h-10" value="public">
                Public
              </SelectItem>
              <SelectItem className="px-5 cursor-pointer h-10" value="private">
                Private
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Bulk actions bar */}
      {selectedRepos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 mb-3 px-4 py-3 rounded-[15px] border border-theme-subtle bg-theme-subtle"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {selectedRepos.length} repositor
            {selectedRepos.length > 1 ? "ies" : "y"} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-[12px]"
              onClick={() => setSelectedRepos([])}
            >
              Clear
            </Button>
            <Button
              size="sm"
              className="rounded-[12px] bg-theme hover:bg-theme text-white"
              onClick={handleBulkCreateTasks}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Tasks ({selectedRepos.length})
            </Button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="overflow-x-auto max-h-[700px] overflow-y-auto rounded-[15px] border border-gray-100 dark:border-white/10 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm sticky top-0 z-10">
              <tr>
                <th className="px-5 py-4 text-left w-12">
                  <Checkbox
                    checked={headerChecked}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all repositories"
                  />
                </th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Repository
                </th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Visibility
                </th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-5 py-4 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredRepos.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-black"
                  >
                    No repositories found
                  </td>
                </tr>
              ) : (
                filteredRepos.map((repo) => {
                  const id = String(repo.id);
                  const selected = selectedRepos.includes(id);
                  return (
                    <tr
                      key={id}
                      onClick={() => navigate(`/dashboard/repos/${id}`)}
                      className={cn(
                        "bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group",
                        selected && "bg-theme-subtle dark:bg-white/5",
                      )}
                    >
                      <td
                        className="px-5 py-3 w-12"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => handleSelectRepo(id)}
                          aria-label={`Select ${repo.name}`}
                        />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-9 h-9 rounded-[12px] bg-gray-100 dark:bg-white/10 flex items-center justify-center ring-1 ring-gray-100 dark:ring-white/10">
                            <FolderGit2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-theme">
                              {repo.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[320px]">
                              {repo.description || repo.full_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <VisibilityBadge isPrivate={repo.private} />
                      </td>
                      <td className="px-5 py-3">
                        {repo.language ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                            <LanguageIcon language={repo.language} />
                            {repo.language}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span
                            className="inline-flex items-center gap-1"
                            title="Stars"
                          >
                            <Star className="w-3.5 h-3.5" />
                            {formatNumber(repo.stargazers_count)}
                          </span>
                          <span
                            className="inline-flex items-center gap-1"
                            title="Forks"
                          >
                            <GitFork className="w-3.5 h-3.5" />
                            {formatNumber(repo.forks_count)}
                          </span>
                          <span
                            className="inline-flex items-center gap-1"
                            title="Open issues"
                          >
                            <CircleDot className="w-3.5 h-3.5" />
                            {formatNumber(repo.open_issues_count)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(repo.updated_at || repo.pushed_at)}
                        </span>
                      </td>
                      <td
                        className="px-5 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-9 h-9 justify-center rounded-[12px]"
                            title={`Create task for ${repo.name}`}
                            onClick={() => openTaskForRepo(repo)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          {repo.html_url && (
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noreferrer"
                              title="Open on GitHub"
                              className="inline-flex items-center justify-center w-9 h-9 rounded-[12px] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-theme transition-colors" />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <CreateTaskModal
        open={!!taskRepo}
        onOpenChange={(open) => !open && setTaskRepo(null)}
        repository={taskRepo}
        onCreated={advanceQueue}
      />
    </div>
  );
};

export default Repos;
