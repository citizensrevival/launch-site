# Launch Site

Marketing site for the Aztec Citizens Revival event. A static React + Vite + Tailwind
single-page app, deployed to GitHub Pages.

There is no backend and no database. The only interactive parts are the two signup
forms, and they currently hand submissions to a placeholder provider (see
[Lead capture](#-lead-capture)).

## 🚀 Quick Start

### Prerequisites

- Node.js 18+

### Install and run

```bash
npm install
npm start
```

The app runs at http://localhost:3000.

## 🔧 Available Scripts

| Script | What it does |
| --- | --- |
| `npm start` | Vite dev server |
| `npm run build` | Typecheck, then production build to `dist/` |
| `npm run build:github` | Production build for GitHub Pages |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | ESLint (warnings are errors) |
| `npm test` | Vitest in watch mode |
| `npm run test:run` | Vitest once |
| `npm run clean` | Remove `node_modules`, `dist`, lockfile |

## 📁 Project Structure

```
├── src/
│   ├── core/                 # Shared components, store, theme
│   ├── public/               # Pages, signup forms, lead capture
│   │   └── data/supporters.ts  # Supporter logo wall ("Brought to You By")
│   └── __tests__/            # App-level tests
├── public/
│   ├── images/supporters/    # Supporter logos
│   ├── video/                # Home page promo reel
│   └── CNAME                 # Custom domain (see Deployment)
└── package.json
```

## 🎬 Home page promo video

The reel at the top of the home page is committed to `public/video/` and served straight
from GitHub Pages — there is no CDN or object storage involved.

The organisers supply a 1080p master. It is far too large to ship as-is (the first one
was 146MB for 15 seconds — roughly 20x the bitrate the web needs), so re-encode before
committing:

```bash
# desktop
ffmpeg -i master.mp4 -t <duration> -c:v libx264 -profile:v high -crf 28 -preset slow \
  -pix_fmt yuv420p -movflags +faststart -an public/video/revival-promo-1080.mp4

# mobile (served to viewports <= 768px)
ffmpeg -i master.mp4 -t <duration> -vf scale=1280:-2 -c:v libx264 -profile:v high -crf 28 \
  -preset slow -pix_fmt yuv420p -movflags +faststart -an public/video/revival-promo-720.mp4

# poster (first paint, and the still shown under prefers-reduced-motion)
ffmpeg -ss <t> -i master.mp4 -frames:v 1 -q:v 4 public/video/revival-poster.jpg
```

CRF 28 is visually lossless on this material and lands around 6MB / 3MB. The reel is
silent: it autoplays muted, so the audio track is dead weight. `-movflags +faststart` is
required or the video will not begin playing until it has fully downloaded.

`HeroVideo` picks the resolution in JS rather than with `<source media="...">`, which
most browsers ignore inside `<video>`.

## 📬 Lead capture

The site's only dynamic behaviour is two forms: the "Stay Informed" newsletter signup
and the "Get Involved" dialog (sponsor / vendor / volunteer). Both build a
`CreateLeadInput` and hand it to a `LeadsProvider`.

**Submissions currently go nowhere.** `FakeLeadsProvider` accepts a lead, keeps it in
memory for the life of the page, logs it to the console, and reports success. Nothing is
persisted and nobody is notified.

To make signups real, implement `LeadsProvider` (one method, `submitLead`) and swap the
single line in [`src/public/leads/provider.ts`](src/public/leads/provider.ts). Nothing
else needs to change — the forms and their tests are written against the interface, not
the implementation.

```
src/public/leads/
├── provider.ts                    # ← the swap point
├── services/FakeLeadsProvider.ts  # current placeholder
└── types/leads.types.ts           # CreateLeadInput, LeadsProvider
```

## 🚀 GitHub Pages Deployment

Deploys automatically via GitHub Actions on push to `main`.

- **Custom domain**: `thecitizensrevival.com` (configured in `public/CNAME`)
- **Source**: `.github/workflows/deploy.yml`, publishing `dist/`
- **Live at**: https://thecitizensrevival.com

The build takes no secrets and no environment variables.

## 🐛 Killing stray dev servers

```bash
pkill -f vite
```

Check what is still listening:

```bash
lsof -i :3000
```
