# MultiTenant Client

A multi-tenant SaaS admin dashboard built with **React 19**, **Vite 8**, and **TypeScript 6**. It is the front end for the [MultiTenant Platform API](../server) — a hybrid-RBAC, tenant-isolated .NET backend.

## Tech Stack

| Layer             | Library                                                          |
| ----------------- | ---------------------------------------------------------------- |
| Language          | TypeScript 6 (strict, ES2023)                                    |
| UI framework      | React 19                                                         |
| Build tool        | Vite 8 (Rolldown) + Bun 1.3                                      |
| Component library | MUI v9 (`@mui/material`, `@mui/icons-material`) + Emotion        |
| State management  | Redux Toolkit 2 + RTK Query                                      |
| Routing           | React Router v7 (`createBrowserRouter`, lazy routes)             |
| Forms             | `mui-schema-form-builder` (wraps react-hook-form + Zod v4)       |
| Data tables       | `@tanstack/react-table` v8                                       |
| Charts            | `recharts` (dashboard metrics)                                   |
| Image cropping    | `react-easy-crop` (avatar / logo upload)                         |
| Dates             | `dayjs`                                                          |
| Animations        | `framer-motion` (page transitions)                               |
| Notifications     | `react-hot-toast`                                                |
| HTTP              | Axios (single instance, `withCredentials`, no baseURL — proxied) |
| Token refresh     | `async-mutex` (serialises concurrent 401 retries)                |

## Project Structure

```
src/
├── app/
│   ├── hooks.ts          # Typed useAppDispatch / useAppSelector
│   ├── providers.tsx     # Redux → MUI ThemeProvider → SnackbarProvider → Toaster
│   ├── router.tsx        # createBrowserRouter — all pages React.lazy()
│   └── store.ts          # auth + ui + apiSlice; logout resets ui + api cache
│
├── features/<domain>/    # one folder per domain
│   ├── api/<name>Api.ts  # apiSlice.injectEndpoints(...)
│   ├── slices/           # Redux slices (auth, ui only)
│   └── index.ts          # barrel export
│   # domains: auth, users, roles, tenants, tenantAdmins, tenantSettings,
│   #          dashboard, subscriptions, impersonation, activityLogs, files, ui
│
├── pages/                # one file per route (Page.tsx + .styles.ts + .types.ts)
│
├── shared/
│   ├── api/
│   │   ├── apiSlice.ts        # single createApi with all tag types
│   │   ├── axiosInstance.ts   # axios.create({ baseURL: '', withCredentials: true })
│   │   └── baseQuery.ts       # baseQueryWithReauth — mutex 401 retry + X-Tenant-Id injection
│   ├── components/            # AuthGuard, PermissionGuard, DataTable, ConfirmDialog,
│   │                          # AvatarUpload, AvatarManageModal, TenantPicker,
│   │                          # TenantContextGuard, SystemAdminGuard, TenantAdminGuard,
│   │                          # ViewDialog, ErrorPage, status chips, …
│   ├── constants/
│   │   ├── permissions.ts     # PERMISSIONS object (NOTE: uses .Update; server uses .Edit)
│   │   ├── filterOptions.ts   # shared select/filter option lists
│   │   └── avatarProps.ts     # shared avatar sizing props
│   ├── forms/
│   │   └── addressFields.ts   # Zod shapes, getAddressFields(), buildAddressPayload(), …
│   ├── hooks/                 # usePermission, useDebounce, useSnackbar, useTableState,
│   │                          # useFilterState, useItemDialog, useUrlTabs, usePageTitle, …
│   ├── layouts/               # AuthLayout (centered card), DashboardLayout (sidebar + appbar)
│   ├── theme/
│   │   └── theme.ts           # buildTheme('light'|'dark') — primary #1976d2, Inter, radius 8
│   └── utils/format.ts        # formatDate, formatCurrency
│
└── types/api.ts          # all TypeScript DTOs + ApiResponse envelope
```

## How to Run Locally

**Prerequisites:** [Bun](https://bun.sh) >= 1.3

```bash
# 1. Install dependencies
bun install

# 2. Copy the environment template and set your API base URL
cp .env.example .env
# Edit .env — set VITE_API_BASE_URL=http://localhost:5228 (or the live API)

# 3. Start the dev server
bun run dev

# 4. Open http://localhost:5173  (also reachable on the LAN via the host IP)
```

Vite proxies every `/api/*` request to `VITE_API_BASE_URL`, so authentication cookies
stay same-origin. `server.host: true` binds the dev server to `0.0.0.0` for mobile/LAN testing.

### Other commands

```bash
bun run build      # tsc -b && vite build  → dist/
bun run lint       # ESLint
bun run format     # Prettier
bun run typecheck  # tsc --noEmit
bun run check      # format + lint --fix + typecheck + build
```

A **Husky** pre-commit hook runs `lint-staged` (ESLint + Prettier auto-fix) on staged
`.ts/.tsx/.json/.css/.md` files.

## API

Base URL is configured via `VITE_API_BASE_URL` in `.env` and consumed only by the Vite
proxy — the axios instance itself uses an empty `baseURL` so all calls are same-origin.

**Live API:** `https://multi-tenant-api.runasp.net` · **Swagger UI:** `/swagger`

All responses follow the envelope:

```json
{
  "data": "<T>",
  "message": "string",
  "errors": { "code": "string", "details": {} },
  "traceId": "string"
}
```

`baseQueryWithReauth` unwraps `result.data.data` so hooks receive the payload directly.

## Architecture Notes

### RTK Query (single root apiSlice)

One `createApi` lives in `src/shared/api/apiSlice.ts`. Every feature calls
`apiSlice.injectEndpoints(...)` and exports the auto-generated hooks, keeping the Redux
store lean and the RTK cache unified. Tag types: `User`, `Tenant`, `TenantAdmin`, `Role`,
`Product`, `Report`, `Permission`, `Invitation`, `File`, `ActivityLog`, `Subscription`,
`TenantSettings`.

### Request flow & multi-tenancy

RTK Query hook → `baseQueryWithReauth` → reads `selectedTenantId` from `uiSlice` → injects
the `X-Tenant-Id` header (unless `skipTenantHeader: true` on the arg) → `axiosInstance.request()`.
SystemAdmin uses a **tenant picker** (`TenantPicker`) to set the active tenant; tenant-scoped
pages are wrapped in `TenantContextGuard`, which forces a SystemAdmin to pick a tenant first.

### Auth + token refresh

The JWT is stored by the server in an **HttpOnly cookie** (`access_token`) — it is never
read by JavaScript. On a 401 the base query acquires an `async-mutex` lock, calls
`POST /auth/refresh` once (even under concurrent requests), and transparently retries the
original request. Responses carrying `errors.code = "user_inactive" | "tenant_inactive"`
short-circuit to a toast + immediate logout (no refresh attempt).

### RBAC

`DashboardLayout` calls `GET /api/v1/auth/me` once per session and stores the returned
`permissions: string[]` in `authSlice`. `usePermission(key)` checks membership (optimistically
returning `true` while permissions are still loading). `<PermissionGuard permission={...}>`
renders `null` when the permission is absent, hiding Create/Edit/Delete controls. Route-level
guards (`AuthGuard`, `SystemAdminGuard`, `TenantAdminGuard`) redirect by role.

> Permission constants live in `src/shared/constants/permissions.ts`. **Note:** the client
> constants use `.Update` while the server canonical name is `.Edit` — prefer the server
> name when adding new ones.

### Forms — `mui-schema-form-builder` only

Raw `react-hook-form` / `<form>` are never used directly in JSX. Every form defines its fields
as `FieldConfig[]`, passes a Zod schema, and renders with `<FormBuilder>` or `<FormWizard>`:

```tsx
const schema = z.object({ name: z.string().min(1), password: z.string().min(8) });

const fields: FieldConfig[] = [
  { name: 'name', label: 'Name', type: FIELD_TYPE.TEXT, required: true },
  { name: 'password', label: 'Password', type: FIELD_TYPE.PASSWORD, required: true },
];

<FormBuilder schema={schema} fields={fields} onSubmit={handleSubmit} />;
```

`FilterForm` provides reactive (submit-less) filter toolbars for list pages. Shared address
fields and payload builders live in `src/shared/forms/addressFields.ts`.

### State

- **`authSlice`** — `{ user, permissions, permissionsLoaded, isAuthenticated }`; `user` persisted to `localStorage`.
- **`uiSlice`** — `{ themeMode, sidebarOpen, selectedTenantId, selectedTenantName }`.
- On **logout**, the root reducer resets `ui` + the RTK Query cache.

### Routing

Page components are lazy-loaded via `React.lazy`. Unauthenticated routes (`/login`,
`/forgot-password`, `/reset-password`, `/invitation/accept`, `/account-setup`) render inside
`AuthLayout`. Authenticated routes render inside `AuthGuard → DashboardLayout`:

| Route                                       | Guard                              |
| ------------------------------------------- | ---------------------------------- |
| `/dashboard`, `/profile`                    | any authenticated user             |
| `/users`, `/roles`                          | `TenantAdminGuard` (TenantAdmin ↑) |
| `/tenants`, `/tenant-admins`, `/audit-logs` | `SystemAdminGuard`                 |

Page transitions use framer-motion `AnimatePresence` keyed on `location.pathname`.

### Vendor chunking

`vite.config.ts` uses `rolldownOptions.output.manualChunks` to split the bundle into focused
vendor chunks (react, mui, forms, table, motion) so no single file exceeds Vite's threshold.
