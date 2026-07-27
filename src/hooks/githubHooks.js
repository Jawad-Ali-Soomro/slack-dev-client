import axios from "axios";

export const getGithubProfile = async (token) => {
  try {
    const res = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${token}`,
        "User-Agent": "Slack Developers",
      },
    });
    return res.data;
  } catch (err) {
    console.error(
      "Error fetching GitHub profile:",
      err.response?.data || err.message,
    );
    throw err;
  }
};

// GitHub paginates list endpoints (30 per page by default, 100 max), so we
// have to follow every page to get the complete list of repos.
const fetchAllPages = async (url, token) => {
  const results = [];
  let page = 1;
  const perPage = 100;

  // Loop until GitHub returns a page with fewer than perPage items.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const separator = url.includes("?") ? "&" : "?";
    const res = await axios.get(
      `${url}${separator}per_page=${perPage}&page=${page}`,
      {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "Slack Developers",
        },
      },
    );

    const data = res.data || [];
    results.push(...data);

    if (data.length < perPage) break;
    page += 1;
  }

  return results;
};

export const getGithubRepos = async (token) => {
  try {
    // visibility=all + every affiliation returns both private and public repos
    // the user owns, collaborates on, or belongs to via an organization.
    const allRepos = await fetchAllPages(
      "https://api.github.com/user/repos?visibility=all&affiliation=owner,collaborator,organization_member",
      token,
    );

    const publicRepos = allRepos.filter((repo) => !repo.private);
    const privateRepos = allRepos.filter((repo) => repo.private);

    return { publicRepos, privateRepos };
  } catch (err) {
    console.error(
      "Error fetching GitHub repos:",
      err.response?.data || err.message,
    );
    throw err;
  }
};

export const getGithubPulls = async (token, owner, repo) => {
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "Slack Developers",
        },
      },
    );
    return res.data;
  } catch (err) {
    console.error(
      "Error fetching GitHub pulls:",
      err.response?.data || err.message,
    );
    throw err;
  }
};

export const getGithubIssues = async (token, owner, repo) => {
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "Slack Developers",
        },
      },
    );
    return res.data;
  } catch (err) {
    console.error(
      "Error fetching GitHub issues:",
      err.response?.data || err.message,
    );
    throw err;
  }
};

export const getGithubContributors = async (token, owner, repo) => {
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`,
      {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "Slack Developers",
        },
      },
    );
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error(
      "Error fetching GitHub contributors:",
      err.response?.data || err.message,
    );
    return [];
  }
};

export const getGithubLanguages = async (token, owner, repo) => {
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/languages`,
      {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "Slack Developers",
        },
      },
    );
    return res.data || {};
  } catch (err) {
    console.error(
      "Error fetching GitHub languages:",
      err.response?.data || err.message,
    );
    return {};
  }
};

export const getGithubBranches = async (token, owner, repo) => {
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
      {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "Slack Developers",
        },
      },
    );
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error(
      "Error fetching GitHub branches:",
      err.response?.data || err.message,
    );
    return [];
  }
};

export const getGithubCommits = async (token, owner, repo) => {
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`,
      {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "Slack Developers",
        },
      },
    );
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error(
      "Error fetching GitHub commits:",
      err.response?.data || err.message,
    );
    return [];
  }
};

export const createGithubPullRequest = async (
  token,
  owner,
  repo,
  { title, head, base, body },
) => {
  try {
    const res = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      { title, head, base, body },
      {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "Slack Developers",
          Accept: "application/vnd.github+json",
        },
      },
    );
    return res.data;
  } catch (err) {
    const message =
      err.response?.data?.errors?.[0]?.message ||
      err.response?.data?.message ||
      err.message ||
      "Failed to create pull request";
    console.error(
      "Error creating GitHub pull request:",
      err.response?.data || err.message,
    );
    throw new Error(message);
  }
};

// Merge a pull request. merge_method can be "merge", "squash" or "rebase".
export const mergeGithubPullRequest = async (
  token,
  owner,
  repo,
  pullNumber,
  { commit_title, commit_message, merge_method = "merge" } = {},
) => {
  try {
    const res = await axios.put(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/merge`,
      { commit_title, commit_message, merge_method },
      {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "Slack Developers",
          Accept: "application/vnd.github+json",
        },
      },
    );
    return res.data;
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Failed to merge pull request";
    console.error(
      "Error merging GitHub pull request:",
      err.response?.data || err.message,
    );
    throw new Error(message);
  }
};

// Reject/close a pull request without merging it.
export const closeGithubPullRequest = async (
  token,
  owner,
  repo,
  pullNumber,
) => {
  try {
    const res = await axios.patch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
      { state: "closed" },
      {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "Slack Developers",
          Accept: "application/vnd.github+json",
        },
      },
    );
    return res.data;
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Failed to close pull request";
    console.error(
      "Error closing GitHub pull request:",
      err.response?.data || err.message,
    );
    throw new Error(message);
  }
};

// PRs are issues under the hood, so the issue comments endpoint works for both.
export const getGithubComments = async (token, owner, repo, issueNumber) => {
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=100`,
      {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "Slack Developers",
        },
      },
    );
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error(
      "Error fetching GitHub comments:",
      err.response?.data || err.message,
    );
    return [];
  }
};

export const createGithubComment = async (
  token,
  owner,
  repo,
  issueNumber,
  body,
) => {
  try {
    const res = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
      { body },
      {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "Slack Developers",
          Accept: "application/vnd.github+json",
        },
      },
    );
    return res.data;
  } catch (err) {
    const message =
      err.response?.data?.message || err.message || "Failed to add comment";
    console.error(
      "Error creating GitHub comment:",
      err.response?.data || err.message,
    );
    throw new Error(message);
  }
};

export const getRepoExtraDetails = async (token, owner, repo) => {
  const [contributors, languages, branches, commits] = await Promise.all([
    getGithubContributors(token, owner, repo),
    getGithubLanguages(token, owner, repo),
    getGithubBranches(token, owner, repo),
    getGithubCommits(token, owner, repo),
  ]);
  return { contributors, languages, branches, commits };
};

export const getGithubDetails = async (token) => {
  try {
    const profile = await getGithubProfile(token);
    const { publicRepos, privateRepos } = await getGithubRepos(token);

    const fetchRepoDetails = async (repoArray) => {
      return Promise.all(
        repoArray.map(async (repo) => {
          const [pulls, issues] = await Promise.all([
            getGithubPulls(token, repo.owner.login, repo.name),
            getGithubIssues(token, repo.owner.login, repo.name),
          ]);
          return { ...repo, pulls, issues };
        }),
      );
    };

    const publicReposWithDetails = await fetchRepoDetails(publicRepos);
    const privateReposWithDetails = await fetchRepoDetails(privateRepos);

    return {
      profile,
      publicRepos: publicReposWithDetails,
      privateRepos: privateReposWithDetails,
    };
  } catch (err) {
    console.error(err.response?.data || err.message);
    throw err;
  }
};
