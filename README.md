# Launch Site

A modern React application built with Vite, TypeScript, and Tailwind CSS.

## Development

```bash
npm install
npm run dev
```

## Build for GitHub Pages

```bash
npm run build:github
```

## GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages with a custom domain when changes are pushed to the main branch.

### Current Configuration

- **Custom Domain**: `citizens.fvcsolutions.com`
- **Deployment**: Automatic via GitHub Actions
- **Source**: GitHub Actions workflow

### Setup Instructions

1. The repository is already configured for GitHub Pages deployment
2. The custom domain `citizens.fvcsolutions.com` is configured in `public/CNAME`
3. DNS should be configured to point to GitHub Pages IPs
4. Enable "Enforce HTTPS" in GitHub Pages settings

The site will be available at: `https://citizens.fvcsolutions.com`
