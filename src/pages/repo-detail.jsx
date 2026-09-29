import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { m } from "framer-motion";
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
  GitMerge,
  MessageSquare,
  Send,
  XCircle,
  PlusCircle,
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
import { useAuth } from "../contexts/auth-context";
import useGithubRepos from "@/hooks/use-github-repos";
import {
  getRepoExtraDetails,
  createGithubPullRequest,
  mergeGithubPullRequest,
  closeGithubPullRequest,
  getGithubComments,
  createGithubComment,
} from "@/hooks/github-hooks";
import HorizontalLoader from "@/components/horizontal-loader";
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
  <div className="dashboard-card flex items-center justify-between gap-3 p-4 rounded-[15px] border border-gray-100 dark:border-white/10 bg-white dark:bg-[rgba(255,255,255,.05)]">
    <div className="flex gap-2 items-center">
    <div
      className="flex-shrink-0 w-9 h-9 rounded-[12px] flex items-center justify-center"
      style={{ background: accent || "var(--theme-accent, #ff914b)" }}
    >
      <Icon className="w-4 h-4 text-white" />
    </div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">
        {label}
      </p>
    </div>
    <div className="min-w-0">
      <p className="text-xl font-black text-gray-900 dark:text-white leading-none">
        {value}
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
  return <Badge className="bg-green-500/90 text-white border-none">Open</Badge>;
};

const getPrMerged = (item) => Boolean(item.merged_at) || item.merged === true;
const isPrOpenState = (item, merged) => item.state === "open" && !merged;
const canActOnRepo = (owner, repo, token) => Boolean(owner && repo && token);
const shouldShowPrActions = (isPr, isOpen, canAct) =>
  isPr && isOpen && canAct;
const authorLogin = (item) => item.user?.login || "unknown";
const labelFallback = (value) => value || "999";
const labelKey = (label) => label.id || label.name;
const githubAccessToken = (user) =>
  user?.socialLinks?.github?.accessToken ?? null;
const orEmpty = (value) => value || [];
const orMain = (value) => value || "main";
const languageColor = (name) => LANGUAGE_COLORS[name] || "#8b949e";
const privacyBadgeClass = (isPrivate) =>
  isPrivate
    ? "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
    : "bg-theme/10 text-theme";
const sectionTabClass = (active) =>
  active
    ? "flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-[15px] px-3 text-sm font-semibold transition-colors bg-theme text-white"
    : "flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-[15px] px-3 text-sm font-semibold transition-colors bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300";
const prBranchHintClass = (sameBranch) =>
  sameBranch
    ? "mt-3 text-xs font-medium text-red-500"
    : "mt-3 text-xs font-medium text-gray-600 dark:text-gray-300";
const licenseLabel = (license) => license?.spdx_id || license?.name;
const commitMessageLine = (commit) =>
  commit.commit?.message?.split("\n")[0];
const notFoundMessage = (isGithubConnected) =>
  isGithubConnected
    ? "We couldn't find this repository in your account."
    : "Connect your GitHub account to view repository details.";
const branchesOrEmpty = (extra) => extra?.branches || [];
const shaShort = (sha) => sha?.slice(0, 7);

const AccordionItemIcon = ({ isPr, merged, state }) => {
  if (isPr) {
    if (merged) {
      return <GitPullRequestClosed className="w-5 h-5 text-purple-500" />;
    }
    if (state === "closed") {
      return <GitPullRequestClosed className="w-5 h-5 text-red-500" />;
    }
    return <GitPullRequest className="w-5 h-5 text-green-500" />;
  }
  if (state === "closed") {
    return <CheckCircle2 className="w-5 h-5 text-purple-500" />;
  }
  return <CircleDot className="w-5 h-5 text-green-500" />;
};

const AccordionItemBody = ({ body }) => {
  if (body) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words max-h-60 overflow-y-auto mt-3">
        {body}
      </p>
    );
  }
  return (
    <p className="text-sm text-gray-400 italic mt-3">No description provided.</p>
  );
};

const AccordionItemLabels = ({ labels }) => (
  <div className="flex flex-wrap items-center gap-2 mt-4">
    {(labels || []).map((label) => {
      const color = labelFallback(label.color);
      return (
        <span
          key={labelKey(label)}
          className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
          style={{
            backgroundColor: `#${color}22`,
            color: `#${color}`,
            border: `1px solid #${color}55`,
          }}
        >
          {label.name}
        </span>
      );
    })}
  </div>
);

const AccordionItemMeta = ({ item, isPr }) => {
  const showBranch =
    isPr && Boolean(item.base?.ref) && Boolean(item.head?.ref);
  return (
    <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
      {showBranch ? (
        <span className="flex items-center gap-1">
          <GitBranch className="w-3.5 h-3.5" />
          {item.head.ref} → {item.base.ref}
        </span>
      ) : null}
      {item.comments != null ? <span>{item.comments} comments</span> : null}
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
  );
};

const AccordionPrActions = ({
  show,
  merging,
  closing,
  onMerge,
  onClose,
}) => {
  if (!show) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
      <Button
        size="sm"
        onClick={onMerge}
        disabled={merging || closing}
        className="rounded-[12px] w-[150px] bg-purple-600 hover:bg-purple-700 text-white"
      >
        {merging ? (
          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
        ) : (
          <GitMerge className="w-4 h-4 mr-1.5" />
        )}
        Merge
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onClose}
        disabled={merging || closing}
        className="rounded-[12px] w-[150px] border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
      >
        {closing ? (
          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
        ) : (
          <XCircle className="w-4 h-4 mr-1.5" />
        )}
        Reject
      </Button>
    </div>
  );
};

const AccordionCommentsList = ({ commentsLoading, comments }) => {
  if (commentsLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading comments…
      </div>
    );
  }
  if (comments.length > 0) {
    return (
      <div className="space-y-3 mb-3">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <img
              src={c.user?.avatar_url}
              alt={c.user?.login}
              className="w-7 h-7 rounded-full border border-gray-200 dark:border-white/10 flex-shrink-0"
            />
            <div className="min-w-0 flex-1 rounded-[12px] bg-gray-50 dark:bg-white/5 px-3 py-2">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                {c.user?.login}{" "}
                <span className="text-gray-400 font-normal">
                  · {formatDate(c.created_at)}
                </span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words mt-0.5">
                {c.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <p className="text-sm text-gray-400 italic mb-3">No comments yet.</p>
  );
};

const AccordionComments = ({
  canAct,
  commentsLoading,
  comments,
  commentText,
  onCommentChange,
  onPostComment,
  posting,
}) => {
  if (!canAct) return null;
  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
        <MessageSquare className="w-3.5 h-3.5" />
        Comments
      </p>
      <AccordionCommentsList
        commentsLoading={commentsLoading}
        comments={comments}
      />
      <div className="flex items-end gap-2">
        <Textarea
          value={commentText}
          onChange={onCommentChange}
          placeholder="Write a comment…"
          rows={2}
          className="rounded-[12px] resize-none flex-1"
        />
        <Button
          size="sm"
          onClick={onPostComment}
          disabled={posting || !commentText.trim()}
          className="rounded-[12px] w-[50px] bg-theme hover:bg-theme text-white flex-shrink-0"
        >
          {posting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

const AccordionItemPanel = ({
  item,
  isPr,
  showPrActions,
  canAct,
  merging,
  closing,
  onMerge,
  onClose,
  commentsLoading,
  comments,
  commentText,
  onCommentChange,
  onPostComment,
  posting,
}) => (
  <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-white/10">
    <AccordionItemBody body={item.body} />
    <AccordionItemLabels labels={item.labels} />
    <AccordionItemMeta item={item} isPr={isPr} />
    <AccordionPrActions
      show={showPrActions}
      merging={merging}
      closing={closing}
      onMerge={onMerge}
      onClose={onClose}
    />
    <AccordionComments
      canAct={canAct}
      commentsLoading={commentsLoading}
      comments={comments}
      commentText={commentText}
      onCommentChange={onCommentChange}
      onPostComment={onPostComment}
      posting={posting}
    />
  </div>
);

const AccordionItem = ({ item, type, owner, repo, token, onPrUpdated }) => {
  const [open, setOpen] = useState(false);
  const isPr = type === "pr";
  const merged = getPrMerged(item);
  const isOpen = isPrOpenState(item, merged);
  const canAct = canActOnRepo(owner, repo, token);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [merging, setMerging] = useState(false);
  const [closing, setClosing] = useState(false);

  const loadComments = useCallback(async () => {
    if (!canAct || commentsLoaded) return;
    try {
      setCommentsLoading(true);
      const data = await getGithubComments(token, owner, repo, item.number);
      setComments(data);
      setCommentsLoaded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  }, [canAct, commentsLoaded, token, owner, repo, item.number]);

  useEffect(() => {
    if (open) loadComments();
  }, [open, loadComments]);

  const handlePostComment = async () => {
    if (!canAct || !commentText.trim()) return;
    try {
      setPosting(true);
      const newComment = await createGithubComment(
        token,
        owner,
        repo,
        item.number,
        commentText.trim(),
      );
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
      toast.success("Comment posted.");
    } catch (err) {
      toast.error(err.message || "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const handleMerge = async () => {
    if (!canAct) return;
    try {
      setMerging(true);
      await mergeGithubPullRequest(token, owner, repo, item.number, {
        commit_title: `${item.title} (#${item.number})`,
        merge_method: "merge",
      });
      onPrUpdated?.(item.id, { state: "closed", merged: true });
      toast.success(`Pull request #${item.number} merged!`);
    } catch (err) {
      toast.error(err.message || "Failed to merge pull request");
    } finally {
      setMerging(false);
    }
  };

  const handleClose = async () => {
    if (!canAct) return;
    try {
      setClosing(true);
      await closeGithubPullRequest(token, owner, repo, item.number);
      onPrUpdated?.(item.id, { state: "closed", merged: false });
      toast.success(`Pull request #${item.number} closed.`);
    } catch (err) {
      toast.error(err.message || "Failed to close pull request");
    } finally {
      setClosing(false);
    }
  };

  const chevronClass = open
    ? "w-4 h-4 text-gray-400 transition-transform rotate-180"
    : "w-4 h-4 text-gray-400 transition-transform";
  const showPrActions = shouldShowPrActions(isPr, isOpen, canAct);

  return (
    <div className="rounded-[15px] border border-gray-100 dark:border-white/10 bg-white dark:bg-[rgba(255,255,255,.04)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex-shrink-0">
          <AccordionItemIcon isPr={isPr} merged={merged} state={item.state} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {item.title}
            </span>
            <span className="text-xs text-gray-400">#{item.number}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            opened by {authorLogin(item)} · {formatDate(item.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StateBadge state={item.state} merged={merged} />
          <ChevronDown className={chevronClass} />
        </div>
      </button>

      {open ? (
        <AccordionItemPanel
          item={item}
          isPr={isPr}
          showPrActions={showPrActions}
          canAct={canAct}
          merging={merging}
          closing={closing}
          onMerge={handleMerge}
          onClose={handleClose}
          commentsLoading={commentsLoading}
          comments={comments}
          commentText={commentText}
          onCommentChange={(e) => setCommentText(e.target.value)}
          onPostComment={handlePostComment}
          posting={posting}
        />
      ) : null}
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
  const chevronClass = open
    ? "w-4 h-4 text-gray-400 ml-auto transition-transform rotate-180"
    : "w-4 h-4 text-gray-400 ml-auto transition-transform";
  return (
    <div className="dashboard-card overflow-hidden rounded-[15px] border border-gray-100 bg-white dark:border-white/10 dark:bg-[rgba(255,255,255,.05)]">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center gap-2 overflow-hidden rounded-[15px] p-5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
      >
        <Icon className="w-4 h-4 icon" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          {title}
          {count ? (
            <span className="text-gray-400 font-medium"> ({count})</span>
          ) : null}
        </h3>
        <ChevronDown className={chevronClass} />
      </button>
      {open ? <div className="px-5 pb-5 pt-0">{children}</div> : null}
    </div>
  );
};

const RepoNotFound = ({ isGithubConnected, onBack }) => (
  <div className="dashboard-page min-h-[60vh] flex flex-col items-center justify-center text-center">
    <Code2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
      Repository not found
    </h2>
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
      {notFoundMessage(isGithubConnected)}
    </p>
    <Button onClick={onBack}>
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Dashboard
    </Button>
  </div>
);

const RepoPrivacyBadge = ({ isPrivate }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${privacyBadgeClass(isPrivate)}`}
  >
    {isPrivate ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
    {isPrivate ? "Private" : "Public"}
  </span>
);

const RepoLanguageChip = ({ language }) => {
  if (!language) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300">
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: languageColor(language) }}
      />
      {language}
    </span>
  );
};

const RepoLicenseChip = ({ license }) => {
  if (!license?.name) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-600 dark:bg-white/5 dark:text-gray-300">
      <Scale className="h-3 w-3" />
      {licenseLabel(license)}
    </span>
  );
};

const RepoDescription = ({ description }) => {
  if (!description) return null;
  return (
    <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
      {description}
    </p>
  );
};

const RepoDetailHeader = ({ repo }) => (
  <m.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="dashboard-card mb-6 rounded-[18px] border border-gray-100 bg-white p-5 dark:border-white/10 dark:bg-[rgba(255,255,255,.05)]"
  >
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-theme/10 text-theme">
          <GitBranch className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-bold text-gray-900 dark:text-white">
              {repo.name}
            </h1>
            <RepoPrivacyBadge isPrivate={repo.private} />
          </div>
          <p className="mt-0.5 truncate text-xs text-gray-400">
            {repo.full_name}
          </p>
          <RepoDescription description={repo.description} />
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <RepoLanguageChip language={repo.language} />
            <RepoLicenseChip license={repo.license} />
            <span className="inline-flex items-center border px-4 py-2 gap-1 rounded-xl bg-gray-50 px-2 py-1 text-[11px] font-bold text-gray-600 dark:bg-white/5 dark:text-gray-300">
              <Calendar className="h-3 w-3" />
              Last Updated {formatDate(repo.updated_at)}
            </span>
          </div>
        </div>
      </div>

      <a
        href={repo.html_url}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 self-start sm:self-center"
      >
        <Button className="h-11 rounded-[14px] w-[200px] bg-theme px-4 text-white hover:bg-theme">
          <ExternalLink className="mr-2 h-4 w-4" />
          Open on GitHub
        </Button>
      </a>
    </div>
  </m.div>
);

const RepoDetailStats = ({ repo, pullsCount, issuesCount, branchesCount }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
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
      value={formatNumber(pullsCount)}
      accent="#22c55e"
    />
    <StatCard
      icon={CircleDot}
      label="Open Issues"
      value={formatNumber(issuesCount)}
      accent="#ef4444"
    />
    <StatCard
      icon={GitBranch}
      label="Branches"
      value={formatNumber(branchesCount)}
      accent="#06b6d4"
    />
  </div>
);

const RepoSectionNav = ({
  section,
  onSectionChange,
  pullsCount,
  issuesCount,
  branchesCount,
  onNewPr,
}) => (
  <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center">
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <button
        type="button"
        onClick={() => onSectionChange("pulls")}
        className={sectionTabClass(section === "pulls")}
      >
        <GitPullRequest className="w-4 h-4 shrink-0" />
        <span className="truncate">Pulls ({pullsCount})</span>
      </button>
      <button
        type="button"
        onClick={() => onSectionChange("issues")}
        className={sectionTabClass(section === "issues")}
      >
        <CircleDot className="w-4 h-4 shrink-0" />
        <span className="truncate">Issues ({issuesCount})</span>
      </button>
      <button
        type="button"
        onClick={() => onSectionChange("branches")}
        className={sectionTabClass(section === "branches")}
      >
        <GitBranch className="w-4 h-4 shrink-0" />
        <span className="truncate">Branches ({branchesCount})</span>
      </button>
    </div>
    {section !== "issues" ? (
      <Button
        onClick={onNewPr}
        className="h-11 shrink-0 rounded-[15px] bg-theme px-4 text-white w-[200px] hover:bg-theme"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        New pull request
      </Button>
    ) : null}
  </div>
);

const RepoEmptyState = ({ icon: Icon, message }) => (
  <div className="text-center py-12 rounded-[15px] border border-dashed border-gray-200 dark:border-white/10">
    <Icon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
    <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
  </div>
);

const RepoPullsSection = ({
  pulls,
  owner,
  repoName,
  token,
  onPrUpdated,
}) => {
  if (pulls.length > 0) {
    return pulls.map((pr) => (
      <AccordionItem
        key={pr.id}
        item={pr}
        type="pr"
        owner={owner}
        repo={repoName}
        token={token}
        onPrUpdated={onPrUpdated}
      />
    ));
  }
  return (
    <RepoEmptyState
      icon={GitPullRequest}
      message="No open pull requests."
    />
  );
};

const RepoIssuesSection = ({
  issues,
  owner,
  repoName,
  token,
  onPrUpdated,
}) => {
  if (issues.length > 0) {
    return issues.map((issue) => (
      <AccordionItem
        key={issue.id}
        item={issue}
        type="issue"
        owner={owner}
        repo={repoName}
        token={token}
        onPrUpdated={onPrUpdated}
      />
    ));
  }
  return <RepoEmptyState icon={AlertCircle} message="No open issues." />;
};

const RepoBranchRow = ({ branch, isDefault, onOpenPr }) => (
  <div className="flex items-center gap-3 rounded-[15px] border border-gray-100 bg-white p-3 dark:border-white/10 dark:bg-[rgba(255,255,255,.04)]">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-cyan-500/10">
      <GitBranch className="h-4 w-4 text-cyan-500" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
          {branch.name}
        </span>
        {isDefault ? (
          <Badge className="border-none bg-theme text-[10px] text-white">
            default
          </Badge>
        ) : null}
        {branch.protected ? (
          <Badge className="border-none bg-gray-700 text-[10px] text-white">
            protected
          </Badge>
        ) : null}
      </div>
      <p className="mt-0.5 truncate font-mono text-xs text-gray-400">
        {shaShort(branch.commit?.sha)}
      </p>
    </div>
    {isDefault ? (
      <span className="shrink-0 text-[11px] font-medium text-gray-400">
        Merge target
      </span>
    ) : (
      <Button
        size="sm"
        variant="default"
        className="h-9 shrink-0 rounded-[12px] px-3 w-[150px]"
        onClick={onOpenPr}
      >
        <GitPullRequest className="mr-1.5 h-3.5 w-3.5" />
        Open PR
      </Button>
    )}
  </div>
);

const RepoBranchesSection = ({
  extraLoading,
  branches,
  defaultBranch,
  onOpenPr,
}) => {
  if (extraLoading) {
    return (
      <div className="text-center py-12 rounded-[15px] border border-dashed border-gray-200 dark:border-white/10">
        <Loader2 className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3 animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading branches…
        </p>
      </div>
    );
  }
  if (branches.length > 0) {
    return branches.map((branch) => (
      <RepoBranchRow
        key={branch.name}
        branch={branch}
        isDefault={branch.name === defaultBranch}
        onOpenPr={() => onOpenPr(branch.name)}
      />
    ));
  }
  return <RepoEmptyState icon={GitBranch} message="No branches found." />;
};

const RepoSectionContent = ({
  section,
  pulls,
  issues,
  branches,
  extraLoading,
  defaultBranch,
  owner,
  repoName,
  token,
  onPrUpdated,
  onOpenPr,
}) => {
  if (section === "pulls") {
    return (
      <RepoPullsSection
        pulls={pulls}
        owner={owner}
        repoName={repoName}
        token={token}
        onPrUpdated={onPrUpdated}
      />
    );
  }
  if (section === "issues") {
    return (
      <RepoIssuesSection
        issues={issues}
        owner={owner}
        repoName={repoName}
        token={token}
        onPrUpdated={onPrUpdated}
      />
    );
  }
  if (section === "branches") {
    return (
      <RepoBranchesSection
        extraLoading={extraLoading}
        branches={branches}
        defaultBranch={defaultBranch}
        onOpenPr={onOpenPr}
      />
    );
  }
  return null;
};

const RepoLanguagesSection = ({ languageEntries }) => {
  if (languageEntries.length === 0) return null;
  return (
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
              background: languageColor(lang.name),
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
                style={{ background: languageColor(lang.name) }}
              />
              {lang.name}
            </span>
            <span className="text-gray-400">{lang.percent.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
};

const RepoContributorsList = ({ extraLoading, contributors }) => {
  if (extraLoading) {
    return (
      <p className="text-sm text-gray-400 pt-1">Loading contributors…</p>
    );
  }
  if (contributors?.length) {
    return (
      <div className="space-y-3 pt-1">
        {contributors.slice(0, 10).map((c) => (
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
            <p className="text-xs text-gray-500">{c.contributions} Commits</p>
          </a>
        ))}
      </div>
    );
  }
  return (
    <p className="text-sm text-gray-400 pt-1">No contributors found.</p>
  );
};

const RepoContributorsSection = ({ extraLoading, contributors }) => (
  <CollapsibleSection
    icon={PiUsersDuotone}
    title="Contributors"
    count={contributors?.length}
  >
    <RepoContributorsList
      extraLoading={extraLoading}
      contributors={contributors}
    />
  </CollapsibleSection>
);

const RepoCommitsSection = ({ commits }) => {
  if (!commits?.length) return null;
  return (
    <CollapsibleSection
      icon={GitCommit}
      title="Recent Commits"
      count={commits.length}
    >
      <div className="space-y-3 pt-1">
        {commits.slice(0, 6).map((commit) => (
          <a
            key={commit.sha}
            href={commit.html_url}
            target="_blank"
            rel="noreferrer"
            className="block group"
          >
            <p className="text-sm text-gray-700 dark:text-gray-300 truncate group-hover:text-theme">
              {commitMessageLine(commit)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {commit.commit?.author?.name} ·{" "}
              {formatDate(commit.commit?.author?.date)}
            </p>
          </a>
        ))}
      </div>
    </CollapsibleSection>
  );
};

const RepoSidebar = ({ languageEntries, extraLoading, extra }) => (
  <div className="space-y-6">
    <RepoLanguagesSection languageEntries={languageEntries} />
    <RepoContributorsSection
      extraLoading={extraLoading}
      contributors={extra?.contributors}
    />
    <RepoCommitsSection commits={extra?.commits} />
  </div>
);

const CreatePrBranchHint = ({ head, base }) => {
  if (!head || !base) return null;
  const sameBranch = head === base;
  return (
    <p className={prBranchHintClass(sameBranch)}>
      {sameBranch
        ? "Pick two different branches."
        : `${head} will merge into ${base}`}
    </p>
  );
};

const CreatePrSubmitLabel = ({ creatingPr }) => {
  if (creatingPr) {
    return (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Creating…
      </>
    );
  }
  return (
    <>
      <GitPullRequest className="mr-2 h-4 w-4" />
      Create pull request
    </>
  );
};

const CreatePrModal = ({
  show,
  creatingPr,
  prForm,
  branches,
  defaultBranch,
  onClose,
  onBackdropClick,
  onSubmit,
  onSetPrBranch,
  onTitleChange,
  onBodyChange,
}) => {
  if (!show) return null;
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onBackdropClick}
    >
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <GitPullRequest className="h-5 w-5 text-theme" />
              Create pull request
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Merge one branch into another.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="rounded-[15px] border border-gray-100 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              From
            </label>
            <Select
              value={prForm.head || undefined}
              onValueChange={(value) => onSetPrBranch("head", value)}
            >
              <SelectTrigger className="h-11 w-full rounded-[12px] bg-white dark:bg-[rgba(255,255,255,.05)]">
                <SelectValue placeholder="Branch with your changes" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.name} value={b.name}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 py-2 text-gray-400">
              <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
              <ArrowRight className="h-4 w-4 rotate-90" />
              <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
            </div>

            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Into
            </label>
            <Select
              value={prForm.base || undefined}
              onValueChange={(value) => onSetPrBranch("base", value)}
            >
              <SelectTrigger className="h-11 w-full rounded-[12px] bg-white dark:bg-[rgba(255,255,255,.05)]">
                <SelectValue placeholder="Branch to merge into" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={`base-${b.name}`} value={b.name}>
                    {b.name}
                    {b.name === defaultBranch ? " · default" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <CreatePrBranchHint head={prForm.head} base={prForm.base} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Title
            </label>
            <Input
              value={prForm.title}
              onChange={onTitleChange}
              placeholder="Summarize the change"
              className="h-11 rounded-[12px]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Description
            </label>
            <Textarea
              value={prForm.body}
              onChange={onBodyChange}
              placeholder="What changed, and why?"
              rows={4}
              className="resize-none rounded-[12px]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4 dark:border-white/10">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-[12px] px-4"
              onClick={() => onClose()}
              disabled={creatingPr}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 rounded-[12px] bg-theme px-4 text-white hover:bg-theme"
              disabled={creatingPr || prForm.head === prForm.base}
            >
              <CreatePrSubmitLabel creatingPr={creatingPr} />
            </Button>
          </div>
        </form>
      </m.div>
    </div>
  );
};

const RepoDetailView = ({
  repo,
  pulls,
  issues,
  branches,
  extra,
  extraLoading,
  languageEntries,
  section,
  onSectionChange,
  owner,
  githubToken,
  handlePrUpdated,
  openCreatePr,
  defaultBranch,
  showPrModal,
  creatingPr,
  prForm,
  setShowPrModal,
  handleCreatePr,
  setPrBranch,
  setPrForm,
}) => (
  <div className="dashboard-page pt-2 md:pt-4 pb-16">
    <RepoDetailHeader repo={repo} />
    <RepoDetailStats
      repo={repo}
      pullsCount={pulls.length}
      issuesCount={issues.length}
      branchesCount={extra?.branches?.length}
    />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <RepoSectionNav
          section={section}
          onSectionChange={onSectionChange}
          pullsCount={pulls.length}
          issuesCount={issues.length}
          branchesCount={branches.length}
          onNewPr={() => openCreatePr()}
        />
        <div className="space-y-3">
          <RepoSectionContent
            section={section}
            pulls={pulls}
            issues={issues}
            branches={branches}
            extraLoading={extraLoading}
            defaultBranch={defaultBranch}
            owner={owner}
            repoName={repo.name}
            token={githubToken}
            onPrUpdated={handlePrUpdated}
            onOpenPr={openCreatePr}
          />
        </div>
      </div>
      <RepoSidebar
        languageEntries={languageEntries}
        extraLoading={extraLoading}
        extra={extra}
      />
    </div>
    <CreatePrModal
      show={showPrModal}
      creatingPr={creatingPr}
      prForm={prForm}
      branches={branches}
      defaultBranch={defaultBranch}
      onClose={() => {
        if (!creatingPr) setShowPrModal(false);
      }}
      onBackdropClick={() => {
        if (!creatingPr) setShowPrModal(false);
      }}
      onSubmit={handleCreatePr}
      onSetPrBranch={setPrBranch}
      onTitleChange={(e) =>
        setPrForm((p) => ({ ...p, title: e.target.value }))
      }
      onBodyChange={(e) => setPrForm((p) => ({ ...p, body: e.target.value }))}
    />
  </div>
);

const RepoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { repos, loading: reposLoading, isGithubConnected } = useGithubRepos();

  const [section, setSection] = useState("pulls");
  const [extra, setExtra] = useState(null);
  const [extraLoading, setExtraLoading] = useState(false);
  const [createdPulls, setCreatedPulls] = useState([]);
  const [prOverrides, setPrOverrides] = useState({});
  const [showPrModal, setShowPrModal] = useState(false);
  const [prForm, setPrForm] = useState({
    title: "",
    body: "",
    head: "",
    base: "",
  });
  const [creatingPr, setCreatingPr] = useState(false);

  const githubToken = githubAccessToken(user);

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

  const owner = repo?.owner?.login;

  const handlePrUpdated = useCallback((prId, changes) => {
    setPrOverrides((prev) => ({
      ...prev,
      [prId]: { ...prev[prId], ...changes },
    }));
  }, []);

  const pulls = useMemo(
    () =>
      [...createdPulls, ...orEmpty(repo?.pulls)].map((pr) =>
        prOverrides[pr.id] ? { ...pr, ...prOverrides[pr.id] } : pr,
      ),
    [repo, createdPulls, prOverrides],
  );
  const issues = useMemo(
    () => orEmpty(repo?.issues).filter((i) => !i.pull_request),
    [repo],
  );
  const branches = useMemo(() => branchesOrEmpty(extra), [extra]);

  const defaultBranch = orMain(repo?.default_branch);

  const openCreatePr = useCallback(
    (headBranch = "") => {
      setPrForm({
        title: "",
        body: "",
        head: headBranch,
        base: "",
      });
      setShowPrModal(true);
    },
    [],
  );

  const setPrBranch = (field, value) => {
    setPrForm((prev) => {
      const next = { ...prev, [field]: value };
      const previousAuto =
        prev.head && prev.base ? `Merge ${prev.head} into ${prev.base}` : "";
      if (!prev.title || prev.title === previousAuto) {
        next.title =
          next.head && next.base && next.head !== next.base
            ? `Merge ${next.head} into ${next.base}`
            : "";
      }
      return next;
    });
  };

  const handleCreatePr = async (e) => {
    e?.preventDefault();
    if (!repo || !githubToken) return;
    const ownerLogin = repo.owner?.login;
    if (!ownerLogin) return;

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
      const newPr = await createGithubPullRequest(
        githubToken,
        ownerLogin,
        repo.name,
        {
          title: prForm.title.trim(),
          body: prForm.body,
          head: prForm.head,
          base: prForm.base,
        },
      );
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
      <RepoNotFound
        isGithubConnected={isGithubConnected}
        onBack={() => navigate("/dashboard")}
      />
    );
  }

  return (
    <RepoDetailView
      repo={repo}
      pulls={pulls}
      issues={issues}
      branches={branches}
      extra={extra}
      extraLoading={extraLoading}
      languageEntries={languageEntries}
      section={section}
      onSectionChange={setSection}
      owner={owner}
      githubToken={githubToken}
      handlePrUpdated={handlePrUpdated}
      openCreatePr={openCreatePr}
      defaultBranch={defaultBranch}
      showPrModal={showPrModal}
      creatingPr={creatingPr}
      prForm={prForm}
      setShowPrModal={setShowPrModal}
      handleCreatePr={handleCreatePr}
      setPrBranch={setPrBranch}
      setPrForm={setPrForm}
    />
  );
};

export default RepoDetail;
