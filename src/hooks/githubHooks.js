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