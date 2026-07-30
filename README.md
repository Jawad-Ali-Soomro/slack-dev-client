# Multi-Tenants Monorepo

Three frontends + one NestJS API.

## Apps

| App | Port | Allowed roles |
|-----|------|----------------|
| `apps/tenant` | http://localhost:6000 | `USER` |
| `apps/admin` | http://localhost:4000 | `ADMIN`, `OWNER`, `MANAGER`, `EMPLOYEE` |
| `apps/superadmin` | http://localhost:5000 | `SUPERADMIN` |

Shared API: `http://localhost:3000/api/v1`

## Packages

| Package | Purpose |
|---------|---------|
| `@multi-tenants/config` | Env validation + cross-app URLs |
| `@multi-tenants/api` | HTTP client + auth API |
| `@multi-tenants/auth` | Auth contexts, guards, login/signup UI |
| `@multi-tenants/ui` | Shared UI (Button, Sidebar, AnimateOnScroll) |
| `@multi-tenants/hooks` | Shared React hooks |
| `@multi-tenants/utils` | Utilities + token storage |
| `@multi-tenants/types` | Shared TypeScript types |
| `@multi-tenants/constants` | Shared constants |

## Setup

```bash
npm install
```

## Develop

```bash
# API
npm run dev:server

# Frontends (separate terminals)
npm run dev:tenant
npm run dev:admin
npm run dev:superadmin
```

Each app has its own `.env` with:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_ADMIN_URL=http://localhost:4000
VITE_SUPERADMIN_URL=http://localhost:5000
VITE_TENANTS_URL=http://localhost:6000
```

After login, users are redirected to the frontend that matches their role. Opening the wrong app while authenticated redirects automatically.
