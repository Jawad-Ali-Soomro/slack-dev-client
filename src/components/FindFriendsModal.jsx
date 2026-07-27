import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import friendService from "../services/friendService";
import UserDetailsModal from "./UserDetailsModal";
import FriendUserCard from "./friends/FriendUserCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  filterRecommendableUsers,
  getPendingRequestStatus,
} from "@/utils/friendSuggestions";
import { PiUserPlusDuotone } from "react-icons/pi";

const FindFriendsModal = ({
  isOpen,
  onClose,
  onRequestSent,
  excludedIds = new Set(),
  friendRequests = [],
  currentUserId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [sentIds, setSentIds] = useState(new Set());
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const excluded = useMemo(() => {
    const ids = new Set(excludedIds);
    sentIds.forEach((id) => ids.add(String(id)));
    return ids;
  }, [excludedIds, sentIds]);

  const loadUsers = useCallback(
    async (query) => {
      try {
        setLoading(true);
        const response = await friendService.searchUsersForFriends(query, 20);
        const users = filterRecommendableUsers(response.users || [], excluded);

        if (query.trim()) {
          setSearchResults(users);
        } else {
          setSuggestions(users);
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error loading users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    },
    [excluded],
  );

  const handleSendFriendRequest = async (userId) => {
    const status = getPendingRequestStatus(
      userId,
      friendRequests,
      currentUserId,
    );
    if (sendingId || sentIds.has(userId) || status === "sent") return;

    try {
      setSendingId(userId);
      await friendService.sendFriendRequest(userId);
      setSentIds((prev) => new Set([...prev, String(userId)]));
      setSuggestions((prev) =>
        prev.filter((u) => String(u.id) !== String(userId)),
      );
      setSearchResults((prev) =>
        prev.filter((u) => String(u.id) !== String(userId)),
      );
      toast.success("Friend request sent!");
      onRequestSent?.();
    } catch (error) {
      toast.error(error.message || "Failed to send friend request");
    } finally {
      setSendingId(null);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(
      () => {
        loadUsers(searchTerm.trim());
      },
      searchTerm.trim() ? 400 : 0,
    );

    return () => clearTimeout(timeoutId);
  }, [searchTerm, isOpen, loadUsers]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSearchResults([]);
      setSuggestions([]);
      setSentIds(new Set());
      setSendingId(null);
    }
  }, [isOpen]);

  const displayUsers = searchTerm.trim() ? searchResults : suggestions;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="find-friends-modal rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="find-friends-modal__header flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-theme-subtle border border-theme-subtle flex items-center justify-center">
                    <PiUserPlusDuotone className="h-5 w-5 text-theme" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white">
                      Find Friends
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Search or pick from suggestions
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-theme-subtle text-gray-500 hover:text-theme transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto max-h-[calc(85vh-88px)]">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme h-4 w-4 opacity-70" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by username or email..."
                    className="h-11 pl-10 rounded-xl border-theme-subtle bg-white/80 dark:bg-white/5 focus-visible:ring-theme/30"
                  />
                </div>

                {!searchTerm.trim() && (
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-theme" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Suggested for you
                    </p>
                  </div>
                )}

                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-[76px] rounded-2xl" />
                    ))}
                  </div>
                ) : displayUsers.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <div className="w-14 h-14 rounded-2xl bg-theme-subtle mx-auto mb-3 flex items-center justify-center">
                      <PiUserPlusDuotone className="h-7 w-7 text-theme opacity-70" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {searchTerm.trim()
                        ? `No users found for "${searchTerm}"`
                        : "No new suggestions right now"}
                    </p>
                    <p className="text-xs mt-1">
                      People you already know or have pending requests with are
                      hidden
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayUsers.map((person, index) => {
                      const requestStatus = getPendingRequestStatus(
                        person.id,
                        friendRequests,
                        currentUserId,
                      );
                      const isSent =
                        sentIds.has(String(person.id)) ||
                        requestStatus === "sent";

                      return (
                        <FriendUserCard
                          key={person.id}
                          person={person}
                          index={index}
                          onAvatarClick={(id) => {
                            setSelectedUserId(id);
                            setShowUserDetails(true);
                          }}
                          onAdd={handleSendFriendRequest}
                          isSending={sendingId === person.id}
                          requestStatus={isSent ? "sent" : requestStatus}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UserDetailsModal
        userId={selectedUserId}
        isOpen={Boolean(selectedUserId)}
        onClose={() => setSelectedUserId(null)}
      />
    </>
  );
};

export default FindFriendsModal;
