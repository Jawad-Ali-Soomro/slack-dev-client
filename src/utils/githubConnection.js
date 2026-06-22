export function isUserGithubConnected(user) {
  const github = user?.socialLinks?.github
  return Boolean(github?.id && github?.accessToken)
}

export function resolveUserId(user) {
  const id = user?.id ?? user?._id
  return id ? String(id) : null
}

export function getGithubDismissKey(userId) {
  return `github-connect-dismissed-${userId}`
}
