import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Get the API base URL from environment variables
 * @returns {string} API base URL
 */
export function getApiUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:4000'
}

/**
 * Get full URL for an API resource path
 * @param {string} path - Resource path (e.g., '/api/users')
 * @returns {string} Full URL
 */
export function getApiResourceUrl(path) {
  const apiUrl = getApiUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${apiUrl}${cleanPath}`
}
