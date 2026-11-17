# Webflow Outreach website

The marketing site: AI engineers who work inside your business. Next.js 14, Tailwind, three fonts set in `src/app/layout.tsx`.

## Run it

```bash
npm ci
npm run dev        # http://localhost:3000
```

## Checks

```bash
npm run lint
npm run build      # runs scripts/check-placeholders.mjs first
node scripts/check-placeholders.mjs
```

## Where things live

- `src/lib/offer.ts`: every published price and term, and the sourced figures. Pages read prices from here.
- `src/lib/sum.ts`: the process cost sum used by the calculator, the pricing example and the sample report.
- `src/lib/situations.ts`: the five situations. Each has a private page at `/for/<key>`.
- `src/lib/story.ts`: the homepage frames. The rail in the header reads the same list.
- `src/app/story.css`: the shared look for every page.
- `src/app/examples/tools` and `src/lib/sandbox`: copies of the three example tools from the ops sandbox.

## Private pages

`/for/<key>?c=<token>` asks the ops database who the token belongs to (`landingFor` in `src/lib/outreach.ts`).
Only the company name is required. Evidence, the situation and the working version link are optional, and anything malformed is dropped.
To test without a database, point `OPS_SUPABASE_URL` at a local stand-in.

## Ops database settings

`OPS_SUPABASE_URL` and `OPS_SUPABASE_KEY` (the publishable key) are the only way the site reaches the ops database. There is no built-in fallback.
When either is unset, the intro call form says it is not working and asks the visitor to email, the server logs why, and private pages show their generic content.
Set both in Vercel for Production (the production ops project) and for Preview (staging, never production).

## Placeholder guard

`npm run build` first runs `scripts/check-placeholders.mjs`, which scans `src/` for `[CAPITAL LETTERS]` tokens in visible strings.
When `VERCEL_ENV` or `NODE_ENV` is `production` and one is found, the build fails; otherwise it only reports.
Company facts come from `NEXT_PUBLIC_COMPANY_*` env vars (see `src/lib/company.ts`) and are shown only when set.
