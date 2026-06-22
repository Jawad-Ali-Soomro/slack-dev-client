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
    console.error("Error fetching GitHub profile:", err.response?.data || err.message);
    throw err;
  }
};


export const getGithubRepos = async (token) => {
  try {
    const profile = await getGithubProfile(token);
    const username = profile.login;

    const [allReposRes, publicReposRes] = await Promise.all([
      axios.get("https://api.github.com/user/repos?visibility=all", {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "Slack Developers",
        },
      }),
      axios.get(`https://api.github.com/users/${username}/repos?type=public`, {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "Slack Developers",
        },
      }),
    ]);

    const allRepos = allReposRes.data;
    const publicRepos = publicReposRes.data;

    const privateRepos = allRepos.filter((repo) => repo.private);

    return { publicRepos, privateRepos };
  } catch (err) {
    console.error("Error fetching GitHub repos:", err.response?.data || err.message);
    throw err;
  }
};

export const getGithubPulls = async (token, owner, repo) => {
  try {
    const res = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      headers: {
        Authorization: `token ${token}`,
        "User-Agent": "Slack Developers",
      },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching GitHub pulls:", err.response?.data || err.message);
    throw err;
  }
};

export const getGithubIssues = async (token, owner, repo) => {
  try {
    const res = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      headers: {
        Authorization: `token ${token}`,
        "User-Agent": "Slack Developers",
      },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching GitHub issues:", err.response?.data || err.message);
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
    console.error("Error fetching GitHub contributors:", err.response?.data || err.message);
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
    console.error("Error fetching GitHub languages:", err.response?.data || err.message);
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
    console.error("Error fetching GitHub branches:", err.response?.data || err.message);
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
    console.error("Error fetching GitHub commits:", err.response?.data || err.message);
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
    console.error("Error creating GitHub pull request:", err.response?.data || err.message);
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
        })
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