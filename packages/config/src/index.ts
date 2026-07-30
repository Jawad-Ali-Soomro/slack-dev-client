export { env, normalizeBaseUrl } from './env'
export type { Env } from './env'
export {
  APP_ALLOWED_ROLES,
  APP_ROUTES,
  canAccessApp,
  getApiOrigin,
  getApiUrl,
  getAppIdForRole,
  getAppUrlForRole,
  getAssetUrl,
  joinUrl,
  navigateAfterAuth,
  redirectToAdmin,
  redirectToAppForRole,
  redirectToSuperAdmin,
  redirectToTenant,
} from './routes'
export type { AppRouteKey } from './routes'
