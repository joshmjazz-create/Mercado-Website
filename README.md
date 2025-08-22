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
- **Deployment**: GitHub Actions → GitHub Pages

## GitHub Actions Deployment

This project is configured for automatic deployment using GitHub Actions to GitHub Pages.

### Step-by-Step Deployment Process

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add GitHub Actions deployment configuration"
   git push newrepo main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository: `Settings` → `Pages`
   - Source: `Deploy from a branch`
   - Branch: `gh-pages`
   - Folder: `/ (root)`

3. **Add Repository Secrets**:
   Go to `Settings` → `Secrets and variables` → `Actions` and add:
   - `GOOGLE_API_KEY`: Your Google API key (for client-side calls)
   - `GOOGLE_CALENDAR_ID`: Your Google Calendar ID

4. **Automatic Deployment**:
   - Every push to `main` triggers automatic build and deployment
   - Site will be available at: `https://yourusername.github.io/repository-name`
   - Optional: Add custom domain in repository settings

## How It Works

### GitHub Actions Workflow
1. **Build Process**: Fetches fresh data from Google APIs during build time
2. **Static Generation**: Creates JSON files with biography, photos, and music data
3. **Frontend Build**: Compiles React app with pre-built data
4. **Deployment**: Automatically deploys to GitHub Pages

### Environment Variables (GitHub Secrets)
- `GOOGLE_API_KEY`: Google API key with Calendar, Drive, and Docs permissions
- `GOOGLE_CALENDAR_ID`: Your Google Calendar ID

### API Configuration Required
For Google Drive content (Biography, Photos, Music), you'll need to:
1. **Make documents/folders publicly accessible**, OR
2. **Use OAuth authentication** for private content access
3. **Configure CORS settings** in Google Cloud Console

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
├── .github/workflows/  # GitHub Actions deployment
├── scripts/           # Build scripts for static data generation
└── src/lib/api-client.ts # Client-side API calls
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