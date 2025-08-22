# 🚀 Static Deployment Setup Guide

## Overview
This guide will help you deploy your Joshua Mercado website as a **completely static site** using GitHub Actions and GitHub Pages. All Google API calls happen directly from the visitor's browser.

## 📋 Prerequisites

### 1. Google Cloud Console Setup

#### A. Create Project & Enable APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - **Google Calendar API**
   - **Google Drive API**  
   - **Google Docs API**

#### B. Create API Key
1. Go to "Credentials" → "Create Credentials" → "API Key"
2. Copy the API key (you'll need this later)

#### C. Configure API Key Restrictions
1. Click on your API key to edit it
2. **Application restrictions**:
   - Select "HTTP referrers (web sites)"
   - Add these referrers:
     ```
     https://joshmjazz-create.github.io/*
     https://your-custom-domain.com/*
     https://www.your-custom-domain.com/*
     http://localhost:*
     http://127.0.0.1:*
     ```
   
   **Important**: Include both GitHub Pages URL AND your planned custom domain to ensure uninterrupted service during domain transitions.

3. **API restrictions**:
   - Select "Restrict key"
   - Choose: Calendar API, Drive API, Docs API

### 2. Google Calendar Configuration

#### Make Calendar Public
1. Open [Google Calendar](https://calendar.google.com)
2. Find your calendar in left sidebar
3. Click three dots → "Settings and sharing"
4. Under "Access permissions":
   - ✅ Check: **"Make available to public"**
   - Set visibility: **"See all event details"**

#### Get Calendar ID
1. In calendar settings, scroll to "Integrate calendar"
2. Copy the **Calendar ID** (looks like: `example@gmail.com` or `abc123@group.calendar.google.com`)

### 3. Google Drive Content Setup

#### Option A: Public Documents (Recommended)
Make your content publicly accessible:

**Biography Document:**
1. Open your biography Google Doc
2. Click "Share" → "Anyone with the link can view"
3. Copy the document ID from URL: `https://docs.google.com/document/d/[DOCUMENT_ID]/edit`

**Photos Folder:**
1. Create/open your photos Google Drive folder
2. Right-click folder → "Share" → "Anyone with the link can view"
3. Copy folder ID from URL: `https://drive.google.com/drive/folders/[FOLDER_ID]`

**Music Albums Folder:**
1. Create this folder structure in Google Drive:
   ```
   Music/
   ├── My Music/
   │   ├── Album1/
   │   │   └── album-info.doc
   │   └── Album2/
   │       └── album-info.doc
   ├── Featured On/
   │   └── ...
   └── Upcoming/
       └── ...
   ```
2. Share the main "Music" folder publicly
3. Each album-info.doc should contain:
   ```
   TITLE: Album Name
   ARTIST: Artist Name
   YEAR: 2024
   SPOTIFY: https://open.spotify.com/album/...
   APPLE: https://music.apple.com/album/...
   YOUTUBE: https://www.youtube.com/playlist?list=...
   ```

## 🔑 GitHub Secrets Setup

Go to your repository: `Settings` → `Secrets and variables` → `Actions`

Add these **Repository secrets**:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `GOOGLE_API_KEY` | `AIza...` | Your Google API key |
| `GOOGLE_CALENDAR_ID` | `example@gmail.com` | Your calendar ID |
| `BIOGRAPHY_DOC_ID` | `1ABC...` | Biography Google Doc ID |
| `PHOTOS_FOLDER_ID` | `1XYZ...` | Photos Google Drive folder ID |
| `MUSIC_FOLDER_ID` | `1DEF...` | Music Google Drive folder ID |

## 🔧 GitHub Pages Configuration

1. Go to repository: `Settings` → `Pages`
2. **Source**: `Deploy from a branch`
3. **Branch**: `gh-pages`
4. **Folder**: `/ (root)`
5. **Custom domain** (optional): Add your domain (e.g., `joshuamercado.com`)
6. Click **Save**

### Custom Domain Setup
If using a custom domain:
1. Add your domain in the "Custom domain" field
2. Configure DNS records with your domain provider:
   - **A Records** pointing to GitHub Pages IPs, OR
   - **CNAME Record** pointing to `joshmjazz-create.github.io`
3. Enable "Enforce HTTPS" after DNS propagation

## 🚀 Deployment Process

1. **Push your code**:
   ```bash
   git add .
   git commit -m "Configure static deployment with client-side APIs"
   git push newrepo main
   ```

2. **Automatic deployment**:
   - GitHub Actions builds your site
   - Deploys to GitHub Pages
   - Site available at: 
     - GitHub Pages: `https://joshmjazz-create.github.io/Mercado-Website`
     - Custom domain: `https://your-domain.com` (if configured)

## 🎯 How It Works

### Static Site Benefits
- ✅ **No server required** - Pure static hosting
- ✅ **Real-time data** - Fresh content from Google APIs
- ✅ **Free hosting** - GitHub Pages at no cost
- ✅ **Fast loading** - CDN distributed content
- ✅ **Automatic updates** - Content updates when you modify Google Drive/Calendar

### Client-Side API Flow
1. **Visitor loads page** → Static HTML/CSS/JS served
2. **JavaScript initializes** → Google API client loads
3. **API calls execute** → Fresh data fetched from Google
4. **Content renders** → Real-time biography, photos, events, music

## 🔒 Security Notes

- **API key is public** - This is normal for client-side APIs
- **API restrictions protect you** - Only your domains can use the key
- **Content is publicly accessible** - Required for static hosting
- **No server secrets exposed** - Everything runs in visitor's browser

## 🐛 Troubleshooting

### Common Issues:

**"Calendar API error: 403"**
- Check calendar is public: Settings → Access permissions → Make available to public
- Verify API key has Calendar API enabled

**"Biography/Photos not loading"**
- Ensure documents/folders are shared publicly
- Check document/folder IDs are correct in GitHub secrets

**"API key not working"**
- Verify domain restrictions include ALL your domains (GitHub Pages + custom domain)
- Check API restrictions include Calendar, Drive, and Docs APIs
- Test with browser developer tools to see specific error messages

### Testing Locally:
```bash
npm run dev
```
- Local development uses environment variables from `.env` file
- Production uses GitHub secrets passed to build process

## 🎉 Success!

Once everything is configured:
- Your site deploys automatically on every push
- Content updates in real-time from Google services
- No server management required
- Professional static hosting on GitHub Pages