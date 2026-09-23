import axiosInstance from "../lib/axios";

const errorMessage = (data) => {
  const detail = data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || item).join(", ");
  }
  if (typeof detail === "string" && detail) return detail;
  return data?.message || "Assistant failed";
};

export const askAssistant = async (prompt) => {
  try {
    const response = await axiosInstance.post(
      "/api/auth/assistant/ask",
      { prompt },
      { timeout: 45000 },
    );
    return response.data;
  } catch (error) {
    throw new Error(errorMessage(error.response?.data) || error.message);
  }
};
