# TNL Command Center — Full Stack

A Next.js + PostgreSQL founder dashboard for TNL.

## Browser-only deployment

You do **not** need Node.js installed on your laptop if you deploy with GitHub + Vercel + Supabase.

1. Create a Supabase project.
2. In Supabase SQL Editor, run `sql/schema.sql`.
3. In the same SQL Editor, run `sql/seed.sql`.
4. Upload this project to GitHub through the browser.
5. Import the GitHub repository into Vercel.
6. Add the Vercel environment variables shown in `.env.example` / `ZERO_NODE_SETUP.md`.
7. Deploy.

Default seeded founder login:

- Name: `JD`
- Password: `FOUNDER OF TNL`

Change the password before production use.

## Local development

If Node.js is available on another computer later, the normal local flow is `npm install` → `.env.local` → `npm run dev`. The browser-only deployment path does not require this.
