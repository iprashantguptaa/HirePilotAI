# HirePilot AI

I got tired of interview prep tools that throw random questions and never tell you what was actually weak. So I built this.

Paste a job description, upload your resume, and it gives you a match score, the gaps that matter for that role, and a practice loop that scores your answers.

**Live:** [thehirepilot.vercel.app](https://thehirepilot.vercel.app)

The API is on Render’s free tier. If the site was idle, the first request can take a minute. Wait and try again.

---

## What it does

- Scores how well your resume fits a specific JD (not a generic “you’re doing great”)
- Lists skill gaps, strengths, and a short prep plan
- Text-based mock interview — one question at a time, with a score and notes
- Saves history so you can go back to old plans and sessions
- Optional admin view for users, AI usage, and feedback

Practice is typed answers only. No camera / voice interview yet.

---

## Stack

**Frontend:** React 19, Vite, React Router, SCSS  
**Backend:** Node, Express, MongoDB, Gemini  
**Auth:** JWT (httpOnly cookies + bearer token)  
**Hosted:** Vercel (frontend) · Render (API) · MongoDB Atlas

---

## Run it locally

You need Node 18+, MongoDB (local or Atlas), and a [Gemini API key](https://aistudio.google.com/apikey).

**Backend**

```bash
cd Backend
npm install
```

Create `Backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/hirepilot
JWT_SECRET=change-this-to-a-long-random-string
GOOGLE_GENAI_API_KEY=your_gemini_key
FRONTEND_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

```bash
npm run dev
```

SMTP is optional. If you skip it, login works with just email + password. OTP emails only go out when `SMTP_HOST` is set.

**Frontend**

```bash
cd Frontend
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Use `localhost`, not `127.0.0.1`, or CORS will fight you.

To make an admin user:

```bash
cd Backend
npm run create-admin -- --email you@example.com --username you --password "a-strong-password"
```

---

## Repo layout

```text
Frontend/     React app (Vercel)
Backend/      Express API (Render)
```

That’s the whole project. Feature code lives under `Frontend/src/features` and `Backend/src`.

---

## Production notes

On Vercel I proxy `/api/*` to Render (`Frontend/vercel.json`) so login cookies stay first-party. Long AI calls (generate report, practice, PDFs) hit Render directly because the Vercel proxy can time out.

Set these on Render: `MONGO_URI`, `JWT_SECRET`, `GOOGLE_GENAI_API_KEY`, `FRONTEND_URL=https://thehirepilot.vercel.app`, `NODE_ENV=production`. No trailing slash on `FRONTEND_URL`.

---

## Author

[Prashant Gupta](https://github.com/iprashantguptaa)

ISC license. Fine to fork and learn from. Don’t copy the live site and call it yours.
