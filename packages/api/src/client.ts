import { getApiUrl } from '@multi-tenants/config'
import { getAccessToken } from '@multi-tenants/utils'

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData

  const headers: Record<string, string> = {
    ...(!isFormData && options.body
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(options.headers as Record<string, string> | undefined),
  }

  const accessToken = getAccessToken()
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(getApiUrl(path), {
    ...options,
    headers,
  })

  const data = (await response.json().catch(() => null)) as {
    message?: string | string[]
    error?: string
  } | null

  if (!response.ok) {
    const message = data?.message ?? data?.error ?? 'Request failed'
    throw new Error(Array.isArray(message) ? message.join(', ') : String(message))
  }

  return data as T
}
