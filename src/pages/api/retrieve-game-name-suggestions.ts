// api/retrieve-game-name-suggestions
// post method to retrieve game name from database by name substring
// return array of {name: string, release_date: string}

import { NextApiRequest, NextApiResponse } from 'next';
import { getGameSuggestions } from '../../lib/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: 'Query parameter "q" is required' 
        });
      }

      // Get game suggestions from database
      const suggestions = await getGameSuggestions(q);
      
      res.status(200).json({
        success: true,
        suggestions,
        count: suggestions.length
      });
    } catch (error) {
      console.error('Error retrieving game suggestions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve game suggestions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: 'Method not allowed' });
  }
}

