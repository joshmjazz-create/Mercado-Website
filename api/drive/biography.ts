import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getBiographyContent } from '../../server/google-drive';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const biography = await getBiographyContent();
    res.json({ biography });
  } catch (error) {
    console.error('Error fetching biography:', error);
    res.status(500).json({ error: 'Failed to fetch biography' });
  }
}