# Joshua Mercado Jazz Musician Website

A professional jazz musician website featuring dynamic content management, live calendar integration, and interactive music galleries.

## Features

- **Dynamic Biography**: Google Drive API integration for easy content updates
- **Live Schedule**: Google Calendar integration with real-time event display
- **Music Portfolio**: Automated album detection with Spotify integration
- **Photo Gallery**: Google Drive photo management with lightbox display
- **Audio Previews**: 15-second music previews with fade effects
- **FlexList App**: Promotion page for the music organization mobile app

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Google APIs
- **Build Tool**: Vite
- **Deployment**: Vercel/Netlify compatible

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/joshua-mercado-website.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the configuration

3. **Add Environment Variables** in Vercel dashboard:
   - `GOOGLE_API_KEY`
   - `GOOGLE_CALENDAR_ID` 
   - `GOOGLE_DRIVE_CREDENTIALS`

4. **Deploy**: Automatic deployment on every push to main branch

### Option 2: Netlify

1. Push to GitHub
2. Connect repository to Netlify
3. Build settings:
   - Build command: `vite build`
   - Publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Option 3: Static Deployment

For static hosting (GitHub Pages, etc.), the Google API calls need to be moved to client-side only.

## Environment Variables

```env
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CALENDAR_ID=your_calendar_id
GOOGLE_DRIVE_CREDENTIALS=your_service_account_json
```

## Local Development

```bash
npm install
npm run dev
```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── lib/          # Utilities and API helpers
├── server/                # Backend Express application
│   ├── routes.ts         # API routes
│   ├── google-drive.ts   # Google Drive integration
│   └── index.ts         # Server entry point
├── shared/               # Shared types and schemas
├── attached_assets/     # Static assets
├── vercel.json         # Vercel deployment config
└── netlify.toml        # Netlify deployment config
```

## Features

### Music Page
- Automatic album detection from Google Drive
- Spotify integration for album covers
- Platform selection (Spotify, Apple Music, YouTube)
- Audio previews for upcoming releases

### Calendar Integration
- Live Google Calendar sync
- Event filtering by description keywords
- Color-coded events
- Mobile-responsive display

### Photo Gallery
- Google Drive integration
- Responsive grid layout
- Lightbox modal view
- Automatic image optimization

### Biography Management
- Google Docs integration
- Automatic content updates
- Mobile-optimized layouts
- Professional headshot display

## Mobile App Promotion

The FlexList page promotes the music organization mobile app with:
- Download information for Android
- App description and features
- Professional branding