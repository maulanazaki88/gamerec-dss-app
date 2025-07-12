import { NextApiRequest, NextApiResponse } from 'next';
import { testConnection, getAllGames } from '../../lib/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      // Test connection
      const isConnected = await testConnection();
      
      if (isConnected) {
        // Get sample games
        const games = await getAllGames();
        
        res.status(200).json({
          success: true,
          message: 'Database connection successful',
          sampleGames: games,
          totalSampleGames: games.length
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Database connection failed'
        });
      }
    } catch (error) {
      console.error('Database test error:', error);
      res.status(500).json({
        success: false,
        message: 'Database test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: 'Method not allowed' });
  }
} 