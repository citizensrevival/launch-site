# Deployment Guide

This project is configured to work with both GitHub Pages subdirectory deployment and custom domain deployment.

## Current Setup (GitHub Pages Subdirectory)

- **URL**: `https://citizensrevival.github.io/launch-site/`
- **Base Path**: `/launch-site/`
- **Environment Variable**: `VITE_BASE_PATH=/launch-site/`

## Switching to Custom Domain

When you're ready to deploy to a custom domain (e.g., `azteccitizensrevival.com`):

### 1. Update GitHub Actions Workflow

Edit `.github/workflows/deploy.yml` and change the environment variable:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_BASE_PATH: /  # Change from /launch-site/ to /
```

### 2. Configure Custom Domain in GitHub Pages

1. Go to your repository Settings → Pages
2. Under "Custom domain", enter your domain (e.g., `azteccitizensrevival.com`)
3. Enable "Enforce HTTPS"

### 3. Update DNS Records

Configure your domain's DNS to point to GitHub Pages:
- **A Records**: Point to GitHub Pages IPs
- **CNAME**: Point `www` subdomain to `citizensrevival.github.io`

### 4. Test the Deployment

The build will automatically use the new base path and all assets will be served from the root domain.

## Local Development

- **Default**: Uses `/launch-site/` base path
- **Custom Domain**: Set `VITE_BASE_PATH=/` in your environment

## Image References

All image references in the code use relative paths (`./images/...`) which work with both deployment scenarios:

- **GitHub Pages**: `./images/logo.png` → `/launch-site/images/logo.png`
- **Custom Domain**: `./images/logo.png` → `/images/logo.png`

This ensures your images work correctly regardless of the deployment path.
