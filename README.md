# BondGame — MVP

Mobile-first, production-like web PWA for couples. Two partners create tasks for each other, complete
daily/weekly challenges, earn Love Coins, spend them on real-world rewards, open reward cases, and
optionally unlock a mutually-consented private **Spicy Mode**.

Built to the spec in `GGrel_Design/BondGame_Unified_MVP_Master_Spec.md` as the source of truth.

## Stack

- **Next.js 15** App Router + React 19 + TypeScript
- **Tailwind CSS 3** with BondGame design tokens as CSS variables
- **PostgreSQL** + **Prisma** ORM (atomic wallet + case transactions)
- **Framer Motion** for sheets, case reveal animation
- **Custom bcrypt+cookie sessions** (Lucia-style, 30-day TTL, httpOnly+sameSite=lax)
- **web-push** + VAPID for push notifications
- **PWA**: hand-written `manifest.webmanifest` + `public/sw.js` (stale-while-revalidate shell, push
  handling with neutral spicy copy)
- **Zod** validation on every server action

No Firebase, no React Native, no PvP/leagues/monetization — per spec §6.2.

## Setup

### 1. Install

```bash
npm install
```

### 2. Start Postgres (Docker)

```bash
docker run -d --name bondgame-pg \
  -e POSTGRES_USER=bond -e POSTGRES_PASSWORD=bond -e POSTGRES_DB=bondgame \
  -p 5432:5432 postgres:16
```

Or point `DATABASE_URL` at an existing Postgres.

### 3. Environment

```bash
cp .env.example .env
npm run vapid    # prints VAPID keys — paste PUBLIC into both VAPID_PUBLIC_KEY and NEXT_PUBLIC_VAPID_PUBLIC_KEY
```

### 4. DB migrate + seed

```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 5. (Optional) Regenerate PWA icons

```bash
npm run icons
```

### 6. Run

```bash
npm run dev
open http://localhost:3000
```

## Demo logins

Both share password `bond2026`.

| Role     | Name    | Email                  |
|----------|---------|------------------------|
| Partner A | Артём  | artem@bondgame.dev     |
| Partner B | Маша   | masha@bondgame.dev     |

The pair is seeded active with 520/480 personal LC, 200 LC common wallet, today's daily challenges
partially progressed, a weekly challenge in flight, several example tasks in different states, and
1 seeded spicy case (visible only after both opt-in under `/spicy`).

## Core flows

- **Auth** — `/welcome` → `/signup` | `/login`
- **Pair setup** — `/pair/create` (generates 8-char invite) → `/pair/join` → `/pair/waiting` (polls)
- **App shell** — `/home`, `/tasks`, `/challenges`, `/shop`, `/profile` (bottom nav)
- **Tasks** — create, propose, bargain (max 2 rounds, 150% cap), accept, start, complete, confirm
  (with quality/speed bonus), dispute, cancel, exchange (“биржа”), lazy auto-expiry on read
- **Challenges** — daily (up to 3 selected / day), weekly, claim reward atomically once per period,
  `requiresBoth` splits 50/50 with round-up to A
- **Rewards & cases** — system + pair-custom templates, case builder (3–8 items, sum=100%, 40–600 LC),
  crypto-secure weighted draw inside `prisma.$transaction`, reveal sequence in `/shop/cases/[id]/open`
- **Spicy Mode** — `/spicy` gated by mutual consent; recomputed on every toggle; every spicy query is
  filtered at `lib/prisma` layer; all spicy push notifications use neutral copy
- **PWA** — service worker at `/sw.js`, install prompt on `/profile/settings`, push subscribe/unsubscribe
  via server actions + `/api/push/subscribe|unsubscribe`

## Project layout

```
prisma/           schema.prisma, seed.ts
public/           manifest.webmanifest, sw.js, icons/
scripts/          generate-icons.mjs
src/
  actions/        server actions (auth, pair, tasks, challenges, rewards, cases, spicy, push)
  app/            App Router tree
    (app)/        auth+pair guarded, uses AppShell + BottomNav
  components/     UI + feature cards
  lib/            prisma, auth, session, pair, wallet, tasks, cases, push, utils
  styles/         (CSS vars live in app/globals.css)
```

## Atomicity & security

Every wallet change + every case open is wrapped in `prisma.$transaction`. All server actions
validate pair membership (`requirePair()`) and spicy access (`requireSpicyEnabled()` or inline
`pair.spicyEnabled` check). Zod schemas guard every form/payload input. Sessions are validated
against the DB on every `requireUser` call.

## Scripts

- `npm run dev` — dev server (Turbopack)
- `npm run build` — generate Prisma client + Next build
- `npm run start` — production server
- `npm run lint` — next lint
- `npm run typecheck` — tsc --noEmit
- `npm run prisma:generate` — prisma generate
- `npm run prisma:migrate` — prisma migrate dev
- `npm run db:seed` — seed demo pair + content
- `npm run vapid` — generate VAPID keypair
- `npm run icons` — regenerate PWA icons

## Not in this pass

Per spec §6.2 these are explicitly out of scope: PvP, leagues, rankings, tournaments, Battle Pass,
Bond Points, public social, clubs, auctions, monetization, AI recommendations, cosmetic loot.

Scaffolded as TODO / stubs:
- Album / milestones full implementation (stub screen link only)
- Analytics event emission
- Password reset / email flows
- Background job scheduler (we use lazy expiry on read — see `sweepExpired` in `src/lib/tasks.ts`)
