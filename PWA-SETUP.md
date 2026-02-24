# PWA Setup Instructions

Your website has been configured as a Progressive Web App (PWA)!

## What's Been Added

1. **Vite PWA Plugin** - Automatically generates service worker and manifest
2. **Web App Manifest** - Configured in `vite.config.ts` with app metadata
3. **Service Worker** - Auto-generated with caching strategies for:
   - Static assets (JS, CSS, HTML, images)
   - YouTube API calls (NetworkFirst strategy)
   - YouTube thumbnails (CacheFirst strategy)
4. **Meta Tags** - Added to `index.html` for PWA support

## Generate App Icons

You need to create two icon files in the `public` folder:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

### Quick Method:
1. Open `generate-icons.html` in your browser
2. Click "Generate Icons" button
3. Download both icons
4. Move them to the `public` folder

### Professional Method:
Create custom icons using design tools like:
- Figma, Photoshop, or Canva
- Use your app's branding and colors
- Export as PNG at 192x192 and 512x512 sizes

## Testing Your PWA

1. Build the app: `npm run build`
2. Preview the build: `npm run preview`
3. Open in Chrome/Edge and check:
   - DevTools > Application > Manifest
   - DevTools > Application > Service Workers
   - Look for install prompt in address bar

## Features

- **Offline Support** - App works without internet (cached assets)
- **Install Prompt** - Users can install to home screen
- **Auto Updates** - Service worker updates automatically
- **Optimized Caching** - YouTube content cached for better performance

## Customization

Edit the manifest in `vite.config.ts` to change:
- App name and description
- Theme colors
- Display mode
- Start URL

## Deploy

When deploying, ensure your hosting:
- Serves over HTTPS (required for PWA)
- Properly serves the service worker file
- Has correct MIME types for manifest.json
