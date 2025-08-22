#!/usr/bin/env node

// Build script to pre-generate static data for GitHub Pages deployment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Import your Google Drive functions
import { getBiographyContent, getSharedPhotos, getMusicAlbums } from '../server/google-drive.js';

async function buildStaticData() {
  console.log('Building static data for GitHub Pages...');

  // Create API directory in dist
  const apiDir = path.join(__dirname, '../dist/public/api');
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  try {
    // Fetch biography
    console.log('Fetching biography...');
    const biography = await getBiographyContent();
    fs.writeFileSync(
      path.join(apiDir, 'biography.json'),
      JSON.stringify({ biography }, null, 2)
    );

    // Fetch photos
    console.log('Fetching photos...');
    const photos = await getSharedPhotos();
    fs.writeFileSync(
      path.join(apiDir, 'photos.json'),
      JSON.stringify(photos, null, 2)
    );

    // Fetch music albums
    console.log('Fetching music albums...');
    const albums = await getMusicAlbums();
    fs.writeFileSync(
      path.join(apiDir, 'albums.json'),
      JSON.stringify(albums, null, 2)
    );

    console.log('Static data generation complete!');
  } catch (error) {
    console.error('Error building static data:', error);
    process.exit(1);
  }
}

buildStaticData();