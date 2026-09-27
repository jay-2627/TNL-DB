# TNL Command Center — Zero-Node Setup

You do **not** need Node.js installed on your laptop for this deployment path.

## What you need

- A GitHub account
- A Supabase account
- A Vercel account
- A web browser

## 1. Supabase database

Create a new Supabase project.

Open **SQL Editor** and run these files in this order:

1. `sql/schema.sql`
2. `sql/seed.sql`

The seed creates the sample TNL clients, campaigns, tasks, payments, team data, CRM leads, services, and the founder account.

Default login:

- Name: `JD`
- Password: `FOUNDER OF TNL`

For production, change this password before sharing the dashboard.

## 2. GitHub

Create a new GitHub repository and upload the project files from this ZIP.

Do not upload `.env.local` or real secrets.

## 3. Vercel

Import the GitHub repository into Vercel.

Vercel builds and runs the Next.js application on its servers, so Node.js does not need to be installed locally.

Add these environment variables in Vercel:

- `DATABASE_URL` — Supabase Postgres connection string
- `JWT_SECRET` — a long random secret
- `FOUNDER_PASSWORD` — your chosen founder password
- `NEXT_PUBLIC_APP_URL` — your Vercel URL after the first deployment

Redeploy after adding or changing environment variables.

## 4. Recommended order

Browser → Supabase → GitHub → Vercel → Live TNL Command Center

You can do the entire setup without opening a terminal on your laptop.
