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

This project is configured to automatically deploy to GitHub Pages when changes are pushed to the main branch.

### Setup Instructions

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select "GitHub Actions"
4. The deployment will happen automatically when you push to the main branch

The site will be available at: `https://yourusername.github.io/launch-site/`

### Custom Domain Setup

To use a custom domain (subdomain) instead of the default GitHub Pages URL:

1. **Update the CNAME file**: Edit `public/CNAME` and replace `your-subdomain.yourdomain.com` with your actual domain
2. **Configure DNS**: Add a CNAME record pointing your subdomain to `yourusername.github.io`
3. **Enable HTTPS**: GitHub Pages will automatically provision an SSL certificate
4. **Update build script**: Use `CUSTOM_DOMAIN=true npm run build:github` for custom domain builds

Example DNS configuration:
```
Type: CNAME
Name: your-subdomain
Value: yourusername.github.io
```

The site will then be available at: `https://your-subdomain.yourdomain.com`
