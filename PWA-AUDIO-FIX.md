# PWA Audio Playback Fix

## Problem
The PWA was stopping music playback when switching to a different app or going to the mobile home screen.

## Solution Implemented

### 1. Enhanced Web Manifest
- Added `categories: ["music", "entertainment"]` to properly classify the app
- Added `screenshots` section for better PWA installation experience
- These changes help the browser recognize this as a media application

### 2. Dedicated Media Session Component
Created `src/components/MediaSession.tsx` that:
- Is always mounted and never unmounts
- Properly handles Media Session API
- Provides lock screen controls and metadata
- Handles play/pause/next/previous actions
- Supports seek forward/backward functionality

### 3. Improved YouTube Player
Modified `src/components/YouTubePlayer.tsx` to:
- Remove Media Session logic (moved to dedicated component)
- Keep only core playback functionality
- Add `playsinline: 1` parameter for background playback
- Implement Wake Lock API to prevent screen sleeping
- Handle visibility change events

### 4. Custom Service Worker
Enhanced `src/sw.ts` with:
- Proper YouTube API caching strategies
- Audio file caching for better performance
- Background playback handling
- Media session integration support

### 5. App Structure Changes
Updated `src/App.tsx` to:
- Use dedicated YouTubePlayer component
- Add always-mounted MediaSession component
- Remove conflicting YouTube component usage

### 6. Player Context Improvements
Updated `src/context/PlayerContext.tsx` to:
- Better synchronize volume between player and UI
- Improve play/pause toggle logic

### 7. Service Worker Registration
Enhanced `src/main.tsx` to:
- Properly register the service worker
- Handle service worker updates gracefully

### 8. Build Process
Updated build process to:
- Generate custom service worker
- Copy it to the dist folder after build

## Key Features Added

### Wake Lock API
Prevents the screen from sleeping while music is playing:
```javascript
const wakeLock = await navigator.wakeLock.request('screen');
```

### Media Session API (Dedicated Component)
Provides lock screen controls and metadata:
```javascript
navigator.mediaSession.metadata = new MediaMetadata({
  title: song.title,
  artist: song.artist,
  artwork: [...]
});
```

### Audio Caching Strategy
Caches audio-related resources for better performance:
```javascript
registerRoute(
  ({ request }) => request.destination === 'audio',
  new CacheFirst({
    cacheName: 'audio-cache',
    // ...
  })
);
```

### Background Playback Handling
- Music continues playing when app is in background
- Lock screen shows playback controls
- System notifications show current track info
- Media session controls work from lock screen
- Seek forward/backward functionality

## Testing Instructions

1. Build the app: `npm run build`
2. Start dev server: `npm run dev`
3. Install as PWA on your mobile device
4. Play a song and test:
   - Switch to another app - music should continue
   - Go to home screen - music should continue
   - Lock screen - should show playback controls
   - Use lock screen controls to play/pause/next
   - Turn off screen - music should continue (if supported by device)
   - Seek forward/backward from lock screen

## Browser Support

These features work best on:
- Chrome/Chromium-based browsers (Android, Desktop)
- Samsung Internet
- Edge

iOS Safari has limited support for background audio in PWAs. For full iOS support, you might need to consider:
- Using Capacitor/Cordova for native app wrapper
- Implementing native iOS audio background modes

## Troubleshooting

If audio still stops:
1. Check browser console for errors
2. Ensure PWA is properly installed (not just running in browser tab)
3. Verify device permissions for background audio
4. Test on different browsers as support varies
5. Check if Media Session API is supported in your browser

## Future Improvements

1. Add Capacitor integration for full native background audio support
2. Implement audio focus management
3. Add Bluetooth headset controls
4. Improve battery optimization handling
5. Add more advanced media session features (playlists, queue management)