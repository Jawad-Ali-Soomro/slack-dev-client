import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@/contexts/auth-context";
import { decryptData } from "@/utils/encryption";
import { getGithubDetails } from "@/hooks/github-hooks";
import {
  setGithubData,
  clearGithubData,
  setLoading,
  setError,
} from "@/services/github-slice";
import { isUserGithubConnected, resolveUserId } from "@/utils/github-connection";
import axiosInstance from "@/lib/axios";

export { isUserGithubConnected } from "@/utils/github-connection";
export { clearGithubStorage } from "@/utils/github-storage";

export async function connectGithub() {
  const response = await axiosInstance.get("/api/auth/github/url");
  if (response.data?.url) {
    window.location.href = response.data.url;
  }
}

export default function useGithubRepos({ autoFetch = true } = {}) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const dispatch = useDispatch();
  const {
    data: encryptedData,
    userId: cachedUserId,
    githubUserId: cachedGithubUserId,
    loading,
    error,
  } = useSelector((state) => state.github);

  const currentUserId = resolveUserId(user);
  const githubAccountId = user?.socialLinks?.github?.id
    ? String(user.socialLinks.github.id)
    : null;
  const githubToken = user?.socialLinks?.github?.accessToken ?? null;
  const isGithubConnected = isUserGithubConnected(user);

  const isCacheValid = useMemo(() => {
    if (!isGithubConnected || !currentUserId || !encryptedData) return false;
    if (!cachedUserId || cachedUserId !== currentUserId) return false;
    if (!cachedGithubUserId || cachedGithubUserId !== githubAccountId)
      return false;
    return true;
  }, [
    isGithubConnected,
    currentUserId,
    encryptedData,
    cachedUserId,
    cachedGithubUserId,
    githubAccountId,
  ]);

  const githubData = useMemo(() => {
    if (!isCacheValid || !encryptedData) return null;
    return decryptData(encryptedData);
  }, [encryptedData, isCacheValid]);

  const repos = useMemo(() => {
    if (!githubData) return [];
    const publicRepos = githubData.publicRepos || [];
    const privateRepos = githubData.privateRepos || [];
    return [...publicRepos, ...privateRepos];
  }, [githubData]);

  const githubRepos = useMemo(
    () =>
      repos.map((repo) => ({
        id: String(repo.id),
        name: repo.name,
        fullName: repo.full_name || repo.name,
        private: repo.private,
        language: repo.language,
        raw: repo,
      })),
    [repos],
  );

  const fetchRepos = useCallback(
    async (force = false) => {
      if (!currentUserId || !isGithubConnected || !githubToken) {
        dispatch(clearGithubData());
        return;
      }

      if (!force && isCacheValid) return;

      try {
        dispatch(setLoading());
        const data = await getGithubDetails(githubToken);

        if (data?.profile?.id && String(data.profile.id) !== githubAccountId) {
          dispatch(clearGithubData());
          dispatch(
            setError("GitHub account mismatch. Please reconnect GitHub."),
          );
          return;
        }

        dispatch(
          setGithubData({
            userId: currentUserId,
            githubUserId: data?.profile?.id ?? githubAccountId,
            data,
          }),
        );
      } catch (err) {
        console.error(err);
        dispatch(setError(err.message || "Failed to fetch GitHub data"));
      }
    },
    [
      currentUserId,
      isGithubConnected,
      githubToken,
      githubAccountId,
      isCacheValid,
      dispatch,
    ],
  );

  useEffect(() => {
    if (authLoading) return;

    const hasStaleCache = Boolean(
      encryptedData || cachedUserId || cachedGithubUserId,
    );
    const shouldClear =
      hasStaleCache &&
      (!currentUserId ||
        !isGithubConnected ||
        (cachedUserId && currentUserId && cachedUserId !== currentUserId) ||
        (cachedGithubUserId &&
          githubAccountId &&
          cachedGithubUserId !== githubAccountId) ||
        (encryptedData && !cachedUserId) ||
        (encryptedData && !cachedGithubUserId));

    if (shouldClear) {
      dispatch(clearGithubData());
      return;
    }

    if (autoFetch && isGithubConnected && !isCacheValid) {
      fetchRepos();
    }
  }, [
    authLoading,
    autoFetch,
    currentUserId,
    isGithubConnected,
    isCacheValid,
    encryptedData,
    cachedUserId,
    cachedGithubUserId,
    githubAccountId,
    fetchRepos,
    dispatch,
  ]);

  const needsGithubConnect =
    isAuthenticated && !authLoading && Boolean(user) && !isGithubConnected;

  return {
    githubData: isGithubConnected ? githubData : null,
    githubRepos: isGithubConnected ? githubRepos : [],
    repos: isGithubConnected ? repos : [],
    profile: isGithubConnected ? (githubData?.profile ?? null) : null,
    loading: isGithubConnected ? loading : false,
    error,
    isGithubConnected,
    needsGithubConnect,
    connectGithub,
    fetchRepos,
    refetch: () => fetchRepos(true),
  };
}
