import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  GitFork,
  Eye,
  CircleDot,
  GitPullRequest,
  GitPullRequestClosed,
  Users,
  GitBranch,
  GitCommit,
  ExternalLink,
  Lock,
  Globe,
  Scale,
  Calendar,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Code2,
  Plus,
  X,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import useGithubRepos from "@/hooks/useGithubRepos";
import { getRepoExtraDetails, createGithubPullRequest } from "@/hooks/githubHooks";
import HorizontalLoader from "@/components/HorizontalLoader";
import { PiUsersDuotone } from "react-icons/pi";

const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  HTML: "#e34c26",
  CSS: "#563d7c",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  Vue: "#41b883",
};

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatNumber = (n) => {
  if (n == null) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="dashboard-card flex items-center gap-3 p-4 rounded-[15px] border border-gray-100 dark:border-white/10 bg-white dark:bg-[rgba(255,255,255,.05)]">
    <div
      className="flex-shrink-0 w-11 h-11 rounded-[12px] flex items-center justify-center"
      style={{ background: accent || "var(--theme-accent, #ff914b)" }}
    >
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xl font-black text-gray-900 dark:text-white leading-none">
        {value}
      </p>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">
        {label}
      </p>
    </div>
  </div>
);

const StateBadge = ({ state, merged }) => {
  if (merged) {
    return (
      <Badge className="bg-purple-500/90 text-white border-none">Merged</Badge>
    );
  }
  if (state === "closed") {
    return (
      <Badge className="bg-red-500/90 text-white border-none">Closed</Badge>
    );
  }
  return (
    <Badge className="bg-green-500/90 text-white border-none">Open</Badge>
  );
};

const AccordionItem = ({ item, type }) => {
  const [open, setOpen] = useState(false);
  const isPr = type === "pr";
  const merged = Boolean(item.merged_at);

  return (
    <div className="rounded-[15px] border border-gray-100 dark:border-white/10 bg-white dark:bg-[rgba(255,255,255,.04)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex-shrink-0">
          {isPr ? (
            merged ? (
              <GitPullRequestClosed className="w-5 h-5 text-purple-500" />
            ) : item.state === "closed" ? (
              <GitPullRequestClosed className="w-5 h-5 text-red-500" />
            ) : (
              <GitPullRequest className="w-5 h-5 text-green-500" />
            )
          ) : item.state === "closed" ? (
            <CheckCircle2 className="w-5 h-5 text-purple-500" />
          ) : (
            <CircleDot className="w-5 h-5 text-green-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {item.title}
            </span>
            <span className="text-xs text-gray-400">#{item.number}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            opened by {item.user?.login || "unknown"} · {formatDate(item.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StateBadge state={item.state} merged={merged} />
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-white/10">
          {item.body ? (
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words max-h-60 overflow-y-auto mt-3">
              {item.body}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic mt-3">
              No description provided.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-4">
            {(item.labels || []).map((label) => (
              <span
                key={label.id || label.name}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{
                  backgroundColor: `#${label.color || "999"}22`,
                  color: `#${label.color || "999"}`,
                  border: `1px solid #${label.color || "999"}55`,
                }}
              >
                {label.name}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
            {isPr && item.base?.ref && item.head?.ref && (
              <span className="flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5" />
                {item.head.ref} → {item.base.ref}
              </span>
            )}
            {item.comments != null && (
              <span>{item.comments} comments</span>
            )}
            <a
              href={item.html_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-theme hover:underline ml-auto"
            >
              View on GitHub <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

const CollapsibleSection = ({
  icon: Icon,
  title,
  count,
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="dashboard-card rounded-[18px] border border-gray-100 dark:border-white/10 bg-white dark:bg-[rgba(255,255,255,.05)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-2 p-5 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <Icon className="w-4 h-4 icon" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          {title}
          {count ? (
            <span className="text-gray-400 font-medium"> ({count})</span>
          ) : null}
        </h3>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-5 pb-5 pt-0">{children}</div>}
    </div>
  );
};

const RepoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { repos, loading: reposLoading, isGithubConnected } = useGithubRepos();

  const [section, setSection] = useState("pulls");
  const [extra, setExtra] = useState(null);
  const [extraLoading, setExtraLoading] = useState(false);
  const [createdPulls, setCreatedPulls] = useState([]);
  const [showPrModal, setShowPrModal] = useState(false);
  const [prForm, setPrForm] = useState({ title: "", body: "", head: "", base: "" });
  const [creatingPr, setCreatingPr] = useState(false);

  const githubToken = user?.socialLinks?.github?.accessToken ?? null;

  const repo = useMemo(
    () => repos.find((r) => String(r.id) === String(id)) || null,
    [repos, id],
  );

  useEffect(() => {
    document.title = repo ? `${repo.name} - Repository` : "Repository";
  }, [repo]);

  const loadExtra = useCallback(async () => {
    if (!repo || !githubToken) return;
    const owner = repo.owner?.login;
    if (!owner) return;
    try {
      setExtraLoading(true);
      const data = await getRepoExtraDetails(githubToken, owner, repo.name);
      setExtra(data);
    } catch (err) {
      console.error(err);
    } finally {
      setExtraLoading(false);
    }
  }, [repo, githubToken]);

  useEffect(() => {
    loadExtra();
  }, [loadExtra]);

  const pulls = useMemo(
    () => [...createdPulls, ...(repo?.pulls || [])],
    [repo, createdPulls],
  );
  const issues = useMemo(
    () => (repo?.issues || []).filter((i) => !i.pull_request),
    [repo],
  );
  const branches = useMemo(() => extra?.branches || [], [extra]);

  const defaultBranch = repo?.default_branch || "main";

  const openCreatePr = useCallback(
    (headBranch = "") => {
      setPrForm({
        title: "",
        body: "",
        head: headBranch,
        base: defaultBranch,
      });
      setShowPrModal(true);
    },
    [defaultBranch],
  );

  const handleCreatePr = async (e) => {
    e?.preventDefault();
    if (!repo || !githubToken) return;
    const owner = repo.owner?.login;
    if (!owner) return;

    if (!prForm.title.trim()) {
      toast.error("Please enter a title for the pull request.");
      return;
    }
    if (!prForm.head || !prForm.base) {
      toast.error("Please select both base and compare branches.");
      return;
    }
    if (prForm.head === prForm.base) {
      toast.error("Base and compare branches must be different.");
      return;
    }

    try {
      setCreatingPr(true);
      const newPr = await createGithubPullRequest(githubToken, owner, repo.name, {
        title: prForm.title.trim(),
        body: prForm.body,
        head: prForm.head,
        base: prForm.base,
      });
      setCreatedPulls((prev) => [newPr, ...prev]);
      setShowPrModal(false);
      setSection("pulls");
      toast.success(`Pull request #${newPr.number} created!`);
    } catch (err) {
      toast.error(err.message || "Failed to create pull request");
    } finally {
      setCreatingPr(false);
    }
  };

  const languages = extra?.languages || {};
  const languageEntries = useMemo(() => {
    const entries = Object.entries(languages);
    const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0) || 1;
    return entries
      .map(([name, bytes]) => ({
        name,
        bytes,
        percent: (bytes / total) * 100,
      }))
      .sort((a, b) => b.bytes - a.bytes);
  }, [languages]);

  if (reposLoading && !repo) {
    return (
      <HorizontalLoader
        message="Loading repository..."
        subMessage="Fetching your GitHub data"
        progress={60}
        className="min-h-[60vh]"
      />
    );
  }

  if (!repo) {
    return (
      <div className="dashboard-page min-h-[60vh] flex flex-col items-center justify-center text-center">
        <Code2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Repository not found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
          {isGithubConnected
            ? "We couldn't find this repository in your account."
            : "Connect your GitHub account to view repository details."}
        </p>
        <Button onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="dashboard-page min-h-screen pt-2 md:pt-4 pb-16">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-6 rounded-[12px]"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-card p-6 rounded-[18px] border border-gray-100 dark:border-white/10 bg-white dark:bg-[rgba(255,255,255,.05)] mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white break-words">
                {repo.name}
              </h1>
              <Badge
                className={
                  repo.private
                    ? "bg-gray-700 text-white border-none"
                    : "bg-theme text-white border-none"
                }
              >
                {repo.private ? (
                  <Lock className="w-3 h-3 mr-1" />
                ) : (
                  <Globe className="w-3 h-3 mr-1" />
                )}
                {repo.private ? "Private" : "Public"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {repo.full_name}
            </p>
            {repo.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 max-w-2xl">
                {repo.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
              {repo.language && (
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: LANGUAGE_COLORS[repo.language] || "#8b949e",
                    }}
                  />
                  {repo.language}
                </span>
              )}
              {repo.license?.name && (
                <span className="flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5" />
                  {repo.license.spdx_id || repo.license.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Updated {formatDate(repo.updated_at)}
              </span>
            </div>
          </div>

          <a href={repo.html_url} target="_blank" rel="noreferrer">
            <Button className="rounded-[12px] whitespace-nowrap w-[200px]">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open on GitHub
            </Button>
          </a>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard
          icon={Star}
          label="Stars"
          value={formatNumber(repo.stargazers_count)}
          accent="#eab308"
        />
        <StatCard
          icon={GitFork}
          label="Forks"
          value={formatNumber(repo.forks_count)}
          accent="#3b82f6"
        />
        <StatCard
          icon={Eye}
          label="Watchers"
          value={formatNumber(repo.watchers_count)}
          accent="#8b5cf6"
        />
        <StatCard
          icon={GitPullRequest}
          label="Open PRs"
          value={formatNumber(pulls.length)}
          accent="#22c55e"
        />
        <StatCard
          icon={CircleDot}
          label="Open Issues"
          value={formatNumber(issues.length)}
          accent="#ef4444"
        />
        <StatCard
          icon={GitBranch}
          label="Branches"
          value={formatNumber(extra?.branches?.length)}
          accent="#06b6d4"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: PRs / Issues / Branches */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <button
              type="button"
              onClick={() => setSection("pulls")}
              className={`flex-1 min-w-[150px] flex items-center justify-center h-12 rounded-[15px] text-sm font-semibold transition-colors gap-2 ${
                section === "pulls"
                  ? "bg-theme text-white"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300"
              }`}
            >
              <GitPullRequest className="w-4 h-4" />
              Pull Requests ({pulls.length})
            </button>
            <button
              type="button"
              onClick={() => setSection("issues")}
              className={`flex-1 min-w-[150px] flex items-center justify-center h-12 rounded-[15px] text-sm font-semibold transition-colors gap-2 ${
                section === "issues"
                  ? "bg-theme text-white"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300"
              }`}
            >
              <CircleDot className="w-4 h-4" />
              Issues ({issues.length})
            </button>
            <button
              type="button"
              onClick={() => setSection("branches")}
              className={`flex-1 min-w-[150px] flex items-center justify-center h-12 rounded-[15px] text-sm font-semibold transition-colors gap-2 ${
                section === "branches"
                  ? "bg-theme text-white"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300"
              }`}
            >
              <GitBranch className="w-4 h-4" />
              Branches ({branches.length})
            </button>
          </div>

          {/* New PR button */}
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => openCreatePr()}
              className="rounded-[12px] w-[200px] bg-theme hover:bg-theme text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Pull Request
            </Button>
          </div>

          <div className="space-y-3">
            {section === "pulls" &&
              (pulls.length > 0 ? (
                pulls.map((pr) => (
                  <AccordionItem key={pr.id} item={pr} type="pr" />
                ))
              ) : (
                <div className="text-center py-12 rounded-[15px] border border-dashed border-gray-200 dark:border-white/10">
                  <GitPullRequest className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No open pull requests.
                  </p>
                </div>
              ))}

            {section === "issues" &&
              (issues.length > 0 ? (
                issues.map((issue) => (
                  <AccordionItem key={issue.id} item={issue} type="issue" />
                ))
              ) : (
                <div className="text-center py-12 rounded-[15px] border border-dashed border-gray-200 dark:border-white/10">
                  <AlertCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No open issues.
                  </p>
                </div>
              ))}

            {section === "branches" &&
              (extraLoading ? (
                <div className="text-center py-12 rounded-[15px] border border-dashed border-gray-200 dark:border-white/10">
                  <Loader2 className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3 animate-spin" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Loading branches…
                  </p>
                </div>
              ) : branches.length > 0 ? (
                branches.map((branch) => (
                  <div
                    key={branch.name}
                    className="flex items-center gap-3 p-4 rounded-[15px] border border-gray-100 dark:border-white/10 bg-white dark:bg-[rgba(255,255,255,.04)]"
                  >
                    <GitBranch className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {branch.name}
                        </span>
                        {branch.name === defaultBranch && (
                          <Badge className="bg-theme text-white border-none text-[10px]">
                            default
                          </Badge>
                        )}
                        {branch.protected && (
                          <Badge className="bg-gray-700 text-white border-none text-[10px]">
                            protected
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">
                        {branch.commit?.sha?.slice(0, 7)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-[12px] w-[150px] flex-shrink-0"
                      onClick={() => openCreatePr(branch.name)}
                    >
                      <GitPullRequest className="w-3.5 h-3.5 mr-1.5" />
                      Create PR
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 rounded-[15px] border border-dashed border-gray-200 dark:border-white/10">
                  <GitBranch className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No branches found.
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="space-y-6">
          {/* Languages */}
          {languageEntries.length > 0 && (
            <CollapsibleSection
              icon={Code2}
              title="Languages"
              count={languageEntries.length}
            >
              <div className="flex h-2.5 rounded-full overflow-hidden mb-4 mt-1">
                {languageEntries.map((lang) => (
                  <div
                    key={lang.name}
                    style={{
                      width: `${lang.percent}%`,
                      background: LANGUAGE_COLORS[lang.name] || "#8b949e",
                    }}
                    title={`${lang.name} ${lang.percent.toFixed(1)}%`}
                  />
                ))}
              </div>
              <div className="space-y-2">
                {languageEntries.map((lang) => (
                  <div
                    key={lang.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          background: LANGUAGE_COLORS[lang.name] || "#8b949e",
                        }}
                      />
                      {lang.name}
                    </span>
                    <span className="text-gray-400">
                      {lang.percent.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Contributors */}
          <CollapsibleSection
            icon={PiUsersDuotone}
            title="Contributors"
            count={extra?.contributors?.length}
          >
            {extraLoading ? (
              <p className="text-sm text-gray-400 pt-1">Loading contributors…</p>
            ) : extra?.contributors?.length ? (
              <div className="space-y-3 pt-1">
                {extra.contributors.slice(0, 10).map((c) => (
                  <a
                    key={c.id}
                    href={c.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 group"
                  >
                    <img
                      src={c.avatar_url}
                      alt={c.login}
                      className="w-9 h-9 rounded-full border border-gray-200 dark:border-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-theme">
                        {c.login}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                        {c.contributions} Commits
                      </p>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 pt-1">No contributors found.</p>
            )}
          </CollapsibleSection>

          {/* Recent commits */}
          {extra?.commits?.length > 0 && (
            <CollapsibleSection
              icon={GitCommit}
              title="Recent Commits"
              count={extra.commits.length}
            >
              <div className="space-y-3 pt-1">
                {extra.commits.slice(0, 6).map((commit) => (
                  <a
                    key={commit.sha}
                    href={commit.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block group"
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate group-hover:text-theme">
                      {commit.commit?.message?.split("\n")[0]}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {commit.commit?.author?.name} ·{" "}
                      {formatDate(commit.commit?.author?.date)}
                    </p>
                  </a>
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>
      </div>

      {/* Create PR Modal */}
      {showPrModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => !creatingPr && setShowPrModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[18px] p-6 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 icon text-theme" />
                Create Pull Request
              </h2>
              <button
                type="button"
                onClick={() => !creatingPr && setShowPrModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePr} className="space-y-4">
              {/* Branch selectors */}
              <div className="flex items-center mt-5 gap-2">
                <div className="flex-1 min-w-0">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                    Base (merge into)
                  </label>
                  <Select
                    value={prForm.base}
                    onValueChange={(value) =>
                      setPrForm((p) => ({ ...p, base: value }))
                    }
                  >
                    <SelectTrigger className="w-full h-11 rounded-[12px] bg-white dark:bg-[rgba(255,255,255,.05)]">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.name} value={b.name}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 mt-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                    Compare (from)
                  </label>
                  <Select
                    value={prForm.head}
                    onValueChange={(value) =>
                      setPrForm((p) => ({ ...p, head: value }))
                    }
                  >
                    <SelectTrigger className="w-full h-11 rounded-[12px] bg-white dark:bg-[rgba(255,255,255,.05)]">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.name} value={b.name}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                  Title
                </label>
                <Input
                  value={prForm.title}
                  onChange={(e) =>
                    setPrForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Add new feature"
                  className="h-11 rounded-[12px]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                  Description
                </label>
                <Textarea
                  value={prForm.body}
                  onChange={(e) =>
                    setPrForm((p) => ({ ...p, body: e.target.value }))
                  }
                  placeholder="Describe your changes…"
                  rows={4}
                  className="rounded-[12px] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-[12px] w-[150px]"
                  onClick={() => setShowPrModal(false)}
                  disabled={creatingPr}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-[12px] w-[150px] bg-theme hover:bg-theme text-white"
                  disabled={creatingPr}
                >
                  {creatingPr ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <GitPullRequest className="w-4 h-4 mr-2" />
                      Create Pull
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RepoDetail;
