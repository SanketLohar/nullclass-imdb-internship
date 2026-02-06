# MovieVerse — IMDB-Style Movie Platform

Live Demo https://nullclass-imdb-internship-git-main-sanketlohars-projects.vercel.app/

MovieVerse is a modern, production-ready movie discovery platform built with **Next.js App Router**.  
It focuses on **performance, accessibility, offline resilience, and real-world UX patterns** expected in professional front-end and full-stack applications.

---

## Features Overview

### Movie Discovery
- Browse **Top Rated**, **Trending**, **Upcoming**, and **Popular** movies
- Movie detail pages with:
  - Overview
  - Cast & credits
  - Trailers
  - Similar movies
- Actor profile pages with filmography exploration

### Trailer Experience (Accessibility-First)
- YouTube trailer integration with:

  - Native YouTube controls (play, pause, mute, scrub)
  - Keyboard support (Tab / Enter / Space)
  - Screen-reader friendly (`iframe` title)
- Mobile-safe playback (no autoplay policy violations)

###  Reviews System
- Authenticated review creation
- Optimistic UI updates
- Vote ranking using **Wilson Score**
- Sort reviews by:
  - Helpful
  - Recent
  - Controversial
- Real-time updates via **Server-Sent Events (SSE)**

### Watchlist
- Add / remove movies from watchlist
- Persistent storage using:
  - LocalStorage
  - IndexedDB
- Cross-tab synchronization
- Optimistic updates with rollback support

---

##  Architecture Highlights

### Next.js App Router
- Server Components for data fetching
- Client Components for interactivity
- Parallel routes for complex layouts
- Route-level error boundaries for resilience

### Performance
- Incremental Static Regeneration (ISR)
- Request coalescing and caching
- Circuit breaker with retry + backoff
- Optimized images with `next/image`
- Lighthouse-friendly LCP & TTI

### API Layer
- TMDB / OMDb wrapped behind a service abstraction
- Rate limiting and retry logic
- Graceful degradation on API failures

---



##  Accessibility
- Keyboard navigation support
- Focus management for modals
- ARIA labels & live regions
- Media controls fully usable without mouse
- No autoplay without user intent

---

##  Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Data Fetching:** Native Fetch + Service Abstractions
- **State Sync:** BroadcastChannel, IndexedDB
- **Media:** YouTube Iframe API
- **Deployment:** Vercel

---

##  Getting Started (Local Setup)

```bash
# Clone repository
git clone https://github.com/SanketLohar/nullclass-imdb-internship.git

# Install dependencies
npm install

# Run development server
npm run dev

# Production build
npm run build
npm start
