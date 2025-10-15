import React, { useState, useEffect } from "react";
import { useChat } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";
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
  Users,
  User,
  X,
  MessageCircle,
  ArrowBigUp,
} from "lucide-react";
import { userService } from "../services/userService";

const CreateChatModal = ({ isOpen, onClose }) => {
  const { createChat } = useChat();
  const { user } = useAuth();

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    // If avatar is already a full URL, return as is
    if (avatar.startsWith("http")) return avatar;
    // If avatar is a relative path, prefix with server URL
    return `http://localhost:4000${avatar.startsWith("/") ? "" : "/"}${avatar}`;
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
      const response = await userService.getUsers();
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
    if (chatType === 'direct') {
      // For direct chats, only allow one user
      setSelectedUsers([userId]);
    } else {
      // For group chats, allow multiple users
      setSelectedUsers((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
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
        chatType === "group" ? chatDescription : null
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
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-100000 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md mx-4 bg-white drak:bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create New Chat</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded">
              {error}
            </div>
          )}

          {/* Chat Type Selection */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Button
                type="button"
                variant={chatType === "direct" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setChatType("direct");
                  setSelectedUsers([]); // Clear selection when switching
                }}
                className="flex items-center gap-2 w-full"
              >
                <ArrowBigUp className="h-4 w-4" />
                Direct Message
              </Button>
              <Button
                type="button"
                variant={chatType === "group" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setChatType("group");
                  setSelectedUsers([]); // Clear selection when switching
                }}
                className="flex items-center gap-2 w-full"
              >
                <Users className="h-4 w-4" />
                Group Chat
              </Button>
            </div>
          </div>

          {/* Group Chat Fields */}
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

          {/* User Search */}
          <div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Selected Users */}
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
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => handleUserSelect(userId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* User List */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-lg h-6 w-6 border-b-2 border-primary"></div>
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

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateChat}
              disabled={selectedUsers.length === 0 || loading}
              className={"w-[150px] font-bold"}
            >
              {loading ? "Creating..." : "Create Chat"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateChatModal;
