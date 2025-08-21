# Joshua Mercado Jazz Musician Website

## Project Overview
A professional jazz musician website for Joshua Mercado featuring:
- Home page with introduction and background image
- Bio page with musical background
- Gallery page with Google Photos integration
- Music page with album covers and platform selection
- Schedule page with Google Calendar integration
- Contact information page

## User Preferences
- Mobile navigation with three-line menu (hamburger menu) due to tab crowding
- Desktop navigation with tabbed layout
- Color scheme: Deep purple and darker yellow for sophisticated, subdued appearance
- Professional jazz aesthetic
- Album-focused music presentation with platform selection
- Google Calendar and Photos integration for dynamic content

## Project Architecture
- Frontend: React with TypeScript, Vite, shadcn/ui, Tailwind CSS
- Backend: Express.js with TypeScript
- Routing: Wouter for client-side navigation
- State Management: TanStack Query for data fetching
- Storage: In-memory storage (MemStorage)
- Styling: Custom color scheme with deep purple and darker yellow
- Database Schema: Albums table with platform URLs (Spotify, Apple Music, YouTube)

## Recent Changes
- Updated fonts to more serious, professional serif fonts (Libre Baskerville, Playfair Display)
- Added actual social media links to Contact page (YouTube, Instagram, Facebook)
- Updated all headings to purple including Joshua's name on home page for consistent branding
- Removed logo from footer and "Book Private Event" button from schedule page
- Added social media icons to footer with proper spacing
- Updated mobile hamburger menu to center position
- Replaced biography with authentic content about Joshua's career
- Italicized "A Legendary Night" and "Impractical Jokers" titles
- Removed "Subscribe to Calendar" button from schedule page
- Successfully implemented Google Calendar integration using public iCal feed (no API key required)
- Updated calendar to auto-resync on every page reload and window focus for real-time updates
- Added event filtering to only display events with exactly "SHOW" (case-sensitive) in description
- Implemented color detection from ALL CAPS keywords in descriptions (RED, BLUE, GREEN, etc.)
- Event descriptions hide "SHOW" and color keywords from display while using them for filtering/styling
- Made venue locations clickable for navigation and removed backslashes from addresses
- Updated Bio page to single "Biography" heading with continuous narrative text
- Implemented mobile navigation with hamburger menu
- Removed all page descriptions for cleaner appearance (January 2025)
- Standardized all page title font sizes to text-5xl across all pages
- Made purple underlines match exact same color as titles (purple-800)
- Implemented Google Drive API integration for Gallery page with service account authentication
- Replaced Google Photos/PublicAlbum widget with direct Google Drive API photo fetching
- Added responsive photo grid with lightbox modal and hover effects
- Google Drive credentials configured: mercado-website@mercado-driveapi547.iam.gserviceaccount.com
- Optimized gallery layout with clean grid system and mobile-responsive sizing
- Removed gallery footer text and photo count for cleaner appearance
- Implemented smaller preview sizes on mobile with proper spacing to prevent overlap
- Added full-page expansion with max-width removal for better space utilization
- **MAJOR UPDATE: Fully integrated Music page with Google Drive API (August 2025)**
- Replaced static album system with dynamic Google Drive integration
- Implemented nested folder parsing: Music → Category folders → Individual album folders → Google Docs
- Added automatic Google Docs metadata parsing with exact user format (TITLE, ARTIST, YEAR, LINKS)
- Integrated Spotify oEmbed API for automatic album cover fetching from provided Spotify URLs
- Real-time content management: albums update automatically when Drive folders are modified
- Supports three categories: "My Music" (original), "Featured On" (collaborations), "Upcoming" (unreleased)
- Added platform selection modal with Spotify, Apple Music, and YouTube integration
- Contact page icons made clickable with purple hover effects matching calendar design
- **Audio Preview System**: 15-second previews starting at 1/3 mark with fade in/out effects for upcoming albums
- **Enhanced UI**: Elegant staggered animations across all pages, blank loading states, hidden "My Music" headers
- **Biography Integration**: Connected Bio page to Google Drive API with silent fallback system for seamless content management

## Music Page Features
- Album covers displayed in responsive grid
- Platform selection dialog on album click
- "Not available" display for missing platform links
- Admin controls for adding, editing, and deleting albums
- Categorization between original music and featured works
- Support for cover images, multiple streaming platforms, and release dates

## Next Steps
- Implement Google Calendar API integration
- Implement Google Photos API integration
- Add content and styling refinements