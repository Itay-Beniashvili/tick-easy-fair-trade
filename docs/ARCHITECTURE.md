# TickEasy — Architecture

This document explains how TickEasy is built across three lenses: the **technical** architecture (how data and code are layered and secured), the **design** architecture (the visual system), and the **UX** architecture (the roles, screens, and flows). It is meant to be read top to bottom by a new developer or reviewer who wants to understand the whole system.

TickEasy is an event ticketing and anti-scalping resale platform. Buyers discover events, purchase tickets, hold them in a wallet, and can resell them — but never above face value. Event managers create events and track their sales and inquiries. Payments are **simulated**, but every flow mutates real database state, so the security and data-integrity story is genuine.

---

## A) Technical architecture

### The three layers

```
┌─────────────────────────────────────────────────────────────┐
│  React UI  (src/pages, src/components)                       │
│  • React Router routes + route guards                        │
│  • AuthContext (session + role)                              │
│  • TanStack Query / local state for data                     │
└───────────────▲─────────────────────────────────────────────┘
                │  imports typed functions only
┌───────────────┴─────────────────────────────────────────────┐
│  Typed data-access layer  (src/api/*.ts)                     │
│  • One module per domain: events, tickets, resale,           │
│    groups, inquiries, community, profile                     │
│  • Wraps the Supabase client; throws on error (unwrap)       │
│  • Ticket writes go ONLY through RPCs (never direct insert)  │
└───────────────▲─────────────────────────────────────────────┘
                │  supabase-js (REST + RPC over HTTPS, JWT auth)
┌───────────────┴─────────────────────────────────────────────┐
│  Supabase / Postgres                                         │
│  • Tables + Row Level Security (RLS) policies                │
│  • SECURITY DEFINER functions (RPCs) = the trusted core      │
│  • Auth (email + password, email verification)               │
└─────────────────────────────────────────────────────────────┘
```

**Layer 1 — Supabase / Postgres.** The schema, RLS policies, and a set of SECURITY DEFINER functions live in `supabase/migrations/*.sql`. This is the source of truth and the trust boundary.

**Layer 2 — Typed data-access layer (`src/api`).** Every database interaction goes through a small typed module. `src/api/client.ts` re-exports the Supabase client and an `unwrap()` helper that throws on error and returns typed rows (`EventRow`, `TicketRow`, etc., derived from the generated `Database` types). The UI never touches the Supabase client directly — it calls functions like `listEvents()`, `purchaseTicket()`, or `buyResale()`.

**Layer 3 — React UI.** Pages and components consume the `src/api` functions. `AuthContext` holds the session and resolved role; route guards (`ProtectedRoute`, `ManagerRoute`) gate access. The Supabase client is created once in `src/integrations/supabase/client.ts` from three `VITE_SUPABASE_*` environment variables, with the session persisted to `localStorage` and auto-refreshed.

### The security model (anti-scalping is enforced server-side)

The defining rule of TickEasy is that **clients cannot write tickets directly**. Migration `004_ticket_rpcs.sql` drops the direct `INSERT`/`UPDATE` RLS policies on `tickets`, so the only way to create or change a ticket is through a SECURITY DEFINER function. These functions run with elevated rights but enforce their own invariants and copy authoritative values from the server, not from the client:

- **`purchase_ticket(event_id, seat_info)`** — Looks up the event server-side, checks it isn't sold out, then copies the **price and event details from the `events` table** into the new ticket. The buyer is always `auth.uid()`. The client cannot supply or tamper with the price. It also decrements `available_tickets` and logs a `transactions` row.
- **`list_ticket_for_resale(ticket_id, price)`** — Requires the caller to own the ticket and **rejects any price above the ticket's true face value** (`p_price > t.price`). This is the anti-scalping cap, enforced in the database. (The client also pre-checks in `resale.ts`, but that is only a convenience — the server is authoritative.)
- **`unlist_ticket(ticket_id)`** — Owner-only; clears the for-sale flag.
- **`transfer_ticket_ownership(ticket_id, buyer_name)`** — Atomic resale purchase. The buyer is always `auth.uid()` (you can only buy for yourself), the ticket must be for sale, the cap is re-checked, ownership is reassigned, **a fresh QR/barcode is issued** (the old one is voided), and a `resale` transaction is logged.
- **`cancel_expired_groups()`** — Flips any active group whose reservation window has passed to `cancelled`.
- **`complete_group_if_paid(group_id)`** — Marks a group `completed` only when every participant has paid (so completion can't be forced).
- **`get_tickets_for_sale()`** — Returns the public marketplace listings (only non-sensitive fields of tickets where `is_for_sale = true`).

**RLS scopes everyone to their own data.** Examples from the migrations:
- `events` are world-readable, but a manager can only insert/update/delete rows where `auth.uid() = manager_id`.
- `inquiries` are readable by the author **or** by the manager of the event the inquiry targets (`exists (… events e where e.id = event_id and e.manager_id = auth.uid())`). An unrelated user sees nothing.
- `tickets` and `profiles` are readable only by their owner.
- Roles live in `user_roles`; a SECURITY DEFINER `has_role()` lets policies check roles safely. A signup trigger (`handle_new_user`) creates the profile + role from auth metadata and **never lets a user self-assign `admin`**.

**Payments are simulated, state is real.** No payment processor is involved, but purchases, resales, group payments, and ownership transfers all write real rows (`tickets`, `transactions`, `group_participants`, etc.), so every invariant above is exercised against real data.

### The hybrid recommendation formula

The buyer Home feed is ranked by a hybrid score implemented in `src/lib/recommend.ts`:

```
finalScore = w1 · prefScore + w2 · normalizedPurchaseScore
normalizedPurchaseScore = min(5, 1 + 4 · purchaseCount / 10)
w1 = 0.6   (weight of stated preferences)
w2 = 0.4   (weight of actual purchase behaviour)
```

- `prefScore` comes from onboarding: a selected genre scores 5, otherwise 0 (`preferenceScores` in `src/api/profile.ts`).
- `purchaseCount` is how many tickets the user has bought in that genre (`getPurchaseCountsByGenre`, which joins the user's tickets back to `events.genre`).
- `rankEvents()` sorts events by the score of their genre. Worked example: `finalScore(5, 3) ≈ 3.88`.

### Entities (tables)

| Table | Purpose |
|---|---|
| `profiles` | User profile + preferred genres/artists |
| `user_roles` | Role assignment (`user` / `manager` / `admin`); drives `has_role()` |
| `events` | Manager-owned events (price, genre, venue, inventory) |
| `tickets` | Owned tickets; price, QR, resale flag — written only via RPCs |
| `inquiries` | Buyer questions routed to the event's manager |
| `group_purchases` | A block of tickets being organised, with an expiry |
| `group_participants` | Members of a group and their paid status |
| `community_posts` | Partner / ride / other posts around an event |
| `transactions` | Audit/analytics log of primary and resale purchases |

### Deployment

- **Build:** Vite produces a static SPA into `dist/` (`npm run build`).
- **Hosting:** Vercel serves the static bundle. An **SPA rewrite** (all paths → `index.html`) is required so client-side routes resolve on a hard refresh.
- **Config:** The three `VITE_SUPABASE_*` variables are provided as environment variables at build time. The publishable/anon key is public by design; RLS is what enforces access. The service-role key is never shipped.

---

## B) Design architecture — "House Lights"

The visual system, defined in `src/index.css` and `tailwind.config.ts`, is themed as a **darkened concert venue lit by coloured stage gels**. It is fully token-based: every colour is a semantic CSS variable declared in `:root`, so the look stays consistent across all screens and can be re-themed by changing variables rather than components.

### Base and accents

- **Venue base:** a near-black auditorium background `#0E0D12` with a soft light foreground.
- **Three category "stage gel" accents**, exposed as CSS variables and Tailwind colours (`music`, `sports`, `theater`):
  - Music — magenta `#FF3D9A`
  - Sports — cyan `#19E0E0`
  - Theater — amber `#FFC24B`

### The active `--gel` variable

The signature mechanism is a single variable, `--gel`, that defaults to the music magenta. When a buyer selects a category on Home, the app sets `--gel` to that category's colour on the document root:

```
document.documentElement.style.setProperty('--gel', gelFor[category]);
```

Because buttons, glows, the bottom-nav highlight, the room vignette, chart bars, and shadows all read `hsl(var(--gel))`, **selecting a category relights the entire app** in that category's colour. This keeps theming coherent: one variable drives the whole palette.

### Typography

- **Syne** — display/poster headings (`.font-display`), tight letter-spacing for the "marquee" feel.
- **Plus Jakarta Sans** — body / UI text (the default `sans` family).
- **Space Mono** — prices, codes, and QR captions, giving money and ticket data a "ticket-stub" monospaced look.

### Signature motifs

- **Perforated ticket-stub seam** (`.stub-edge`) — a row of punched half-circles rendered via a radial-gradient, used as a divider so cards read like real tear-off tickets.
- **Glowing QR** — when a wallet ticket's code is revealed it sits on white under a `shadow-glow`, as if lit by a scanner. The QR pattern is a **deterministic hash of the ticket's `qr_code`** (in `TicketCard.tsx`), so it is stable across renders and unique per ticket.
- Semantic state tokens (`success` mint, `warning` amber, `destructive` red) and elevation/glow shadows are likewise variables, so cards, badges, and buttons stay consistent.

Because everything is token-based, a new screen automatically inherits the House Lights look just by using the semantic classes (`bg-background`, `card-elevated`, `text-gel`, `btn-primary-gradient`, etc.).

---

## C) UX architecture

### Two roles

TickEasy has two distinct experiences, separated at sign-up and enforced by route guards and `user_roles`:

- **Buyer** (`role = 'user'`) — discovers and buys tickets, manages a wallet, resells, joins groups, asks questions, and posts to the community.
- **Event manager** (`role = 'manager'`) — creates and manages events and reads analytics and inquiries.

The role is resolved in `AuthContext` (from `user_roles`) and held alongside the session. `ProtectedRoute` requires any authenticated user; `ManagerRoute` requires `role === 'manager'` and otherwise redirects to the manager login with an explanatory toast. **Email verification** is part of sign-up: if Supabase requires confirmation, there is no session yet, and the app surfaces a "needs verification" state.

### Buyer flow

```
Role selection (/)
   └─ Ticket Buyer → /login or /register  (email + password, verification)
        └─ Onboarding (/onboarding)  pick a category + favourite artists
             └─ Home (/home)  recommendation-ranked feed, relights per category
                  ├─ Event detail (/event/:id)  →  Buy (simulated) → purchase_ticket RPC
                  │        └─ Wallet (/wallet)  ticket with glowing QR
                  │              └─ Resell (capped at face value)  list_ticket_for_resale RPC
                  ├─ Marketplace (/marketplace)  buy a resale ticket → transfer_ticket_ownership
                  ├─ Group purchase (/group-purchase/:id)  shareable join link, split payment
                  ├─ Inquiries  ContactManagerModal → reaches the event's manager
                  └─ Community (/community)  partner / ride / other posts
```

Onboarding writes the buyer's preferred genres and artists to their profile; those preferences (plus purchase history) feed the hybrid recommender that orders the Home "For you" and featured sections. Buying, reselling, and buying-resale all route through the SECURITY DEFINER RPCs described in Section A, so the face-value cap and fresh-barcode-on-transfer guarantees hold.

### Manager flow

```
Role selection (/)
   └─ Event Manager → /manager/login or /manager/register
        └─ Dashboard (/manager)  stats cards + "tickets sold by event" bar chart
             ├─ Events (/manager/events)  list / create (/manager/events/new)
             ├─ Analytics (/manager/analytics)  aggregated from real rows
             └─ Inbox (/manager/inbox)  inquiries on the manager's own events (RLS-scoped)
```

The dashboard derives revenue, tickets sold, active events, and available inventory directly from the manager's own `events` rows, and the chart uses real per-event sales. The inbox only ever shows inquiries for events the signed-in manager owns, because RLS scopes the query at the database boundary.

### Navigation and guards

- **Buyers** use a floating, glassy **bottom navigation** (`BottomNav`) with Home, Tickets (wallet), Community, and Profile; the active tab glows in the current `--gel` colour.
- **Managers** use a sidebar on large screens (`ManagerSidebar`) and a mobile manager nav (`MobileManagerNav`).
- All buyer screens beyond auth are wrapped in `ProtectedRoute`; all manager screens are wrapped in `ManagerRoute`. Unauthenticated or wrong-role access is redirected, so the role boundary is consistent across the UI and the API.

### Summary

TickEasy is a three-layer system — a Postgres/Supabase trusted core, a typed `src/api` access layer, and a guarded React UI — wrapped in a single token-based visual language and split into two clearly-bounded role experiences. Its central promise, that resale tickets can never exceed face value, is not a UI nicety but a server-enforced invariant in SECURITY DEFINER functions, which is what makes the anti-scalping guarantee real.
