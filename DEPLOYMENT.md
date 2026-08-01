# Deployment Guide

This app deploys as three pieces: MongoDB Atlas (database), the `Backend/` API (Render or Railway), and the `Frontend/` SPA (Vercel).

## 1. MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com.
2. Database Access -> add a database user (username/password).
3. Network Access -> add `0.0.0.0/0` (or your host's static egress IPs if you have them) so Render/Railway can connect.
4. Copy the connection string -- this is your `MONGO_URI`.

## 2. Backend (Render or Railway)

Both a `Backend/render.yaml` (Render Blueprint) and `Backend/railway.json` are included. Either platform auto-detects a Node app; the config files just pin the start command and health check.

**Render**
1. New -> Blueprint -> point at this repo. Render will read `Backend/render.yaml`.
2. Fill in the env vars marked `sync: false` in the dashboard (see the full list below) -- these are secrets, so they're intentionally not committed.
3. Deploy. Render injects `PORT` automatically; `server.js` already reads it via `process.env.PORT`.

**Railway**
1. New Project -> Deploy from GitHub -> select this repo, set the root directory to `Backend`.
2. Add the same env vars in the Railway dashboard.
3. Railway also injects `PORT` automatically.

**Required env vars** (see `Backend/.env.example` for the full list with defaults):
- `MONGO_URI`, `JWT_SECRET`, `GOOGLE_GENAI_API_KEY` -- the app fails fast at startup with a clear error if any of these are missing (see `Backend/src/config/env.js`).
- `FRONTEND_URL` -- set this to your deployed Vercel URL once you have it (step 3). Used for CORS and for building password-reset/email-verification links.
- `NODE_ENV=production` -- enables secure cookies (`httpOnly`, `secure`, `sameSite: none`) and hides stack traces from error responses.
- SMTP vars are optional -- if unset, password-reset/verification emails are logged instead of sent, which is fine for a first deploy but should be configured for real users.

**After the backend is live**, bootstrap an admin account by running, from the Backend directory (or via your host's shell/one-off job runner):
```
npm run create-admin -- --email you@example.com --username you --password "a-strong-password"
```
There's intentionally no API endpoint that can grant the admin role -- that would be a privilege-escalation hole. This script is the only way in.

**Puppeteer note**: PDF generation launches headless Chrome with `--no-sandbox --disable-setuid-sandbox`, which both Render and Railway's containers need (their containers don't grant the kernel privileges Chrome's sandbox normally requires). This is already set in `ai.service.js`.

## 3. Frontend (Vercel)

1. New Project -> import this repo -> set the root directory to `Frontend`. Vercel auto-detects Vite.
2. Set the env var `VITE_API_URL` to your backend's deployed URL (e.g. `https://interviewai-backend.onrender.com`). This is required -- without it the frontend falls back to `http://localhost:3000` and nothing will work in production. See `Frontend/.env.example`.
3. `Frontend/vercel.json` is already set up to rewrite all paths to `index.html`, which client-side routing (React Router) needs -- without it, refreshing on a route like `/profile` or `/admin/users` would 404.
4. Deploy, then go back to the backend's `FRONTEND_URL` env var and set it to this Vercel URL, and redeploy the backend so CORS/cookies/email links point at the right place.

## 4. Post-deploy checklist

- [ ] Visit `<backend-url>/api/health` -- should return `{"status":"ok",...}`.
- [ ] Register an account on the deployed frontend, confirm login/logout works (cookies require the frontend and backend to both be on HTTPS in production -- see the `sameSite: "none"` note above).
- [ ] Run `npm run create-admin` against the production database, log in as that user, and confirm `/admin` loads.
- [ ] Generate one interview report end-to-end (resume upload -> AI report -> PDF download) to confirm the `GOOGLE_GENAI_API_KEY` and Puppeteer are both working in the deployed environment.
- [ ] If you configured SMTP, trigger a password reset and confirm the email arrives; otherwise confirm the reset link is visible in the backend's logs (expected fallback behavior, see `Backend/src/utils/email.js`).

## Known limitations of this setup

- **Avatars are stored as base64 in MongoDB**, not an object-storage service -- fine at small scale, but worth moving to S3/Cloudinary if the app grows (see `Backend/src/controllers/profile.controller.js`).
- **No CDN/caching layer** in front of the API -- not needed at low traffic, but worth adding (e.g. Cloudflare) before any real scale.
- **Single backend instance** -- rate limiting and the token blacklist are in-memory-adjacent (Mongo-backed, so they do work across restarts) but haven't been tested under horizontal scaling with multiple backend instances behind a load balancer.
