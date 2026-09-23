import axiosInstance from "../lib/axios";

const API_BASE = "/api/chat";

const chatUploadService = {
  uploadMultipleFiles: async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.post(
      `${API_BASE}/upload/multiple`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      },
    );

    return response.data;
  },

  fileUrl: (attachment) => {
    const raw = typeof attachment === "string" ? attachment : attachment?.url;
    if (!raw) return "";
    if (raw.startsWith("http")) return raw;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
    return `${baseUrl}${raw.startsWith("/") ? "" : "/"}${raw}`;
  },

  fileName: (attachment) => {
    if (typeof attachment === "string") {
      return decodeURIComponent(attachment.split("/").pop() || "file");
    }
    return attachment?.name || "file";
  },

  isImage: (attachment) => {
    const type = attachment?.mimetype || "";
    if (type.startsWith("image/")) return true;
    return /\.(png|jpe?g|gif|webp|svg)$/i.test(chatUploadService.fileName(attachment));
  },

  isPdf: (attachment) => {
    const type = attachment?.mimetype || "";
    if (type === "application/pdf") return true;
    return /\.pdf$/i.test(chatUploadService.fileName(attachment));
  },

  isVideo: (attachment) => {
    const type = attachment?.mimetype || "";
    return type.startsWith("video/");
  },

  isAudio: (attachment) => {
    const type = attachment?.mimetype || "";
    return type.startsWith("audio/");
  },

  formatFileSize: (bytes) => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  },
};

export default chatUploadService;
