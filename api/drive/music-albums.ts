import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMusicAlbums } from '../../server/google-drive';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const albums = await getMusicAlbums();
    res.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
}