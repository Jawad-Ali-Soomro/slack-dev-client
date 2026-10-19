export function getExcludedUserIds({
  friends = [],
  friendRequests = [],
  currentUserId,
  extraIds = [],
}) {
  const ids = new Set(extraIds.map(String));

  if (currentUserId) {
    ids.add(String(currentUserId));
  }

  friends.forEach((friendship) => {
    const friendId = friendship?.friend?.id ?? friendship?.friend?._id;
    if (friendId) ids.add(String(friendId));
  });

  friendRequests.forEach((request) => {
    if (request?.status && request.status !== "pending") return;
    const senderId = request?.sender?.id ?? request?.sender?._id;
    const receiverId = request?.receiver?.id ?? request?.receiver?._id;
    if (senderId) ids.add(String(senderId));
    if (receiverId) ids.add(String(receiverId));
  });

  return ids;
}

export function filterRecommendableUsers(users = [], excludedIds = new Set()) {
  return users.filter((user) => user?.id && !excludedIds.has(String(user.id)));
}

export function getPendingRequestStatus(
  userId,
  friendRequests = [],
  currentUserId,
) {
  if (!userId || !currentUserId) return null;
  const targetId = String(userId);
  const me = String(currentUserId);

  for (const request of friendRequests) {
    if (request.status !== "pending") continue;
    const senderId = String(request?.sender?.id ?? request?.sender?._id ?? "");
    const receiverId = String(
      request?.receiver?.id ?? request?.receiver?._id ?? "",
    );

    if (senderId === me && receiverId === targetId) return "sent";
    if (senderId === targetId && receiverId === me) return "received";
  }

  return null;
}
