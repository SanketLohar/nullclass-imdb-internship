# Task 1: Actor Profile - Testing Guide

## Overview
This guide provides step-by-step instructions to test the Actor Profile implementation with all required features.

## Prerequisites
1. Node.js 18+ installed
2. npm or yarn package manager
3. Chrome/Edge browser with DevTools
4. Lighthouse extension or Chrome DevTools

## Step 1: Start the Development Server

```bash
npm run dev
```

The application should start at `http://localhost:3000`

## Step 2: Test Basic Actor Profile Page

1. Navigate to: `http://localhost:3000/actor/1`
2. **Verify:**
   - Actor hero section displays with cover image and profile image
   - Actor name is visible
   - Biography, Awards, and Social panels are displayed
   - Filmography section is visible
   - Similar actors section is visible

## Step 3: Test ISR (Incremental Static Regeneration)

1. Visit `http://localhost:3000/actor/1`
2. Note the current content
3. Wait for the page to load completely
4. **Verify in Network Tab:**
   - Initial page load is static (no API calls)
   - Check response headers for `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`

## Step 4: Test On-Demand Revalidation

1. Open browser DevTools → Network tab
2. Make a POST request to revalidate:
   ```bash
   curl -X POST http://localhost:3000/api/actors/1/revalidate
   ```
   Or use Postman/Thunder Client
3. **Verify:**
   - Response: `{ "revalidated": true, "actorId": 1 }`
   - Next visit to `/actor/1` shows fresh data

## Step 5: Test Edge Runtime

1. Check API route: `http://localhost:3000/api/actors/1`
2. **Verify in Response Headers:**
   - Response comes from edge runtime
   - Fast response time (< 100ms typically)

## Step 6: Test Image Optimization

1. Open DevTools → Network tab
2. Filter by "Img"
3. Reload `/actor/1`
4. **Verify:**
   - Images are served with optimized formats (WebP/AVIF)
   - Images have proper `sizes` attribute
   - Critical images (cover, profile) have `fetchPriority="high"`
   - Images use Next.js Image component with blur placeholder

## Step 7: Test Filmography Explorer (Virtualization)

1. Navigate to `/actor/1`
2. Scroll to Filmography section
3. **Verify:**
   - Filmography list is virtualized (only visible items rendered)
   - Smooth scrolling with 120+ items
   - Check DevTools → Elements → Only ~10-15 items in DOM at a time

## Step 8: Test Faceted Filters

1. In Filmography section, test filters:
   - **Year Filter:**
     - Select a year from dropdown
     - Verify list updates to show only that year
   - **Role Filter:**
     - Select "Lead Role" or "Supporting Role"
     - Verify list filters correctly
   - **Genre Filter:**
     - Select a genre (Action, Drama, etc.)
     - Verify list filters by genre
   - **Combined Filters:**
     - Select both year and role
     - Verify both filters work together
   - **Clear Filters:**
     - Click "Clear Filters"
     - Verify all items are shown again

## Step 9: Test Parallel Route Segments

1. Navigate to `/actor/1`
2. **Verify all parallel routes load:**
   - `@bio` - Biography panel (top left)
   - `@awards` - Awards panel (top middle)
   - `@social` - Social links panel (top right)
   - `@knownfor` - Filmography section
   - `@similar` - Similar actors section

3. **Test Suspense boundaries:**
   - Check that loading states appear during data fetch
   - Verify smooth transitions when data loads

## Step 10: Test Security Rules/Policy Layer

1. Test rate limiting:
   ```bash
   # Make 60+ rapid requests
   for i in {1..65}; do curl http://localhost:3000/api/actors/1; done
   ```
2. **Verify:**
   - First 60 requests succeed
   - Request 61+ returns `403` with "Rate limit exceeded"

3. Test origin validation:
   - Make request with different origin header
   - Verify policy enforcement

## Step 11: Test Stale-While-Revalidate Caching

1. Visit `/actor/1` (first visit - cache miss)
2. Wait 1 second
3. Visit `/actor/1` again (should use cache)
4. **Verify in Network tab:**
   - Second visit is instant (from cache)
   - Background revalidation happens after 1 hour

## Step 12: Test i18n (Internationalization)

1. **Test locale detection:**
   - Set browser language to Spanish
   - Visit `/actor/1`
   - Verify actor name/biography in Spanish (if available)

2. **Test alternate names:**
   - Check that alternate names appear below main name
   - Should show: "Also known as: Timmy, Timothée Hal Chalamet"

3. **Test API locale:**
   ```bash
   curl -H "Accept-Language: es" http://localhost:3000/api/actors/1
   ```
   - Verify response includes localized content

## Step 13: Test JSON-LD Structured Data

1. Visit `/actor/1`
2. Open DevTools → Elements
3. Search for `<script type="application/ld+json">`
4. **Verify:**
   - JSON-LD contains `@type: "Person"`
   - Includes name, birthDate, birthPlace
   - Includes awards array
   - Includes sameAs (social links)
   - Includes alternateName

5. **Test with Google Rich Results Test:**
   - Copy page HTML
   - Paste into: https://search.google.com/test/rich-results
   - Verify Person schema is valid

## Step 14: Test LCP (Largest Contentful Paint) Performance

### Using Lighthouse:

1. Open Chrome DevTools → Lighthouse tab
2. Select:
   - **Device:** Mobile (Mid-range)
   - **Categories:** Performance
3. Click "Analyze page load"
4. Navigate to `/actor/1` and run Lighthouse
5. **Verify:**
   - LCP < 1.2s (p95 target)
   - Performance score > 90
   - Check "Largest Contentful Paint" metric

### Manual LCP Check:

1. Open DevTools → Performance tab
2. Record page load
3. Navigate to `/actor/1`
4. Stop recording
5. **Verify:**
   - LCP element is the hero cover image
   - LCP time < 1.2s
   - Image loads with `priority` and `fetchPriority="high"`

### Optimization Checks:

1. **Preconnect/DNS-Prefetch:**
   - Check Network tab for preconnect to `images.unsplash.com`
   - Should appear early in page load

2. **Image Preloading:**
   - Check for `<link rel="preload" as="image">` tags
   - Critical images should be preloaded

3. **Resource Hints:**
   - Verify `fetchPriority="high"` on hero images
   - Check that non-critical images use `loading="lazy"`

## Step 15: Test Error Handling

1. **Test 404:**
   - Visit `/actor/99999` (non-existent actor)
   - Verify 404 page appears

2. **Test Invalid ID:**
   - Visit `/actor/abc`
   - Verify error handling

## Step 16: Test Responsive Design

1. Open DevTools → Toggle device toolbar
2. Test on different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)
3. **Verify:**
   - Layout adapts correctly
   - Images resize appropriately
   - Filmography filters remain accessible

## Step 17: Test Accessibility

1. **Keyboard Navigation:**
   - Tab through all interactive elements
   - Verify focus indicators
   - Test filmography filters with keyboard

2. **Screen Reader:**
   - Use screen reader (NVDA/JAWS/VoiceOver)
   - Verify all content is announced
   - Check ARIA labels on filters

3. **Lighthouse Accessibility:**
   - Run Lighthouse → Accessibility
   - Verify score > 90

## Step 18: Test Build & Production

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Verify build:**
   - No TypeScript errors
   - No build warnings
   - Static pages generated for actor routes

3. **Start production server:**
   ```bash
   npm start
   ```

4. **Test production:**
   - Visit `/actor/1`
   - Verify all features work
   - Check performance metrics

## Expected Results Summary

✅ **ISR:** Pages revalidate every hour, with stale-while-revalidate  
✅ **On-demand Revalidation:** POST to `/api/actors/[id]/revalidate` works  
✅ **Edge Runtime:** API routes use edge runtime  
✅ **Image Optimization:** Images optimized with Next.js Image  
✅ **Virtualization:** Filmography list virtualized with react-virtual  
✅ **Filters:** Year, Role, and Genre filters work  
✅ **Parallel Routes:** All route segments load correctly  
✅ **Security:** Rate limiting and policy enforcement active  
✅ **Caching:** Stale-while-revalidate headers present  
✅ **i18n:** Locale detection and alternate names work  
✅ **JSON-LD:** Structured data valid and complete  
✅ **LCP:** < 1.2s on mid-range mobile  

## Troubleshooting

**Issue:** LCP > 1.2s
- **Solution:** Check image preloading, ensure `priority` and `fetchPriority="high"` on hero images

**Issue:** Filters not working
- **Solution:** Check browser console for errors, verify filmography data includes genre

**Issue:** i18n not working
- **Solution:** Check browser language settings, verify Accept-Language header

**Issue:** Rate limiting not working
- **Solution:** Verify API policy is applied, check request headers

## Additional Testing Tools

1. **WebPageTest:** https://www.webpagetest.org/
   - Test from different locations
   - Verify LCP metrics

2. **Chrome DevTools Performance:**
   - Record and analyze performance
   - Check for layout shifts

3. **Next.js Analytics:**
   - Enable Vercel Analytics
   - Monitor real-world performance
