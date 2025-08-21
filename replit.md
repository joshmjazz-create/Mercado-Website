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
- Added Music page with album cover gallery and three categories
- Implemented album categories: Original (4), Featured On (2), Upcoming (2)
- Added audio preview functionality for upcoming albums with 10-second fade in/out
- Removed all admin controls from Music page per user request
- Updated subcategory headings to be smaller, underlined, grey, and left-aligned
- Implemented mobile navigation with hamburger menu
- Added platform selection modal (Spotify, Apple Music, YouTube)
- Updated database schema from music recordings to albums with category field
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