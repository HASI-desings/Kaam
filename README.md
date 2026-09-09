# SkillX

Gig/skill marketplace for Pakistani students and young professionals.
Built per `App.md`, `Structure.md`, `Rules.md`, `Phases.md`, `Security.md`, `Design.md`.

## Stack
- Frontend: React + TypeScript + Tailwind (Vite)
- Backend: Supabase (Postgres, Auth, Edge Functions, Storage)
- Hosting: Vercel
- Currency: PKR

## Deploy from your phone (no terminal needed)

### 1. Push to GitHub
Upload this whole folder to a new GitHub repo (GitHub's mobile web upload works, or use the GitHub app).

### 2. Connect Supabase
This project is already pointed at your Supabase project via `.env.local`
(URL: `https://tlinykxgfkhyfhdvbctv.supabase.co`).

In the Supabase dashboard (mobile browser works fine):
1. Go to **SQL Editor** → run each file in `supabase/migrations/` **in order** (0001 → 0006), then `supabase/seed.sql`.
2. Go to **Edge Functions** → create each function listed in `supabase/functions/` (paste the `index.ts` content for each). Set the secret `SUPABASE_SERVICE_ROLE_KEY` under Edge Function secrets — find your service role key under Project Settings → API. **Never put this key in `.env.local` or any frontend file.**
3. Go to **Authentication → Providers** → enable Email and Phone (SMS) sign-in.

### 3. Deploy to Vercel
1. Go to vercel.com → New Project → import your GitHub repo.
2. In Environment Variables, add:
   - `VITE_SUPABASE_URL` = `https://tlinykxgfkhyfhdvbctv.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (your publishable/anon key)
   - `VITE_APP_CURRENCY` = `PKR`
3. Deploy. Vercel auto-detects Vite; `vercel.json` handles SPA routing.

## What's built
Full auth flow (email + mobile OTP, profile completion), wallet (deposit/withdraw with
proof upload, private balance, transaction ledger), job posting/feed/offers with
average-rate floor enforcement, job-in-progress with pause rules and progress tracking,
escrow lock/release via Edge Functions, in-app chat with server-side contact-sharing
moderation (pending/safe/violation), ratings, disputes, subscriptions, portfolio +
rehire, referrals, skill-verification quizzes, and admin review/dispute/rate-manager
tools.

## Explicitly open decisions (see `supabase/functions/_shared/config.ts`)
These are implemented behind named config values, not hardcoded guesses — confirm
and adjust before real money moves through the app:
- Mid-job request overage fee ceiling
- Penalty-money split between platform and affected party
- 30%-gap confirmation timeout
- Dispute escalation window
- Whether chat violations feed a trust score

## Not yet wired
- **Payment gateway** — no processor is integrated yet (deposits/withdrawals are
  proof-based + admin-approved for now, per Security.md's fail-safe default).
  Tell me which gateway (JazzCash, Easypaisa, Stripe, etc.) and I'll wire the
  webhook verification per Security.md #4.
- The escrow lock step in `JobDetails.tsx` calls `calculate-final-price` but the
  actual wallet debit + escrow hold isn't a separate Edge Function yet — add a
  `lock-escrow` function before this goes live with real money.
- Quiz question bank is a placeholder — needs real content per category.

## Rules this build follows
All money math is server-side only (Edge Functions), every table has RLS from
creation, no raw bank/card numbers are stored, no cash payments, wallet balances
are private, and chat contact-sharing detection runs server-side and fails closed.
