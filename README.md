# LoR Tracker Pro

> **Your Academic Applications, Organized**

LoR Tracker Pro is a professional web application for university students to manage letters of recommendation (LoR), statements of purpose (SOP), and application deadlines — all in one place. Stop juggling spreadsheets and email threads; let LoR Tracker Pro keep your entire application process organized and on time.

## Key Features

| Feature | Description |
|---|---|
| 📋 **LoR Request Tracking** | Track every letter of recommendation request in one place — professor, deadline, and status at a glance. |
| 📝 **SOP Manager** | Draft and manage Statements of Purpose for each college application with a built-in rich-text editor. |
| ✨ **AI-Powered Drafts** | Generate polished LoR drafts and smart suggestions with Google Gemini AI — tailored to each professor. |
| 🎓 **Faculty Network** | Keep a structured contact list of professors with their department, email, and areas of expertise. |
| 🔔 **Deadline Reminders** | Receive automatic in-app alerts when an application deadline is less than a week away. |
| 📥 **Export to PDF & DOCX** | Download finalized letters and SOPs as professional PDF or Word documents with one click. |

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

