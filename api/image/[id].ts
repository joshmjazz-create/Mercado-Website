import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Image ID required' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS || '{}'),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const authClient = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: authClient });

    const response = await drive.files.get({
      fileId: id,
      alt: 'media',
    }, {
      responseType: 'stream'
    });

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Pipe the image data to the response
    response.data.pipe(res);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}