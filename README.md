# TagCraft

Next.js (App Router) app with email/password login backed by Neon Postgres and an AI listing generator.

## Setup

1. `npm install`
2. Create a project at neon.tech. In its SQL Editor, run `db/schema.sql`.
3. Copy `.env.example` to `.env.local` and fill in:
   - `DATABASE_URL`: the Neon connection string
   - `AUTH_SECRET`: output of `openssl rand -base64 32`
   - `ANTHROPIC_API_KEY`: your Anthropic API key
4. `npm run dev` and open http://localhost:3000

## Deploy to Vercel

Import the GitHub repo in Vercel and add the same three environment variables under Project Settings > Environment Variables.

## How it fits together

- `app/page.js`: landing page
- `app/login`, `app/signup`: forms that call `/api/auth/*`
- `app/api/auth/*`: signup, login, logout (bcrypt password hashes in Neon, signed session cookie)
- `middleware.js`: redirects signed-out visitors away from `/dashboard`
- `app/dashboard`: the generator UI
- `app/api/generate/route.js`: login-protected route that calls the Anthropic API
