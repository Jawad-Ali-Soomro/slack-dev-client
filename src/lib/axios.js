import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  timeout: 20000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (error.response?.status === 304 && config && !config._retried304) {
      config._retried304 = true;
      const url = config.url || "";
      const joiner = url.includes("?") ? "&" : "?";
      config.url = `${url}${joiner}_=${Date.now()}`;
      return axiosInstance.request(config);
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
