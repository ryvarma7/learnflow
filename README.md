# LearnFlow

LearnFlow is a Next.js app that generates practical learning roadmaps with weekly outcomes and concrete daily goals.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- Groq API (`llama-3.3-70b-versatile`)

## Prerequisites

- Node.js 18.18+ (or Node.js 20+ recommended)
- npm 9+
- A Groq API key

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
# macOS/Linux
cp .env.example .env.local

# Windows PowerShell
Copy-Item .env.example .env.local
```

3. Add your key in `.env.local`:

```bash
GROQ_API_KEY=your_real_key_here
```

4. Run the app:

```bash
npm run dev
```

Open http://localhost:3000.

## Production Checks Before Push

Run these before committing:

```bash
npm run lint
npm run build
```

## Push to GitHub

If this repository is not connected yet:

```bash
git init
git add .
git commit -m "chore: prepare LearnFlow for deployment"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

If remote already exists:

```bash
git add .
git commit -m "chore: deployment-ready updates"
git push
```

## Deploy to Vercel

### Option A: Vercel Dashboard (recommended)

1. Import the GitHub repository in Vercel.
2. Framework preset: Next.js.
3. Add environment variable in Project Settings -> Environment Variables:
	- `GROQ_API_KEY` = your Groq key
4. Deploy.

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

Then set env var:

```bash
vercel env add GROQ_API_KEY
```

Redeploy after adding env vars:

```bash
vercel --prod
```

## Notes

- `GROQ_API_KEY` is required only for roadmap generation API calls.
- `.env.local` is gitignored, and `.env.example` is committed as template.
