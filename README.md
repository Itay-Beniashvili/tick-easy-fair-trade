# TickEasy

TickEasy is a mobile-first event ticketing and resale platform. Buyers discover live music, sports, and theater events through a personalised recommendation feed, purchase tickets, and keep them in an in-app wallet with a unique QR code. The platform's core mission is anti-scalping: when a buyer resells a ticket, the price is capped at face value and enforced on the server, so tickets can never be flipped for profit. On top of buying and reselling, TickEasy supports group purchases (organise and split a block of tickets via a shareable link), an inquiry inbox that routes buyer questions straight to the right event manager, and a community board for finding partners, sharing rides, and coordinating around an event. Event managers get their own side of the app: they create and manage events, watch a live sales dashboard, and answer inquiries.

Live: https://tick-easy-fair-trade.vercel.app

## Tech stack

- **React 18** with **TypeScript**
- **Vite** for build and dev tooling
- **Tailwind CSS** with **shadcn/ui** components
- **Supabase** — Postgres database, Auth, and Row Level Security (RLS)
- **React Router** for routing and **TanStack Query** for data fetching
- **Recharts** for manager analytics and **Framer Motion** for animation

## Getting started

Prerequisites: Node.js 18+ and npm.

```sh
# 1. Install dependencies
npm install

# 2. Configure environment
#    Copy the example env file and fill in your Supabase project values.
cp .env.example .env
```

Set the three Supabase variables in `.env`:

```
VITE_SUPABASE_PROJECT_ID=your-project-ref
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-anon-key
```

The publishable (anon) key is safe to ship in the browser bundle — access is enforced by Row Level Security. Never commit the service-role key or database password.

```sh
# 3. Start the dev server
npm run dev
```


## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Production build |
| `npm run build:dev` | Build using development mode settings |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint over the project |

## Project structure

```
src/
  api/                 Typed data-access layer (events, tickets, resale, groups, …)
  components/          Reusable UI and app components (BottomNav, TicketCard, …)
  context/             React context providers (AuthContext, AppContext)
  integrations/        Supabase client and generated database types
  lib/                 Helpers (recommendation scoring, currency, utils)
  pages/               Route-level screens (Home, Wallet, Manager, …)
supabase/
  migrations/          SQL schema, RLS policies, and SECURITY DEFINER functions
docs/                  Architecture and review documentation
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for a full walkthrough of the technical, design, and UX architecture.

## Deployment

The app is a static Vite single-page application hosted on Vercel. The build command is `npm run build` (output in `dist/`). The three `VITE_SUPABASE_*` environment variables must be set in the hosting environment, and an SPA rewrite (all paths to `index.html`) is required so client-side routes resolve on refresh.
