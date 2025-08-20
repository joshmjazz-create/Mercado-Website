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
- Added Music page with album cover gallery
- Implemented mobile navigation with hamburger menu
- Created album management system with add/edit/delete functionality
- Added platform selection modal (Spotify, Apple Music, YouTube)
- Organized albums into "Original Music" and "Featured On" sections
- Updated database schema from music recordings to albums
- Added proper form validation and error handling

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