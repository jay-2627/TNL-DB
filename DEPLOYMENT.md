# TNL Command Center deployment checklist

## 1. Supabase
Create a project, open SQL Editor, run `sql/schema.sql`, then copy the Postgres pooled connection string into `DATABASE_URL`.

## 2. Local
Copy `.env.example` to `.env.local`, set `DATABASE_URL`, `JWT_SECRET`, `FOUNDER_PASSWORD`, then:
```bash
npm install
npm run seed
npm run dev
```

## 3. GitHub
Create a private repository and push the project. Do not commit `.env.local`.

## 4. Vercel
Import the GitHub repository as a Next.js project. Add:
- DATABASE_URL
- JWT_SECRET
- FOUNDER_PASSWORD
- NEXT_PUBLIC_APP_URL

Deploy.

## 5. Domain
Vercel provides a project URL after deployment. A custom domain can be connected later if desired. Keep the initial Vercel URL for testing.

## 6. Security
Use a long random `JWT_SECRET` and a strong founder password. Rotate credentials if they are ever exposed.
