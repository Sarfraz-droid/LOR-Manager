# LoR Manager

A professional platform for university students to track and organize Letters of Recommendation from professors.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + React 19 + Tailwind CSS  
- **Backend / Database**: [Supabase](https://supabase.com) (PostgreSQL)  
- **AI**: Google Genkit (AI-generated LoR drafts and suggestions)

## Getting Started

### 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your project dashboard and run the contents of [`supabase/schema.sql`](supabase/schema.sql) to create the required tables.
3. Copy your **Project URL** and **Anon public key** from *Settings → API*.

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
```

### 3. Install dependencies and run

```bash
npm install
npm run dev
```

The app will be available at <http://localhost:9002>.

## Project Structure

| Path | Description |
|---|---|
| `src/lib/supabase.ts` | Supabase client initialisation |
| `src/lib/store.ts` | React hook for all CRUD operations (backed by Supabase) |
| `src/lib/types.ts` | Shared TypeScript types |
| `supabase/schema.sql` | SQL schema – run once in Supabase SQL editor |

