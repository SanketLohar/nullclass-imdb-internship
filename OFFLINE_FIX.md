# Offline UX Fix Applied

## Issue
Movies page and other data-fetching pages were showing browser's default "dino" offline page instead of the custom `OfflineFallback` UI.

## Root Cause
Client components like `MoviesClient` fetch data on mount and catch errors internally. When offline, the fetch would fail and show the old `OfflineError` component before the `OfflineBoundary` wrapper could detect the offline state.

## Solution
Integrated `useNetworkStatus` hook directly into client data-fetching components to detect offline state BEFORE attempting to fetch data.

## Changes Made

### 1. MoviesClient.tsx
- Added `useNetworkStatus` hook import
- Added `OfflineFallback` component import
- Added offline check before data fetching:
```typescript
const { isOffline } = useNetworkStatus();

// Show offline UI immediately if offline
if (isOffline) {
    return <OfflineFallback />;
}
```

### 2. movies/page.tsx
- Removed redundant `OfflineBoundary` wrapper since `MoviesClient` now handles offline detection internally

## Result
✅ Movies page now shows custom `OfflineFallback` UI when offline  
✅ Consistent with home page behavior  
✅ No browser "dino" page

## Testing
1. DevTools → Network → Offline
2. Navigate to `/movies`
3. Should see professional "You're Offline" UI (not dino page)
