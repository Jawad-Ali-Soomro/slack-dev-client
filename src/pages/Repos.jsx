import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsPlusCircleFill } from "react-icons/bs";
import {
  Search,
  CircleDot,
  Lock,
  Globe,
  ExternalLink,
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
import useGithubRepos, { connectGithub } from "@/hooks/use-github-repos";
import { usePermissions } from "../hooks/use-permissions";
import HorizontalLoader from "../components/horizontal-loader";
import LanguageIcon from "@/components/languages";
import CreateTaskModal from "../components/create-task-modal";
import LiveStatChips, {
  BarcodeSpark,
  MiniProgress,
  StreakHeatmap,
  buildDailySeries,
} from "../components/live-stat-chips";
import { TbStarFilled } from "react-icons/tb";
import { PiGitForkFill } from "react-icons/pi";
import {
  TableWindowSpacer,
  useWindowedRows,
} from "../components/windowed-table-rows";

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

const Repos = () => {
  const navigate = useNavigate();
  const { repos, loading, isGithubConnected } = useGithubRepos();
  const { permissions } = usePermissions();

  const [searchTerm, setSearchTerm] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [taskRepo, setTaskRepo] = useState(null);
  const [queue, setQueue] = useState([]);
  const tableScrollRef = useRef(null);

  document.title = "Repositories";

  const repoStats = useMemo(() => {
    const publicCount = repos.filter((repo) => !repo.private).length;
    const privateCount = repos.filter((repo) => repo.private).length;
    const issues = repos.reduce(
      (sum, repo) => sum + (repo.open_issues_count || 0),
      0,
    );
    return {
      total: repos.length,
      publicCount,
      privateCount,
      issues,
      series: buildDailySeries(
        repos.map((repo) => ({ updatedAt: repo.updated_at || repo.pushed_at })),
      ),
    };
  }, [repos]);

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
  const repoWindow = useWindowedRows({
    count: filteredRepos.length,
    scrollRef: tableScrollRef,
  });
  const visibleRepos = filteredRepos.slice(repoWindow.start, repoWindow.end);

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


  const advanceQueue = () => {
    if (queue.length === 0) {
      setSelectedRepos([]);
      setQueue([]);
      return;
    }
    const [next, ...rest] = queue;
    setTaskRepo({ repoId: String(next.id), repoName: next.name });
    setQueue(rest);
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
          className="h-12 w-[200px] rounded-[15px] font-bold"
        >
          <Github className="w-4 h-4 mr-2" />
          Connect GitHub
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative max-w-3xl bg-white rounded-2xl dark:bg-[black]">
            <Search className="absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-13 w-full pl-10 pr-4 md:w-[500px] dark:bg-[black]"
            />
          </div>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="h-13 w-full cursor-pointer bg-white px-5 dark:bg-black dark:text-white md:w-[180px]">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[black]">
              <SelectItem className="h-10 cursor-pointer px-5" value="all">
                All Repositories
              </SelectItem>
              <SelectItem className="h-10 cursor-pointer px-5" value="public">
                Public
              </SelectItem>
              <SelectItem className="h-10 cursor-pointer px-5" value="private">
                Private
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selectedRepos.length > 0 && (
          <Button
            onClick={handleBulkCreateTasks}
            className="h-12 w-full rounded-[15px] font-bold md:w-[200px]"
          >
            <BsPlusCircleFill className="mr-2 h-4 w-4" />
            Create Tasks ({selectedRepos.length})
          </Button>
        )}
      </div>

      <div className="mb-6">
        <LiveStatChips
          items={[
            {
              id: "total",
              label: "Total Repos",
              value: repoStats.total,
              onClick: () => setVisibility("all"),
              visual: <BarcodeSpark series={repoStats.series.slice(-28)} />,
            },
            {
              id: "public",
              label: "Public Repos",
              value: repoStats.publicCount,
              onClick: () => setVisibility("public"),
              visual: <StreakHeatmap series={repoStats.series} />,
            },
            {
              id: "private",
              label: "Private Repos",
              value: repoStats.privateCount,
              onClick: () => setVisibility("private"),
              visual: <MiniProgress value={repoStats.total ? Math.round((repoStats.privateCount / repoStats.total) * 100) : 0} />,
            },
            {
              id: "issues",
              label: "Open Issues",
              value: repoStats.issues,
              visual: (
                <MiniProgress
                  value={Math.min(100, repoStats.issues)}
                  fillClassName="bg-rose-300 dark:bg-rose-500"
                />
              ),
            },
          ]}
        />
      </div>

      <div className="overflow-hidden rounded-[15px] bg-white shadow-xl dark:bg-transparent">
        <div
          ref={tableScrollRef}
          className="max-h-[630px] overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
        >
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky top-0 z-10 w-12 border-b bg-white py-4 pl-6 text-left dark:border-gray-700">
                  <Checkbox
                    checked={headerChecked}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all repositories"
                  />
                </th>
                <th className="sticky top-0 z-10 border-b bg-white px-6 py-4 text-left text-xs uppercase tracking-wider text-black dark:border-gray-700">
                  Repository
                </th>
                <th className="sticky top-0 z-10 border-b bg-white px-6 py-4 text-left text-xs uppercase tracking-wider text-black dark:border-gray-700">
                  Visibility
                </th>
                <th className="sticky top-0 z-10 border-b bg-white px-6 py-4 text-left text-xs uppercase tracking-wider text-black dark:border-gray-700">
                  Language
                </th>
                <th className="sticky top-0 z-10 border-b bg-white px-6 py-4 text-left text-xs uppercase tracking-wider text-black dark:border-gray-700">
                  Stats
                </th>
                <th className="sticky top-0 z-10 border-b bg-white px-6 py-4 text-left text-xs uppercase tracking-wider text-black dark:border-gray-700">
                  Updated
                </th>
                <th className="sticky top-0 z-10 border-b bg-white px-6 py-4 text-left dark:border-gray-700" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRepos.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No repositories found
                  </td>
                </tr>
              ) : (
                <>
                  <TableWindowSpacer
                    height={repoWindow.paddingTop}
                    colSpan={7}
                  />
                  {visibleRepos.map((repo) => {
                  const id = String(repo.id);
                  const selected = selectedRepos.includes(id);
                  return (
                    <tr
                      key={id}
                      onClick={() => navigate(`/dashboard/repos/${id}`)}
                      className={cn(
                        "cursor-pointer bg-white transition-colors hover:bg-gray-50 dark:bg-black dark:hover:bg-transparent",
                        selected && "bg-gray-100 dark:bg-transparent",
                      )}
                    >
                      <td
                        className="w-12 py-4 pl-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => handleSelectRepo(id)}
                          aria-label={`Select ${repo.name}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gray-100 dark:bg-white/10">
                            <FolderGit2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                              {repo.name}
                            </div>
                            <div className="max-w-[320px] truncate text-xs text-gray-500 dark:text-gray-400">
                              {repo.description || repo.full_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                          {repo.private ? (
                            <Lock className="h-3.5 w-3.5" />
                          ) : (
                            <Globe className="h-3.5 w-3.5" />
                          )}
                          {repo.private ? "Private" : "Public"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {repo.language ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                            <LanguageIcon language={repo.language} />
                            {repo.language}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="inline-flex items-center gap-1" title="Stars">
                            <TbStarFilled className="h-3.5 w-3.5" />
                            {formatNumber(repo.stargazers_count)}
                          </span>
                          <span className="inline-flex items-center gap-1" title="Forks">
                            <PiGitForkFill className="h-3.5 w-3.5" />
                            {formatNumber(repo.forks_count)}
                          </span>
                          <span className="inline-flex items-center gap-1" title="Open issues">
                            <CircleDot className="h-3.5 w-3.5" />
                            {formatNumber(repo.open_issues_count)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(repo.updated_at || repo.pushed_at)}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 justify-center rounded-[10px] p-0"
                            title={`Create task for ${repo.name}`}
                            onClick={() => openTaskForRepo(repo)}
                          >
                            <BsPlusCircleFill className="h-4 w-4" />
                          </Button>
                          {repo.html_url && (
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noreferrer"
                              title="Open on GitHub"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                  <TableWindowSpacer
                    height={repoWindow.paddingBottom}
                    colSpan={7}
                  />
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
