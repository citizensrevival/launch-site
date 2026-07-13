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
│   └── __tests__/            # App-level tests
├── public/                   # Static assets, CNAME
└── package.json
```

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

- **Custom domain**: `citizens.fvcsolutions.com` (configured in `public/CNAME`)
- **Source**: `.github/workflows/deploy.yml`, publishing `dist/`
- **Live at**: https://citizens.fvcsolutions.com

The build takes no secrets and no environment variables.

## 🐛 Killing stray dev servers

```bash
pkill -f vite
```

Check what is still listening:

```bash
lsof -i :3000
```
