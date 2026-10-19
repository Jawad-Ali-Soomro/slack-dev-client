import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { PiUsersDuotone } from "react-icons/pi";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useChat } from "../contexts/chat-context";
import { chatService } from "../services/chat-service";

const EditGroupChatModal = ({ isOpen, chat, onClose }) => {
  const { updateGroup } = useChat();
  const logoInputRef = useRef(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [removeLogo, setRemoveLogo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !chat) return;
    setName(chat.name || "");
    setDescription(chat.description || "");
    setLogoFile(null);
    setRemoveLogo(false);
    setError("");
    setLogoPreview(chat.logo || "");
  }, [isOpen, chat]);

  useEffect(() => {
    return () => {
      if (logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  if (!isOpen || !chat) return null;

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Logo must be an image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Logo must be 5MB or smaller");
      return;
    }
    setLogoFile(file);
    setRemoveLogo(false);
    setLogoPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter a group name");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const updates = {
        name: name.trim(),
        description: description.trim(),
      };

      if (removeLogo) {
        updates.logo = null;
        updates.logoPublicId = null;
      } else if (logoFile) {
        const uploaded = await chatService.uploadGroupLogo(logoFile);
        updates.logo = uploaded.data.logo;
        updates.logoPublicId = uploaded.data.logoPublicId;
      }

      await updateGroup(chat._id, updates);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        className="mx-4 w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900"
        onClick={(event) => event.stopPropagation()}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Edit group</CardTitle>
            <Button variant="ghost" size="sm" className="h-12 w-12" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="rounded bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200/80 bg-gradient-to-b from-gray-50 to-white px-4 py-5 dark:border-white/10 dark:from-white/[0.04] dark:to-transparent">
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="group relative"
              aria-label="Change group logo"
            >
              <span className="flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-full border border-black/[0.06] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] ring-4 ring-white dark:border-white/10 dark:bg-zinc-800 dark:ring-zinc-900">
                {logoPreview && !removeLogo ? (
                  <img src={logoPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <PiUsersDuotone className="h-10 w-10 text-gray-700 dark:text-gray-200" />
                )}
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white bg-[#5c8a68] text-white shadow-md transition-transform group-hover:scale-105 dark:border-zinc-900 dark:bg-white dark:text-black">
                <Camera className="h-3.5 w-3.5" />
              </span>
            </button>
            <div className="max-w-full text-center">
              <p className="truncate text-base font-semibold tracking-tight text-gray-900 dark:text-white">
                {name.trim() || "Group name"}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!logoPreview || removeLogo) {
                    logoInputRef.current?.click();
                    return;
                  }
                  setLogoFile(null);
                  setRemoveLogo(true);
                }}
                className="mt-1 px-5 py-2 uppercase bg-[#5c8a68] text-white rounded-lg text-[9px] transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
              >
                {logoPreview && !removeLogo ? "Remove logo" : "Add a group logo"}
              </button>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>

          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Group name"
          />
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Group description"
            rows={3}
          />

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditGroupChatModal;
