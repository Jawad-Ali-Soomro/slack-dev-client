import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Check,
  X,
  Users,
  Clock,
  Trash2,
  Send,
  UserPlus,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import friendService from "../services/friendService";
import { useAuth } from "../contexts/AuthContext";
import UserDetailsModal from "../components/UserDetailsModal";
import FindFriendsModal from "../components/FindFriendsModal";
import FriendUserCard from "../components/friends/FriendUserCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PiUserDuotone,
  PiUserPlusDuotone,
  PiUsersDuotone,
} from "react-icons/pi";
import { cn } from "@/lib/utils";
import {
  getExcludedUserIds,
  filterRecommendableUsers,
  getPendingRequestStatus,
} from "@/utils/friendSuggestions";

const Friends = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("friends");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showFindFriendsModal, setShowFindFriendsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [sentSuggestionIds, setSentSuggestionIds] = useState(new Set());
  const [actionId, setActionId] = useState(null);

  const handleUserAvatarClick = (userId) => {
    setSelectedUserId(userId);
    setShowUserDetails(true);
  };

  const loadFriends = useCallback(async () => {
    const response = await friendService.getFriends();
    setFriends(response.friends || []);
  }, []);

  const loadFriendRequests = useCallback(async () => {
    const response = await friendService.getFriendRequests();
    setFriendRequests(response.requests || []);
  }, []);

  const loadStats = useCallback(async () => {
    const response = await friendService.getFriendStats();
    setStats(response.stats);
  }, []);

  const loadSuggestions = useCallback(async () => {
    const response = await friendService.searchUsersForFriends("", 12);
    setSuggestions(response.users || []);
  }, []);

  const excludedIds = useMemo(
    () =>
      getExcludedUserIds({
        friends,
        friendRequests,
        currentUserId: user?.id,
        extraIds: [...sentSuggestionIds],
      }),
    [friends, friendRequests, user?.id, sentSuggestionIds],
  );

  const visibleSuggestions = useMemo(
    () => filterRecommendableUsers(suggestions, excludedIds),
    [suggestions, excludedIds],
  );

  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        loadFriends(),
        loadFriendRequests(),
        loadStats(),
        loadSuggestions(),
      ]);
    } catch (error) {
      console.error("Error refreshing friends data:", error);
    }
  }, [loadFriends, loadFriendRequests, loadStats, loadSuggestions]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setLoading(true);
        setStatsLoading(true);
        setSuggestionsLoading(true);
        await Promise.all([
          loadFriends(),
          loadFriendRequests(),
          loadStats(),
          loadSuggestions(),
        ]);
      } catch (error) {
        if (mounted) {
          console.error("Error loading friends page:", error);
          toast.error("Failed to load friends");
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setStatsLoading(false);
          setSuggestionsLoading(false);
        }
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, [loadFriends, loadFriendRequests, loadStats, loadSuggestions]);

  const handleSendFriendRequest = async (userId) => {
    const status = getPendingRequestStatus(userId, friendRequests, user?.id);
    if (sendingId || sentSuggestionIds.has(userId) || status === "sent") return;

    try {
      setSendingId(userId);
      await friendService.sendFriendRequest(userId);
      setSentSuggestionIds((prev) => new Set([...prev, String(userId)]));
      setSuggestions((prev) =>
        prev.filter((u) => String(u.id) !== String(userId)),
      );
      toast.success("Friend request sent!");
      await Promise.all([loadFriendRequests(), loadStats(), loadSuggestions()]);
    } catch (error) {
      toast.error(error.message || "Failed to send friend request");
    } finally {
      setSendingId(null);
    }
  };

  const handleRespondToRequest = async (requestId, action) => {
    try {
      setActionId(requestId);
      await friendService.respondToFriendRequest(requestId, action);
      toast.success(`Friend request ${action}ed!`);
      await refreshAll();
    } catch (error) {
      toast.error(error.message || `Failed to ${action} friend request`);
    } finally {
      setActionId(null);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm("Are you sure you want to remove this friend?")) return;

    try {
      setActionId(friendId);
      await friendService.removeFriend(friendId);
      toast.success("Friend removed!");
      await refreshAll();
    } catch (error) {
      toast.error(error.message || "Failed to remove friend");
    } finally {
      setActionId(null);
    }
  };

  const pendingReceivedRequests = friendRequests.filter(
    (req) => req.receiver.id === user?.id && req.status === "pending",
  );

  const pendingSentRequests = friendRequests.filter(
    (req) => req.sender.id === user?.id && req.status === "pending",
  );

  const statPills = [
    {
      label: "Total Friends",
      value: stats?.totalFriends ?? 0,
      icon: Users,
      color: "var(--theme-accent)",
    },
    {
      label: "Received",
      value: stats?.pendingReceivedRequests ?? 0,
      icon: Clock,
      color: "#f59e0b",
    },
    {
      label: "Sent",
      value: stats?.pendingSentRequests ?? 0,
      icon: Send,
      color: "#6b7280",
    },
  ];

  const renderPersonCard = ({ person, actions, index = 0 }) => (
    <FriendUserCard
      person={person}
      index={index}
      onAvatarClick={handleUserAvatarClick}
      action={actions}
    />
  );

  document.title = "Friends - Manage Your Friends";

  return (
    <div className="dashboard-page min-h-screen pt-6 md:pt-10 pb-10">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="dashboard-page-header">
            <div className="dashboard-welcome">
              <div className="dashboard-welcome__icon">
                <PiUserDuotone size={22} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                  Friends
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                  Connect, manage requests, and grow your network
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 min-w-[240px]">
              {statsLoading
                ? [1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[72px] rounded-xl" />
                  ))
                : statPills.map((pill) => (
                    <div key={pill.label} className="dashboard-pill h-13">
                      <div
                        className="dashboard-pill__dot"
                        style={{ background: pill.color }}
                      />
                      <div className="flex items-center gap-2 justify-between w-full uppercase">
                        <p className="text-[13px] font-bold tracking-wider text-gray-500 dark:text-gray-400">
                          {pill.label}
                        </p>
                        <p className="text-[13px] font-bold text-gray-500 dark:text-white">
                          {pill.value}
                        </p>
                      </div>
                    </div>
                  ))}
            </div>
            <Button
              type="button"
              onClick={() => setShowFindFriendsModal(true)}
              className="h-12 px-5 w-[200px] rounded-xl font-bold bg-theme-gradient text-white hover:opacity-90 shadow-sm"
            >
              <PiUserPlusDuotone className="h-4 w-4 mr-2" />
              Find Friends
            </Button>
          </div>
        </div>

        {/* Suggested friends */}
        <div className="dashboard-card p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-theme" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Suggested for you
            </h2>
          </div>

          {suggestionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-[76px] rounded-xl" />
              ))}
            </div>
          ) : visibleSuggestions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
              No new suggestions. Everyone you know may already be connected or
              pending.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {visibleSuggestions.map((person, index) => {
                const requestStatus = getPendingRequestStatus(
                  person.id,
                  friendRequests,
                  user?.id,
                );
                const isSent =
                  sentSuggestionIds.has(String(person.id)) ||
                  requestStatus === "sent";

                return (
                  <FriendUserCard
                    key={person.id}
                    person={person}
                    index={index}
                    onAvatarClick={handleUserAvatarClick}
                    onAdd={handleSendFriendRequest}
                    isSending={sendingId === person.id}
                    requestStatus={isSent ? "sent" : requestStatus}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap w-full h-auto gap-2 bg-transparent p-0 mb-5">
            {[
              { value: "friends", label: "Friends", count: friends.length },
              {
                value: "received",
                label: "Received",
                count: pendingReceivedRequests.length,
              },
              {
                value: "sent",
                label: "Sent",
                count: pendingSentRequests.length,
              },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "h-11 px-5 rounded-xl cursor-pointer h-12 border text-sm font-bold transition-all",
                  activeTab === tab.value
                    ? "bg-black text-black dark:bg-white dark:text-black border-transparent shadow-sm"
                    : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10",
                )}
              >
                {tab.label} ({tab.count})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="friends" className="mt-0">
            <div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-[80px] rounded-xl" />
                  ))}
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <PiUsersDuotone className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No friends yet</p>
                  <p className="text-sm mt-1">
                    Send a request from suggestions above
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {friends.map((friendship, index) =>
                    renderPersonCard({
                      person: friendship.friend,
                      index,
                      actions: (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={actionId === friendship.friend.id}
                          onClick={() =>
                            handleRemoveFriend(friendship.friend.id)
                          }
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-9 w-9 p-0 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ),
                    }),
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="received" className="mt-0">
            <div>
              {pendingReceivedRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No pending requests</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pendingReceivedRequests.map((request, index) =>
                    renderPersonCard({
                      person: request.sender,
                      index,
                      actions: (
                        <div className="flex gap-2 shrink-0">
                          <Button
                            type="button"
                            size="sm"
                            disabled={actionId === request.id}
                            onClick={() =>
                              handleRespondToRequest(request.id, "accept")
                            }
                            className="h-9 w-9 p-0 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={actionId === request.id}
                            onClick={() =>
                              handleRespondToRequest(request.id, "reject")
                            }
                            className="h-9 w-9 p-0 rounded-lg bg-red-500 hover:bg-red-600 text-white"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ),
                    }),
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sent" className="mt-0">
            <div>
              {pendingSentRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Send className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No sent requests</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pendingSentRequests.map((request, index) =>
                    renderPersonCard({
                      person: request.receiver,
                      index,
                      actions: (
                        <Badge
                          variant="outline"
                          className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-500/10 shrink-0"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      ),
                    }),
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <FindFriendsModal
          isOpen={showFindFriendsModal}
          onClose={() => setShowFindFriendsModal(false)}
          onRequestSent={refreshAll}
          excludedIds={excludedIds}
          friendRequests={friendRequests}
          currentUserId={user?.id}
        />

        <UserDetailsModal
          userId={selectedUserId}
          isOpen={showUserDetails}
          onClose={() => {
            setShowUserDetails(false);
            setSelectedUserId(null);
          }}
        />
      </div>
    </div>
  );
};

export default Friends;
