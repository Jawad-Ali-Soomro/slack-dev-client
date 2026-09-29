import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getApiUrl() {
  return import.meta.env.VITE_API_URL;
}

export function getApiResourceUrl(path) {
  const apiUrl = getApiUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiUrl}${cleanPath}`;
}
