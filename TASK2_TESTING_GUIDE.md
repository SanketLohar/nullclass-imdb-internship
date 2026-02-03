# Task 2: Watchlist System - Testing Guide

## Overview
This guide provides step-by-step instructions to test the multi-device, conflict-resilient watchlist implementation with all required features.

## Prerequisites
1. Node.js 18+ installed
2. npm or yarn package manager
3. Chrome/Edge browser (for service worker support)
4. Playwright installed: `npm install -D @playwright/test`
5. Two browser tabs/windows for cross-tab testing

## Step 1: Start the Development Server

```bash
npm run dev
```

The application should start at `http://localhost:3000`

## Step 2: Verify Service Worker Registration

1. Open Chrome DevTools → Application tab → Service Workers
2. Navigate to `http://localhost:3000`
3. **Verify:**
   - Service worker is registered (`sw.js`)
   - Status shows "activated and is running"
   - Scope is `/`

**Alternative check:**
- Open DevTools → Console
- Should see no service worker errors
- Check Network tab for `sw.js` request (status 200)

## Step 3: Test LocalStorage + IndexedDB Hybrid Storage

1. Navigate to `/movies/1`
2. Click "Add to Watchlist" button
3. Open DevTools → Application tab
4. **Check LocalStorage:**
   - Go to Application → Local Storage → `http://localhost:3000`
   - Verify `watchlist-cache` key exists with movie data
5. **Check IndexedDB:**
   - Go to Application → IndexedDB → `movieverse-db` → `watchlist`
   - Verify movie is stored in IndexedDB
6. **Verify Hybrid Behavior:**
   - Refresh page
   - Watchlist should load instantly (from LocalStorage)
   - IndexedDB syncs in background

## Step 4: Test Optimistic Updates with Rollback

1. Navigate to `/movies/1`
2. Open DevTools → Network tab
3. Set network to "Offline" (or throttle to "Offline")
4. Click "Add to Watchlist"
5. **Verify:**
   - Button immediately shows "In Watchlist" (optimistic update)
   - Item appears in watchlist instantly
6. **Test Rollback:**
   - Keep offline
   - Try to add another movie
   - If IndexedDB fails, verify rollback occurs
   - Check console for error messages

## Step 5: Test Vector Clock Conflict Resolution

### Test 5a: Basic Conflict Resolution

1. Open two browser tabs to `/movies/1`
2. In Tab 1: Add movie to watchlist
3. In Tab 2: Add same movie to watchlist (simultaneously)
4. **Verify:**
   - Both tabs show movie in watchlist
   - No duplicate entries
   - Conflict resolved using vector clock

### Test 5b: Last-Write-Wins

1. Open two tabs to `/movies/1`
2. Tab 1: Add movie at time T1
3. Tab 2: Add same movie at time T2 (T2 > T1)
4. **Verify:**
   - Last write (T2) wins
   - Vector clock increments correctly

### Test 5c: Concurrent Edits

1. Open two tabs
2. Tab 1: Add movie A
3. Tab 2: Add movie B (different movie)
4. **Verify:**
   - Both movies appear in both tabs
   - No conflicts (different items)
   - Vector clocks merge correctly

## Step 6: Test Cross-Tab Sync via BroadcastChannel

1. Open two browser tabs to `/movies/1`
2. In Tab 1: Click "Add to Watchlist"
3. **Verify in Tab 2:**
   - Tab 2 automatically updates (within 500ms)
   - Button changes to "In Watchlist"
   - No page refresh needed

4. **Test Remove Sync:**
   - In Tab 1: Click "In Watchlist" to remove
   - Verify Tab 2 updates automatically

5. **Test Multiple Items:**
   - Tab 1: Add movies 1, 2, 3
   - Verify Tab 2 shows all three movies

## Step 7: Test Background Service Worker Sync

### Test 7a: Offline Queue

1. Go offline (DevTools → Network → Offline)
2. Add movie to watchlist
3. Open DevTools → Application → IndexedDB → `watchlist-sync-queue`
4. **Verify:**
   - Operation is queued in `operations` store
   - Contains operation type, item data, vector clock

### Test 7b: Background Sync on Online

1. Add movie while offline (from Step 7a)
2. Go online
3. Wait 2-3 seconds
4. **Verify:**
   - Service worker processes queue
   - Movie syncs to server
   - Queue is cleared

### Test 7c: Manual Sync Trigger

1. Open DevTools → Console
2. Run:
   ```javascript
   navigator.serviceWorker.ready.then(reg => {
     reg.sync.register('watchlist-sync');
   });
   ```
3. **Verify:**
   - Sync event fires
   - Pending operations are processed

## Step 8: Test Mock Server with Conflict Resolution

1. **Test POST with Vector Clock:**
   ```bash
   curl -X POST http://localhost:3000/api/watchlist/mock \
     -H "Content-Type: application/json" \
     -d '{
       "id": "test-1",
       "title": "Test Movie",
       "posterUrl": "https://example.com/poster.jpg",
       "releaseYear": 2024,
       "addedAt": 1234567890,
       "vectorClock": {"device-1": 1},
       "deviceId": "device-1"
     }'
   ```
2. **Verify:**
   - Response 201 (created) or 200 (updated if exists)
   - Item stored with vector clock

3. **Test Conflict Resolution:**
   ```bash
   # First request
   curl -X POST http://localhost:3000/api/watchlist/mock \
     -H "Content-Type: application/json" \
     -d '{"id": "test-1", "title": "Movie A", "posterUrl": "...", "releaseYear": 2024, "addedAt": 1000, "vectorClock": {"device-1": 1}, "deviceId": "device-1"}'
   
   # Concurrent request (different device)
   curl -X POST http://localhost:3000/api/watchlist/mock \
     -H "Content-Type: application/json" \
     -d '{"id": "test-1", "title": "Movie B", "posterUrl": "...", "releaseYear": 2024, "addedAt": 2000, "vectorClock": {"device-2": 1}, "deviceId": "device-2"}'
   ```
4. **Verify:**
   - Last write wins (based on timestamp)
   - Vector clocks are merged

## Step 9: Test Zod Validation

1. **Test Valid Data:**
   - Add movie with all required fields
   - Verify success

2. **Test Invalid Data:**
   ```javascript
   // In browser console
   const invalidItem = {
     id: "", // Invalid: empty string
     title: "Test",
     releaseYear: "not-a-number", // Invalid: not a number
   };
   ```
3. **Verify:**
   - Validation errors are caught
   - Invalid items are rejected
   - Error messages are user-friendly

## Step 10: Test Framer Motion Micro-interactions

1. Navigate to `/movies/1`
2. **Test Press Animation:**
   - Click and hold "Add to Watchlist" button
   - Verify button scales down (whileTap: scale 0.95)

3. **Test Spring Animation:**
   - Click button
   - Verify smooth spring animation (stiffness: 300, damping: 20)

4. **Test Success Animation:**
   - Add to watchlist
   - Verify green checkmark appears with scale animation
   - Checkmark fades out after 2 seconds

5. **Test Undo Animation:**
   - Remove from watchlist
   - Verify undo toast slides up from bottom
   - Smooth fade-in/fade-out transitions

## Step 11: Test ARIA-Live Status Updates

1. Open screen reader (NVDA/JAWS/VoiceOver) or DevTools → Accessibility
2. Navigate to `/movies/1`
3. Click "Add to Watchlist"
4. **Verify:**
   - Screen reader announces: "Added to watchlist"
   - `aria-live="polite"` is present
   - `aria-busy` updates correctly

5. **Test Remove:**
   - Remove from watchlist
   - Verify: "Removed from watchlist" is announced
   - Undo button is accessible

## Step 12: Run Playwright E2E Tests

### Install Playwright (if not installed):
```bash
npx playwright install
```

### Run All Tests:
```bash
npx playwright test tests/watchlist.e2e.spec.ts
```

### Run Specific Test:
```bash
npx playwright test tests/watchlist.e2e.spec.ts -g "should sync watchlist across tabs"
```

### Run with UI:
```bash
npx playwright test tests/watchlist.e2e.spec.ts --ui
```

### Test Coverage:
The E2E tests verify:
- ✅ Add movie to watchlist
- ✅ Persist across page refresh
- ✅ Cross-tab sync
- ✅ Offline functionality
- ✅ Undo toast
- ✅ Undo removal
- ✅ Simultaneous edits
- ✅ Conflict resolution
- ✅ Online/offline transitions
- ✅ Zod validation

## Step 13: Test Offline/Online Transitions

1. **Test Going Offline:**
   - Add movie while online
   - Go offline (DevTools → Network → Offline)
   - Add another movie
   - **Verify:**
     - Both movies are in watchlist
     - Operations are queued

2. **Test Coming Online:**
   - With queued operations from Step 13.1
   - Go online
   - Wait 2-3 seconds
   - **Verify:**
     - Service worker syncs operations
     - All movies persist
     - Queue is cleared

3. **Test Refresh During Offline:**
   - Go offline
   - Add movie
   - Refresh page
   - **Verify:**
     - Movie still in watchlist (from IndexedDB)
     - No data loss

## Step 14: Test Simultaneous Edits on Two Tabs

1. Open two tabs to `/movies/1`
2. **Scenario A: Add Same Movie**
   - Tab 1: Click "Add to Watchlist" at exactly the same time
   - Tab 2: Click "Add to Watchlist" at exactly the same time
   - **Verify:**
     - Only one entry appears
     - Conflict resolved correctly
     - Both tabs show same state

3. **Scenario B: Add Different Movies**
   - Tab 1: Add movie 1
   - Tab 2: Add movie 2 (simultaneously)
   - **Verify:**
     - Both movies appear in both tabs
     - No conflicts
     - Cross-tab sync works

4. **Scenario C: Remove in One, Add in Other**
   - Tab 1: Remove movie
   - Tab 2: Add same movie (simultaneously)
   - **Verify:**
     - Conflict resolved (last write wins)
     - Both tabs show consistent state

## Step 15: Test Multi-Device Conflict Resolution

1. **Simulate Multiple Devices:**
   - Clear localStorage and IndexedDB
   - Add movie (creates device-1)
   - Clear storage again
   - Add same movie (creates device-2)
   - **Verify:**
     - Different device IDs
     - Vector clocks track both devices
     - Conflicts resolve correctly

2. **Test Vector Clock Merging:**
   - Device 1: Add movie A (clock: {device-1: 1})
   - Device 2: Add movie B (clock: {device-2: 1})
   - Sync both
   - **Verify:**
     - Merged clock: {device-1: 1, device-2: 1}
     - Both movies present

## Step 16: Test Error Handling and Rollback

1. **Test IndexedDB Failure:**
   - Simulate IndexedDB error (disable in DevTools)
   - Try to add movie
   - **Verify:**
     - Optimistic update rolls back
     - Error is logged
     - UI returns to previous state

2. **Test Network Failure:**
   - Go offline
   - Add movie (should work)
   - Go online
   - Simulate server error (500)
   - **Verify:**
     - Operation stays in queue
     - Retries on next sync
     - No data loss

## Step 17: Test Performance

1. **Test Large Watchlist:**
   - Add 100+ movies
   - **Verify:**
     - No performance degradation
     - Smooth scrolling
     - Fast filter operations

2. **Test Memory Usage:**
   - Open DevTools → Memory
   - Add/remove movies repeatedly
   - **Verify:**
     - No memory leaks
     - IndexedDB cleanup works

## Step 18: Test Integration with Actor Profile (Task 1)

1. Navigate to `/actor/1`
2. Find a movie in filmography
3. Click "Add to Watchlist" (if available)
4. **Verify:**
   - Watchlist toggle works
   - Syncs with main watchlist
   - Cross-tab sync works

## Expected Results Summary

✅ **LocalStorage + IndexedDB:** Hybrid storage working  
✅ **Service Worker:** Background sync operational  
✅ **Mock Server:** Conflict resolution with vector clocks  
✅ **Optimistic Updates:** Instant UI updates with rollback  
✅ **Conflict Resolution:** Vector-clock + last-write-wins  
✅ **Zod Validation:** All data validated  
✅ **Cross-Tab Sync:** BroadcastChannel working  
✅ **Framer Motion:** All animations smooth  
✅ **ARIA-Live:** Screen reader announcements work  
✅ **E2E Tests:** All Playwright tests pass  
✅ **Offline Support:** Works offline, syncs online  
✅ **Simultaneous Edits:** Conflicts resolved correctly  

## Troubleshooting

**Issue:** Service worker not registering
- **Solution:** Check browser console, ensure HTTPS or localhost, clear service worker cache

**Issue:** Cross-tab sync not working
- **Solution:** Verify BroadcastChannel is supported, check console for errors

**Issue:** Conflict resolution not working
- **Solution:** Check vector clock implementation, verify device IDs are unique

**Issue:** E2E tests failing
- **Solution:** Ensure dev server is running, check test timeout settings

**Issue:** Offline queue not syncing
- **Solution:** Check service worker registration, verify background sync API support

## Additional Testing Tools

1. **Chrome DevTools:**
   - Application tab for storage inspection
   - Network tab for offline simulation
   - Service Workers tab for SW debugging

2. **Playwright Inspector:**
   - Run tests with `--debug` flag
   - Step through test execution

3. **Lighthouse:**
   - Test PWA features
   - Verify offline capability
