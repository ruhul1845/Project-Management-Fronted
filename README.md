# Workline — Project Management Frontend

A responsive Next.js App Router frontend for the Project Management SaaS API in `../Project-Management-SaaS`. This project was created in its own folder using the `PH-Healthcare-Nextjs` starter's route, provider, and UI component structure.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The supplied `.env.local` already contains the deployed backend URL and the Google Web client ID. `API_BASE_URL` must include `/api/v1`.

## Frontend environment

| Variable | Purpose |
|---|---|
| `API_BASE_URL` | Server-only backend API base URL, e.g. `https://project-management-saa-s-six.vercel.app/api/v1` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google Web client ID for the browser sign-in button |
| `DEMO_OWNER_EMAIL`, `DEMO_OWNER_PASSWORD` | Dedicated organization owner demo account |
| `DEMO_MANAGER_EMAIL`, `DEMO_MANAGER_PASSWORD` | Dedicated organization manager demo account |
| `DEMO_MEMBER_EMAIL`, `DEMO_MEMBER_PASSWORD` | Dedicated organization member demo account |
| `SUPPORT_EMAIL` | Optional public support email shown on Contact |

Demo credentials are read only by the Next.js server. Their buttons become available when both email and password are set. The backend seed example only creates an owner and a system admin; add a registered manager and member to the demo organization before enabling all three role buttons. Use dedicated demo credentials rather than personal accounts.

For Google sign-in, add `http://localhost:3000` and the deployed frontend origin to the Google client's **Authorized JavaScript origins**. The popup callback flow does not use an Authorized redirect URI. The backend must use the same value in `GOOGLE_CLIENT_ID`.

For Stripe checkout, set the backend's `FRONTEND_URL` to the deployed frontend origin. Its checkout flow returns to `/billing/success` or `/billing/cancelled`. Configure the backend Stripe webhook so the subscription becomes active after payment.

## Architecture

- App Router Server Component pages and layouts, client components for interactive views
- Next.js `proxy.ts` protects workspace routes; backend permissions remain authoritative
- Next.js route handlers store backend access and refresh tokens in HTTP-only cookies and forward API calls
- TanStack Query caches API data and handles refreshes; mutation actions invalidate affected views
- TanStack Form and Zod validate core creation, authentication, profile, and workspace forms
- URL query parameters preserve list search, status, sorting, pagination, and calendar month
- Loading skeletons, error boundaries, empty states, responsive layouts, and role-aware navigation

## Main routes

Public: `/`, `/about`, `/features`, `/pricing`, `/contact`, `/faq`, `/login`, `/register`.

Workspace: `/workspace`, `/projects`, `/projects/[id]`, `/projects/[id]/board`, `/projects/[id]/tasks`, `/projects/[id]/sprints`, `/tasks/[id]`, `/tasks/mine`, `/teams`, `/teams/[id]`, `/members`, `/calendar`, `/notifications`, `/analytics`, `/audit`, `/billing`, `/settings`.

System administration: `/admin`, `/admin/users`, `/admin/organizations`.

## Checks

```bash
npx tsc --noEmit
npm run build
npm run lint
```
