# Bandaranayake College Sportmeet - Digital Marks Board

## Overview

This is a Progressive Web App (PWA) that serves as the official real-time digital marks board for Bandaranayake College Inter-house Sports Meet. The application displays live scores, house rankings, athletics results, and sports updates for four competing houses: Gemunu, Vijaya, Parakrama, and Tissa.

The site is designed primarily for mobile viewing during the annual school sports meet, providing students, staff, and spectators with instant access to competition results and standings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Pure HTML/CSS/JavaScript**: No frontend framework - vanilla JS for maximum performance and simplicity
- **Static Site Design**: All pages are static HTML files served directly
- **PWA Implementation**: Full Progressive Web App with service worker (`sw.js`), manifest (`manifest.json`), and offline support
- **Push Notifications**: OneSignal integration for real-time score update notifications

### Data Storage
- **JSON-based Data Store**: All competition data stored in static JSON files under `/data/` directory
  - `basic.json`: Site configuration, branding, and metadata
  - `{year}.json`: Yearly athletics scores organized by age categories and events
  - `historical.json`: Historical records of past competitions
  - `leaders.json`: Sports committee and leadership information
  - `moments.json`: Photo gallery and memorable moments
  - `summaries.json`: Championship results and best athlete awards

### Server Architecture
- **Simple Node.js HTTP Server**: Minimal `server.js` using built-in `http` module
- **Static File Serving**: Serves HTML, CSS, JS, and JSON files with appropriate MIME types
- **Port 5000**: Configured to run on `0.0.0.0:5000`

### Key Design Decisions

1. **No Build Process**: Files are served directly without bundling or transpilation - reduces complexity and enables instant updates to scores

2. **PWA-First Design**: Installable app with offline capability, badge notifications, and periodic sync for score updates. Device detection shows specific device names (Samsung, iPhone, Xiaomi, etc.) on install prompt

3. **Security Layer**: `security.js` implements enhanced protection v2.0 including:
   - Disabled right-click context menu
   - Disabled text selection (CSS + JS)
   - Blocked keyboard shortcuts (F12, Ctrl+Shift+I/J/C/K/M, Ctrl+U/S/P/A)
   - DevTools detection with console clearing
   - Disabled copy/cut events outside input fields
   - Disabled printing
   - Image dragging prevention

4. **Four-House Scoring System**: All data structures support exactly four houses with designated colors (Vijaya-Red, Gemunu-Blue, Parakrama-Yellow, Tissa-Green)

5. **Year-Based Data Organization**: Each competition year has its own JSON file, allowing easy archival and historical comparisons

## External Dependencies

### Third-Party Services
- **OneSignal**: Push notification service for real-time score alerts (SDK loaded via CDN)
- **ibb.co**: Image hosting for logos, team photos, and event images

### CDN Resources
- **Google Fonts**: Outfit and Oswald font families for typography
- **Font Awesome**: Icon library (likely, based on icon class patterns in PWA code)

### External Integrations
- **Social Media Links**: WhatsApp Channel, Facebook, Instagram for the Coding Club that developed the site
- **No Database**: Application is entirely file-based with no external database dependency

### Service Worker Caching
- Multiple cache stores for different asset types (main cache, assets, images, CDN)
- Navigation preload enabled for fast page loads
- Offline fallback page (`offline.html`) for network failures