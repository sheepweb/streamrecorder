# StreamRecorder Chrome Extension Spec

## Purpose
Let users add streamer profiles to StreamRecorder directly from supported platform websites.

## Supported Platforms
- tiktok.com/@username
- twitch.tv/username
- kick.com/username
- youtube.com/@username
- afreecatv.com/username
- pandalive.co.kr/live/play/username
- bigo.tv/username

## Authentication
- Extension has host_permissions for livestreamrecorder.com
- If user is already logged in on the site → automatic auth via cookies
- If not logged in → popup shows "Log in to StreamRecorder" → opens login page
- After login, extension picks up the session automatically

## UX Flow
1. User visits a supported profile page (e.g. tiktok.com/@someone)
2. Extension icon in toolbar changes based on state:
   - Gray icon, no badge → not on a supported site
   - Normal icon, "+" badge → on a profile, not yet tracked
   - Green "✓" badge → already tracked
   - Red "!" badge → not logged in
3. User clicks extension icon → popup dropdown shows:
   - Profile info (username, platform)
   - "Add to StreamRecorder" button (if not tracked)
   - "Already tracking" message (if tracked)
   - Confirmation after adding: "Added! We'll record when they go live"
4. User can also remove/unfollow from the popup

## API Endpoints
- **Add follower**: POST /api/followers/follow { username, type }
- **Remove follower**: POST /api/followers/unfollow { username, type }
- **Check auth**: GET /api/users/me (with cookies)
- **Check if tracked**: needs to check user's existing followers

## File Structure
```
chrome-extension/
├── manifest.json       ← permissions, host patterns, icons
├── background.js       ← detect URL changes, update badge
├── popup.html          ← dropdown UI when clicking icon
├── popup.js            ← popup logic (auth check, add/remove)
├── popup.css           ← popup styling
└── icons/              ← extension icons (16, 48, 128px)
```

## Platform URL Patterns (for manifest matches)
- *://*.tiktok.com/*
- *://*.twitch.tv/*
- *://*.kick.com/*
- *://*.youtube.com/*
- *://*.afreecatv.com/*
- *://*.pandalive.co.kr/*
- *://*.bigo.tv/*

## Badge States (background.js)
- Listen to tab URL changes (chrome.tabs.onUpdated, chrome.tabs.onActivated)
- Parse URL to extract platform + username
- If not a supported site → clear badge
- If supported → check if user is authenticated
  - Not authenticated → red "!" badge
  - Authenticated → check if username is already followed
    - Not followed → "+" badge
    - Already followed → "✓" badge (green)

## API Base URL
- Production: https://strapi.livestreamrecorder.com
