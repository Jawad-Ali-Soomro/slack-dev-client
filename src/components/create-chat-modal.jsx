import { useState, useEffect } from "react";
import { useChat } from "../contexts/chat-context";
import { useAuth } from "../contexts/auth-context";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import {
  Search,
  User,
  X,
} from "lucide-react";
import { userService } from "../services/user-service";
import { PiUserDuotone, PiUsersDuotone } from "react-icons/pi";

const CreateChatModal = ({ isOpen, onClose }) => {
  const { createChat } = useChat();
  const { user } = useAuth();

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;

    if (avatar.startsWith("http")) return avatar;

    const apiUrl = import.meta.env.VITE_API_URL;
    return `${apiUrl}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [chatType, setChatType] = useState("direct");
  const [chatName, setChatName] = useState("");
  const [chatDescription, setChatDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers(1, 100);
      const filteredUsers = response.users.filter((u) => u.id !== user?.id);
      setUsers(filteredUsers);
    } catch (err) {
      setError("Failed to load users");
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    if (chatType === "direct") {
      setSelectedUsers([userId]);
    } else {
      setSelectedUsers((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId],
      );
    }
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select at least one user");
      return;
    }

    if (chatType === "group" && !chatName.trim()) {
      setError("Please enter a group name");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createChat(
        selectedUsers,
        chatType,
        chatType === "group" ? chatName : null,
        chatType === "group" ? chatDescription : null,
      );

      onClose();
      resetForm();
    } catch (err) {
      setError("Failed to create chat");
      console.error("Error creating chat:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSearchTerm("");
    setSelectedUsers([]);
    setChatType("direct");
    setChatName("");
    setChatDescription("");
    setError("");
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 icon flex items-center justify-center z-100 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md mx-4 gap-0 bg-white py-0 dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="px-5 pt-5 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle>Create New Chat</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4 icon" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-5 pt-4 pb-5">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded">
              {error}
            </div>
          )}

          <div className="flex w-fit items-center gap-1 rounded-[12px] bg-gray-100 p-1 dark:bg-white/5">
            {[
              { id: "direct", label: "Direct Message", Icon: PiUserDuotone },
              { id: "group", label: "Group Chat", Icon: PiUsersDuotone },
            ].map(({ id, label, Icon }) => {
              const active = chatType === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setChatType(id);
                    setSelectedUsers([]);
                  }}
                  className={`inline-flex h-9 items-center gap-2 rounded-[10px] px-3 text-sm font-medium ${
                    active
                      ? "bg-[#FF914B] text-white"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>

          {chatType === "group" && (
            <div className="space-y-4">
              <div>
                <Input
                  id="chatName"
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>
              <div>
                <Textarea
                  id="chatDescription"
                  value={chatDescription}
                  onChange={(e) => setChatDescription(e.target.value)}
                  placeholder="Enter group description"
                  rows={3}
                />
              </div>
            </div>
          )}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 icon text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div>
              <Label>Selected Users</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedUsers.map((userId) => {
                  const user = users.find((u) => u.id === userId);
                  return (
                    <Badge
                      key={userId}
                      variant="secondary"
                      className="flex items-center gap-1 py-2"
                    >
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={getAvatarUrl(user?.avatar)} />
                        <AvatarFallback className="text-xs">
                          {user?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {user?.username}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 icon p-0 ml-1"
                        onClick={() => handleUserSelect(userId)}
                      >
                        <X className="h-3 w-3 icon" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-[15px] h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-3 p-2 rounded hover:bg-muted cursor-pointer"
                  onClick={() => handleUserSelect(user.id)}
                >
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleUserSelect(user.id)}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getAvatarUrl(user.avatar)} />
                    <AvatarFallback>
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4">
            <Button variant="ghost" onClick={onClose} className="col-span-1">
              Cancel
            </Button>
            <Button onClick={handleCreateChat} disabled={selectedUsers.length === 0 || loading} className="col-span-1">
              {loading ? "Creating..." : "Create Chat"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateChatModal;
