# MultiTenant Client

A multi-tenant SaaS admin dashboard built with React 19, Vite 8, and TypeScript 6.

## Tech Stack

| Layer             | Library                                           |
| ----------------- | ------------------------------------------------- |
| UI framework      | React 19 + TypeScript 6 (strict)                  |
| Build tool        | Vite 8 (Rolldown) + Bun 1.3.8                     |
| Component library | MUI v9                                            |
| State management  | Redux Toolkit + RTK Query                         |
| Routing           | React Router v7 (`createBrowserRouter`)           |
| Forms             | react-hook-form + Zod v4 + @hookform/resolvers    |
| Data tables       | @tanstack/react-table v8                          |
| Animations        | framer-motion (page transitions)                  |
| Notifications     | react-hot-toast                                   |
| HTTP              | Custom axios base query with refresh-token reauth |

## Project Structure

```
src/
├── app/
│   ├── hooks.ts          # Typed useAppDispatch / useAppSelector
│   ├── providers.tsx     # AppProviders (Redux + MUI ThemeProvider + Toaster)
│   ├── router.tsx        # createBrowserRouter — lazy-loaded routes
│   └── store.ts          # Redux store (auth + ui + apiSlice)
│
├── features/
│   ├── auth/             # Login/logout/refresh mutations, authSlice (tokens + user + permissions)
│   ├── permissions/      # GET /api/v1/permissions endpoint
│   ├── products/         # Products CRUD (api, components, pages)
│   ├── reports/          # Reports summary page
│   ├── roles/            # Roles CRUD + GET /roles/current for RBAC
│   ├── tenants/          # Tenants CRUD (paginated)
│   ├── ui/               # uiSlice (theme mode + sidebar state)
│   └── users/            # Users CRUD (paginated, activate/deactivate, invite)
│
├── pages/                # Thin re-export wrappers consumed by the router
│
├── shared/
│   ├── api/
│   │   └── apiSlice.ts         # Root createApi — axios baseQuery with mutex-guarded 401 reauth
│   ├── components/
│   │   ├── AuthGuard.tsx       # Redirects unauthenticated users to /login
│   │   ├── ConfirmDialog.tsx   # Reusable delete-confirmation dialog
│   │   ├── DataTable.tsx       # @tanstack/react-table v8 + MUI Table + pagination
│   │   ├── PageTransition.tsx  # framer-motion fade+slide wrapper
│   │   └── PermissionGuard.tsx # Hides children when user lacks a permission
│   ├── constants/
│   │   └── permissions.ts      # Permission name constants (must match API values)
│   ├── hooks/
│   │   ├── useDebounce.ts      # Generic debounce hook
│   │   └── usePermission.ts    # Returns boolean for a given permission key
│   ├── layouts/
│   │   ├── AuthLayout.tsx      # Centered card for login / forgot-password / reset
│   │   └── DashboardLayout.tsx # Responsive sidebar + AppBar + RBAC sync
│   ├── theme/
│   │   └── theme.ts            # MUI createTheme factory (light / dark)
│   └── utils/
│       └── format.ts           # formatDate, formatCurrency helpers
│
└── types/
    └── api.ts            # All API request/response DTOs + ApiResponse envelope
```

## How to Run Locally

**Prerequisites:** [Bun](https://bun.sh) >= 1.3

```bash
# 1. Install dependencies
bun install

# 2. Copy the environment template and set your API base URL
cp .env.example .env
# Edit .env — set VITE_API_BASE_URL=https://multi-tenant-api.runasp.net

# 3. Start the dev server
bun run dev

# 4. Open http://localhost:5173
```

### Other commands

```bash
bun run build    # TypeScript check + production build (output: dist/)
bun run lint     # ESLint
bun run format   # Prettier
```

## API

Base URL is configured via `VITE_API_BASE_URL` in `.env`.

**Live API:** `https://multi-tenant-api.runasp.net`  
**Swagger UI:** `https://multi-tenant-api.runasp.net/swagger`

All responses follow the envelope:

```json
{
  "data": "<T>",
  "message": "string",
  "errors": { "code": "string", "details": {} },
  "traceId": "string"
}
```

## Architecture Notes

### RTK Query

A single `apiSlice` (`createApi`) lives in `src/shared/api/apiSlice.ts`. Every feature injects its own endpoints with `apiSlice.injectEndpoints`. This keeps the Redux store lean and the RTK cache unified across all features.

### Auth + Token Refresh

`baseQueryWithReauth` wraps axios. On a 401 response it acquires an `async-mutex` lock, calls `POST /auth/refresh` once (even under concurrent requests), updates the store with new tokens, and retries the original request transparently.

### RBAC

On mount, `DashboardLayout` calls `GET /api/v1/roles/current` and stores the returned permission names in `authSlice.permissions`. `usePermission(key)` checks membership in that list. `PermissionGuard` wraps any element and renders `null` when the permission is absent, hiding Create/Edit/Delete buttons for users who lack the matching permission.

> Permission name constants are in `src/shared/constants/permissions.ts`. Update the string values to match the exact names returned by `GET /api/v1/permissions` once confirmed against a live API response.

### Routing

All page components are lazy-loaded via `React.lazy`. `AuthGuard` wraps all dashboard routes and redirects to `/login` when unauthenticated. Page transitions use framer-motion `AnimatePresence` keyed on `location.pathname`.

### Vendor Chunking

`vite.config.ts` uses `rolldownOptions.output.manualChunks` to split the bundle into focused vendor chunks (react, mui, forms, table, motion) so no single file exceeds the 500 kB Vite threshold.
