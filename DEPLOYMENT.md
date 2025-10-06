# Deployment Guide

This project is configured for custom domain deployment on GitHub Pages.

## Current Setup (Custom Domain)

- **URL**: `https://citizens.fvcsolutions.com`
- **Base Path**: `/` (root domain)
- **Custom Domain**: `citizens.fvcsolutions.com`

## GitHub Pages Configuration

The project is configured to deploy to GitHub Pages with a custom domain:

### 1. GitHub Actions Workflow

The `.github/workflows/deploy.yml` file automatically builds and deploys the site when changes are pushed to the main branch.

### 2. Custom Domain Configuration

The `public/CNAME` file contains the custom domain: `citizens.fvcsolutions.com`

### 3. DNS Configuration

Configure your domain's DNS to point to GitHub Pages:
- **A Records**: Point to GitHub Pages IPs (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153)
- **CNAME**: Point `www` subdomain to `citizensrevival.github.io`

### 4. GitHub Pages Settings

1. Go to your repository Settings → Pages
2. Under "Custom domain", enter `citizens.fvcsolutions.com`
3. Enable "Enforce HTTPS"

## Local Development

Run the development server with:

```bash
npm run dev
```

The site will be available at `http://localhost:3000`

## Build and Deploy

The site automatically builds and deploys when you push to the main branch. The build process:

1. Installs dependencies
2. Builds the React app with Vite
3. Deploys to GitHub Pages

## Image References

All image references use absolute paths from the root domain:

- Images are served from `/images/logo.png`
- Assets are served from the root domain
- No subdirectory path handling is needed
