# Rebuttal Master

English rebuttal practice for debate: pick a **technique** (from Tyndall-style tactics + common fallacies), read a short explanation, then practice **rebutting flawed arguments** paired with real **motions** (ESDP, WSDA impromptu, international seed). Optional **Feedback** calls OpenRouter (default model: NVIDIA Nemotron 3 Super — see `lib/model-options.ts`).

## Prerequisites

- Node.js 20+
- For motion pipelines: Python 3 with dependencies used by `scripts/parse-*.py` (see script headers / repo root docs)

## Local setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local: set OPENROUTER_API_KEY (required for /api/feedback).
# OPENROUTER_MODEL is optional; leave empty to use the app default.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000): home → technique → practice (1–10 items) → Feedback per answer.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes (for feedback) | [OpenRouter](https://openrouter.ai/keys) API key |
| `OPENROUTER_MODEL` | No | Overrides default feedback model (whitelist / resolution in `lib/model-options.ts`) |

Never commit `.env.local`. The app can also read `OPENROUTER_*` from a parent-directory `.env.local` when running `next dev` / `next build` (see `next.config.ts`).

## Deploy on Vercel

1. Import this `web/` folder as a Next.js project (root directory = `web` if the monorepo root is above it).
2. **Project → Settings → Environment Variables**: add `OPENROUTER_API_KEY` (Production / Preview as needed). Add `OPENROUTER_MODEL` only if you want a non-default model.
3. Deploy. The feedback route is server-side only; the key is not exposed to the browser.

## Debate content & practice generation

- **`content/motions.json`** — merged international seed (`motions-international.json`) + WSDA impromptu (`wsda-impromptu-parsed.json`, from `WSDA*.docx`) + ESDP (`esdp-motions-parsed.json`, from `ESDP*.pdf`). Merge script: `scripts/merge-motions.mjs`.
- **`content/flaw-templates.json`** — six flawed-argument **templates** per technique (placeholder `__M__`). Built by `scripts/build-practice-items.mjs`. At runtime, `lib/practice.ts` substitutes the motion text for `__M__`, so every motion can pair with every technique without a huge static matrix.

Regenerate after editing sources or templates:

```bash
npm run content:wsda        # parse WSDA*.docx → merge motions
npm run content:esdp        # parse ESDP*.pdf → merge motions → rebuild flaw-templates
npm run content:merge-motions   # merge only (if JSON slices already updated)
npm run content:flaws       # rebuild flaw-templates only (after editing build-practice-items.mjs)
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production server locally |
| `npm run lint` | ESLint |

## Tech stack

Next.js 16 (App Router), TypeScript, Tailwind CSS 4, `@openrouter/sdk` for feedback.
