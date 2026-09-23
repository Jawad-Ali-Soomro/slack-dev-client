import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  X,
  RefreshCw,
  Book,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useAuth } from "../contexts/auth-context";
import { toast } from "sonner";
import profileService from "../services/profile-service";
import UserAvatar from "./user-avatar";
import NotificationDropdown from "./notification-dropdown";
import { useSidebar } from "../contexts/sidebar-context";
import { RiMenu3Fill } from "react-icons/ri";
import { ThemeToggle } from "./theme-toggle";
import { PiUserDuotone } from "react-icons/pi";
import { Link, useNavigate } from "react-router-dom";
import Connections from "./connections";
import { Skeleton } from "./ui/skeleton";
import {
  isUserGithubConnected,
  getGithubDismissKey,
} from "@/utils/github-connection";

const DashboardHeader = () => {
  const { user, loading: authLoading, isAuthenticated, updateUser } =
    useAuth();
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) {
      setShowConnectionModal(false);
      return;
    }

    if (isUserGithubConnected(user)) {
      setShowConnectionModal(false);
      return;
    }

    const userId = user.id ?? user._id;
    const dismissed =
      userId && sessionStorage.getItem(getGithubDismissKey(String(userId)));

    setShowConnectionModal(!dismissed);
  }, [user, authLoading, isAuthenticated]);

  const handleCloseConnections = () => {
    const userId = user?.id ?? user?._id;
    if (userId) {
      sessionStorage.setItem(getGithubDismissKey(String(userId)), "1");
    }
    setShowConnectionModal(false);
  };

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "",
    bio: "",
    userLocation: "",
    website: "",
    phone: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [awards, setAwards] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [headerAwards, setHeaderAwards] = useState([]);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        bio: user.bio || "",
        userLocation: user.userLocation || "",
        website: user.website || "",
        phone: user.phone || "",
      });
      setAvatarPreview(user.avatar || "");
    }
  }, [user]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHeaderAwards = async () => {
      if (user) {
        try {
          const awardsResponse = await awardService.getMyAwards();
          setHeaderAwards(awardsResponse.awards || []);
          setTotalPoints(awardsResponse.totalPoints || 0);
        } catch (error) {
          console.error("Failed to fetch header awards:", error);
        }
      }
    };
    fetchHeaderAwards();
  }, [user?.id]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await profileService.getProfile();
      const profileUser = response.user;

      setProfileData({
        username: profileUser.username || "",
        bio: profileUser.bio || "",
        userLocation: profileUser.userLocation || "",
        website: profileUser.website || "",
        phone: profileUser.phone || "",
      });
      setAvatarPreview(profileUser.avatar || "");

      try {
        const awardsResponse = await awardService.getMyAwards();
        setAwards(awardsResponse.awards || []);
        setTotalPoints(awardsResponse.totalPoints || 0);
      } catch (error) {
        console.error("Failed to fetch awards:", error);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfileModal = () => {
    setShowProfileModal(true);
    fetchProfileData();
  };

  const applyUserUpdate = (nextUser) => {
    if (!nextUser) return;
    const avatar = nextUser.avatar
      ? nextUser.avatar.includes("?")
        ? `${nextUser.avatar}&t=${Date.now()}`
        : `${nextUser.avatar}?t=${Date.now()}`
      : nextUser.avatar;
    const merged = { ...nextUser, avatar };
    updateUser(merged);
    if (avatar) setAvatarPreview(avatar);
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);

      const response = await profileService.updateProfile(profileData);
      applyUserUpdate({ ...user, ...response.user });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setUploadingAvatar(true);

      const response = await profileService.uploadAvatar(file);
      applyUserUpdate({ ...user, avatar: response.user.avatar });
      setAvatarFile(file);

      toast.success("Avatar uploaded successfully!");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const { toggleSidebar } = useSidebar();

  return (
    <>
      <header className="bg-[#eee] dark:bg-[black] z-5 icon  border-gray-300 dark:border-gray-700 px-6 py-4 border-b fixed w-full">
        <div className={`flex items-center justify-between `}>
          <div className="flex justify-center items-center gap-4">
            <div
              className={`flex left-2 top-20 p-3 hover:bg-gray-100 cursor-pointer rounded-sm hover:text-black z-10`}
              onClick={() => toggleSidebar()}
            >
              <RiMenu3Fill />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <Link
                to="/learn-point"
                className="flex w-12 h-12 flex items-center justify-center  bg-transparent hover:bg-white dark:hover:bg-[rgba(255,255,255,.1)] cursor-pointer rounded-[15px]"
              >
                <Book className="w-4 h-4 icon" />
              </Link>
              <ThemeToggle className="flex w-12 h-12  hidden md:flex items-center justify-center border-none  bg-transparent hover:bg-white dark:hover:bg-[rgba(255,255,255,.1)] dark:hover:text-white hover:text-black cursor-pointer rounded-[15px]" />
            </div>
            <NotificationDropdown />

            <div className="flex items-center gap-3 ">
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {user?.username || "User"}
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={handleOpenProfileModal}
                  className="relative group"
                >
                  <UserAvatar
                    user={{
                      ...user,
                      avatar: avatarPreview || user?.avatar,
                    }}
                    size="xl"
                    onClick={handleOpenProfileModal}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {showProfileModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bg-black/20 inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-60 icon"
          onClick={() => setShowProfileModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-black rounded-[15px] shadow-2xl  border-gray-200 dark:border-gray-700 max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  Profile Settings
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {user?.email} • {user?.role}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchProfileData}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                  disabled={loading}
                  title="Refresh profile data"
                >
                  <RefreshCw
                    className={`w-5 h-5 icon ${loading ? "animate-spin" : ""}`}
                  />
                </button>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center mb-6">
              <div className="relative group mb-2">
                <UserAvatar
                  user={{
                    ...user,
                    avatar: avatarPreview || user?.avatar,
                  }}
                  size="2xl"
                />
                <label className="absolute -bottom-1 rounded-[15px] bg-black dark:bg-white text-white dark:text-black -right-1 w-6 h-6 flex items-center justify-center cursor-pointer transition-colors">
                  <Camera className="w-3 h-3 icon" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>

              {awards.length > 0 && (
                <div className="flex items-center gap-1 mt-2 mb-2">
                  {awards.slice(0, 5).map((award, idx) => (
                    <div
                      key={idx}
                      className="text-xs leading-none"
                      title={`${award.name}: ${award.description}`}
                    >
                      {award.icon}
                    </div>
                  ))}
                  {awards.length > 5 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      +{awards.length - 5}
                    </div>
                  )}
                </div>
              )}

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {uploadingAvatar
                  ? "Uploading..."
                  : "Click the camera icon to upload a new avatar"}
              </p>

              <div className="flex gap-4 mt-4 text-center flex-wrap justify-center">
                <div className="p-2 px-5 rounded-[15px] bg-gray-100 dark:bg-black">
                  <div className="text-sm font-medium uppercase flex gap-2 justify-center items-center text-green-600 dark:text-green-400">
                    {user?.emailVerified ? "Verified" : "Pending"}
                  </div>
                </div>
                {totalPoints > 0 && (
                  <div className="px-5 py-2 bg-gray-100 dark:bg-black rounded-[15px]">
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {totalPoints} Points
                    </div>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center flex-col gap-4 py-8 rounded-[15px]">
                <Skeleton className={"w-10 bg-gray-200 h-10 w-full"} />
                <Skeleton className={"w-10 bg-gray-200 h-20 w-full"} />
                <Skeleton className={"w-10 bg-gray-200 h-10 w-full"} />
                <Skeleton className={"w-10 bg-gray-200 h-10 w-full"} />
                <Skeleton className={"w-10 bg-gray-200 h-10 w-full"} />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Input
                    value={profileData.username}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        username: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>

                <div>
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full"
                    rows="3"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <Input
                    value={profileData.userLocation}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        userLocation: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full"
                    placeholder="Your location"
                  />
                </div>

                <div>
                  <Input
                    value={profileData.website}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        website: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="w-full"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <Input
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full"
                    placeholder="Your phone number"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex-1"
                  disabled={loading}
                >
                  <PiUserDuotone className="w-4 h-4 icon icon mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        username: user?.username || "",
                        bio: user?.bio || "",
                        userLocation: user?.userLocation || "",
                        website: user?.website || "",
                        phone: user?.phone || "",
                      });
                      setAvatarFile(null);
                      setAvatarPreview(user?.avatar || "");
                    }}
                    className="flex-1"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleProfileUpdate}
                    className="flex-1"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {showConnectionModal && (
        <Connections
          isOpen={showConnectionModal}
          onClose={handleCloseConnections}
        />
      )}
    </>
  );
};

export default DashboardHeader;
