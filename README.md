# whatnextai

whatnextai is a web app that helps people who feel stuck explore clear, actionable paths forward. It pairs a React (Vite) frontend with a small Express API that can call Gemini and/or Anthropic models.

## Prerequisites

- [Node.js](https://nodejs.org/) (current LTS recommended)

## Setup

### 1. Frontend

From this directory (`whatnext/`):

```bash
npm install
```

Optional: copy [.env.example](.env.example) to `.env` or `.env.local` if you need variables exposed to the Vite build (see file comments).
If you want error tracking in production, set `VITE_SENTRY_DSN` in the frontend env.

### 2. API server

From `whatnext/server/`:

```bash
npm install
```

Copy [server/.env.example](server/.env.example) to `server/.env` and set at least one provider API key (`GEMINI_API_KEY` or `GOOGLE_API_KEY`, and/or `ANTHROPIC_API_KEY`). See `server/.env.example` for `AI_PROVIDER` and model options.
For backend error tracking, set `SENTRY_DSN` in `server/.env`.

The API listens on **http://localhost:3001** and allows CORS from the Vite dev origin **http://localhost:5173**.

### 3. Run locally

**Both apps** (from `whatnext/`):

```bash
npm run dev:all
```

Or run separately:

- Frontend: `npm run dev` → http://localhost:5173  
- API: `npm run dev:server` (or `cd server && npm run dev` with nodemon)

If the API is not on `localhost:3001`, set `VITE_API_URL` for the frontend (see `src/services/api.ts`).

## Scripts

| Command           | Description                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Vite dev server                      |
| `npm run dev:server` | Express API via ts-node           |
| `npm run dev:all` | Frontend + API together (concurrently) |
| `npm run build`   | Typecheck + production build         |
| `npm run preview` | Preview production build             |
| `npm run lint`    | TypeScript check (`tsc --noEmit`)    |

## Project layout

- `src/` — React UI, routing, and client API helpers  
- `server/` — Express app and AI provider integration  
