export const getAvatarUrl = (avatar, username = "User") => {
  if (!avatar) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=128`;
  }

  if (avatar.startsWith("http")) {
    return avatar;
  }

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  return `${apiUrl}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
};

export const getAvatarProps = (avatar, username = "User") => {
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=128`;

  return {
    src: getAvatarUrl(avatar, username),
    onError: (e) => {
      e.target.src = fallbackUrl;
    },
  };
};
