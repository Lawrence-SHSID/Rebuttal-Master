# Rebuttal Master

English rebuttal practice for debate: pick a **classical logical error**, read a short explanation, then practice **rebutting flawed arguments** on curated **motions**. Optional **Feedback** calls OpenRouter (default model: NVIDIA Nemotron 3 Super — see `lib/model-options.ts`).

## Prerequisites

- Node.js 20+
- Python 3 (only if you regenerate content from the Word documents)

## Local setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local: set OPENROUTER_API_KEY (required for /api/feedback).
# OPENROUTER_MODEL is optional; leave empty to use the app default.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000): home → logical error → set practice count (1–10, capped by question bank) → write rebuttals → **Feedback** per answer.

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

## Debate content

Source documents (repo root, sibling of `web/`):

- `Classical Logical Errors.docx` — definitions and examples for 8 logical errors
- `Logical_Error_Examples.docx` — motions and flawed arguments per error type

Parsed JSON (committed in `web/content/`):

- **`content/logical-errors.json`** — error definitions (`practiceable` is false when there are no examples, e.g. Circular Reasoning)
- **`content/logical-error-examples.json`** — motion + flawed argument cards tagged by `errorId`

Regenerate after editing the docx files:

```bash
npm run content:logical-errors
npm run verify:logical-errors   # optional smoke test
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production server locally |
| `npm run lint` | ESLint |
| `npm run content:logical-errors` | Parse docx → JSON in `content/` |
| `npm run verify:logical-errors` | Quick check of `lib/logical-errors.ts` |

## Tech stack

Next.js 16 (App Router), TypeScript, Tailwind CSS 4, `@openrouter/sdk` for feedback.
