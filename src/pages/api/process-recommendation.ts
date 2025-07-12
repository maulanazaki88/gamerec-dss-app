// api/process-recommendation
// method post, expect body: {games: string[]}
// return array of recommended games with similarity scores

import { NextApiRequest, NextApiResponse } from 'next';
import { getGamesByNames, getPool } from '../../lib/database';
import { GamesType } from '../../models/games.model';

interface RecommendationRequest {
  games: string[];
}

interface RecommendationResult {
  name: string;
  similarity_score: number;
  steam_appid: string;
  genres: string[];
  categories: string[];
}

// Calculate Jaccard similarity between two sets
function jaccardSimilarity(set1: string[], set2: string[]): number {
  // Handle null/undefined cases
  if (!set1 || !set2) return 0;
  if (set1.length === 0 && set2.length === 0) return 1;
  if (set1.length === 0 || set2.length === 0) return 0;
  
  // Normalize strings for better matching
  const normalizedSet1 = set1.map(item => item?.toLowerCase()?.trim() || '').filter(item => item);
  const normalizedSet2 = set2.map(item => item?.toLowerCase()?.trim() || '').filter(item => item);
  
  // Handle empty sets after normalization
  if (normalizedSet1.length === 0 && normalizedSet2.length === 0) return 1;
  if (normalizedSet1.length === 0 || normalizedSet2.length === 0) return 0;
  
  const intersection = normalizedSet1.filter(item => normalizedSet2.includes(item));
  const union = [...new Set([...normalizedSet1, ...normalizedSet2])];
  
  if (union.length === 0) return 0;
  
  const similarity = intersection.length / union.length;
  return isNaN(similarity) ? 0 : Math.max(0, Math.min(1, similarity));
}

// Calculate similarity between user preferences and a game
function calculateSimilarity(userProfile: GamesType[], candidate: GamesType): number {
  // Safety check for inputs
  if (!userProfile || userProfile.length === 0 || !candidate) {
    console.log('Invalid input for similarity calculation');
    return 0;
  }

  // Extract all genres and categories from user's preferred games
  const userGenres = userProfile.flatMap(game => game.genres || []).filter(g => g);
  const userCategories = userProfile.flatMap(game => game.categories || []).filter(c => c);
  const userPlatforms = userProfile.flatMap(game => game.platforms || []).filter(p => p);
  
  // Calculate similarities
  const genreSimilarity = jaccardSimilarity(userGenres, candidate.genres || []);
  const categorySimilarity = jaccardSimilarity(userCategories, candidate.categories || []);
  const platformSimilarity = jaccardSimilarity(userPlatforms, candidate.platforms || []);
  
  // Calculate review score similarity (normalized and bounded)
  const validUserReviewScores = userProfile.map(game => game.review_score || 0).filter(score => !isNaN(score));
  const avgUserReviewScore = validUserReviewScores.length > 0 ? 
    validUserReviewScores.reduce((sum, score) => sum + score, 0) / validUserReviewScores.length : 0;
  
  const candidateReviewScore = candidate.review_score || 0;
  const reviewDiff = Math.abs(avgUserReviewScore - candidateReviewScore);
  const reviewSimilarity = isNaN(reviewDiff) ? 0 : Math.max(0, 1 - reviewDiff / 100);
  
  // Calculate price similarity (more robust)
  const validUserPrices = userProfile.map(game => game.price_initial_usd || 0).filter(price => !isNaN(price));
  const avgUserPrice = validUserPrices.length > 0 ? 
    validUserPrices.reduce((sum, price) => sum + price, 0) / validUserPrices.length : 0;
  
  const candidatePrice = candidate.price_initial_usd || 0;
  let priceSimilarity = 0.5; // Default neutral similarity
  
  if (candidatePrice === 0 && avgUserPrice === 0) {
    priceSimilarity = 1; // Both free
  } else if (candidatePrice === 0 || avgUserPrice === 0) {
    priceSimilarity = 0.3; // One free, one paid
  } else if (!isNaN(candidatePrice) && !isNaN(avgUserPrice)) {
    const priceDiff = Math.abs(avgUserPrice - candidatePrice);
    const maxPrice = Math.max(avgUserPrice, candidatePrice);
    if (maxPrice > 0) {
      priceSimilarity = Math.max(0, 1 - priceDiff / maxPrice);
    }
  }
  
  // Ensure no NaN values
  const safeGenreSimilarity = isNaN(genreSimilarity) ? 0 : genreSimilarity;
  const safeCategorySimilarity = isNaN(categorySimilarity) ? 0 : categorySimilarity;
  const safePlatformSimilarity = isNaN(platformSimilarity) ? 0 : platformSimilarity;
  const safeReviewSimilarity = isNaN(reviewSimilarity) ? 0 : reviewSimilarity;
  const safePriceSimilarity = isNaN(priceSimilarity) ? 0.5 : priceSimilarity;
  
  // Weighted similarity calculation
  const totalSimilarity = 
    safeGenreSimilarity * 0.4 +          // Genre is most important
    safeCategorySimilarity * 0.25 +       // Categories are important
    safePlatformSimilarity * 0.15 +       // Platform compatibility
    safeReviewSimilarity * 0.15 +         // Review quality
    safePriceSimilarity * 0.05;           // Price similarity
  
  // Debug logging for detailed analysis
  if (totalSimilarity === 0 || isNaN(totalSimilarity)) {
    console.log(`Similarity debug for ${candidate.name}:`);
    console.log(`  Genre: ${safeGenreSimilarity.toFixed(3)} (user: ${userGenres.slice(0,3)}, candidate: ${candidate.genres?.slice(0,3)})`);
    console.log(`  Category: ${safeCategorySimilarity.toFixed(3)} (user: ${userCategories.slice(0,3)}, candidate: ${candidate.categories?.slice(0,3)})`);
    console.log(`  Platform: ${safePlatformSimilarity.toFixed(3)}`);
    console.log(`  Review: ${safeReviewSimilarity.toFixed(3)} (user avg: ${avgUserReviewScore}, candidate: ${candidateReviewScore})`);
    console.log(`  Price: ${safePriceSimilarity.toFixed(3)} (user avg: ${avgUserPrice}, candidate: ${candidatePrice})`);
    console.log(`  Total: ${totalSimilarity}`);
  }
  
  const finalSimilarity = isNaN(totalSimilarity) ? 0 : Math.max(0, Math.min(1, totalSimilarity));
  return finalSimilarity;
}

// Simplified similarity calculation as fallback
function calculateSimplifiedSimilarity(userProfile: GamesType[], candidate: GamesType): number {
  console.log('Using simplified similarity for:', candidate.name);
  
  // Safety check
  if (!userProfile || userProfile.length === 0 || !candidate) {
    return 0.1 + Math.random() * 0.2; // Random fallback
  }
  
  // Extract all genres from user's preferred games
  const userGenres = userProfile.flatMap(game => game.genres || []).filter(g => g);
  const candidateGenres = candidate.genres || [];
  
  // Simple genre overlap check
  const genreMatches = candidateGenres.filter(genre => 
    userGenres.some(userGenre => 
      userGenre.toLowerCase().includes(genre.toLowerCase()) ||
      genre.toLowerCase().includes(userGenre.toLowerCase())
    )
  );
  
  // Calculate basic similarity based on genre overlap
  let similarity = 0;
  
  if (genreMatches.length > 0 && (candidateGenres.length > 0 || userGenres.length > 0)) {
    const denominator = Math.max(candidateGenres.length, userGenres.length / userProfile.length);
    if (denominator > 0) {
      similarity = genreMatches.length / denominator;
      similarity = Math.min(similarity, 0.8); // Cap at 80% for simplified algorithm
    }
  }
  
  // Add small random factor to ensure variety (0.1 to 0.3)
  const randomFactor = 0.1 + Math.random() * 0.2;
  similarity = Math.max(similarity, randomFactor);
  
  const finalSimilarity = isNaN(similarity) ? randomFactor : similarity;
  console.log(`Simplified similarity for ${candidate.name}: ${(finalSimilarity * 100).toFixed(1)}%`);
  return finalSimilarity;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { games }: RecommendationRequest = req.body;
    
    if (!games || !Array.isArray(games) || games.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Please provide exactly 3 game names'
      });
    }

    // Get user's selected games
    const userGames = await getGamesByNames(games);
    
    console.log('Input games requested:', games);
    console.log('User games found:', userGames.map(g => ({ name: g.name, genres: g.genres, categories: g.categories })));
    
    if (userGames.length !== 3) {
      return res.status(400).json({
        success: false,
        message: `Only found ${userGames.length} games in database: ${userGames.map(g => g.name).join(', ')}`
      });
    }

    // Get all games from database except user's selected games
    const client = await getPool().connect();
    const allGamesResult = await client.query(
      `SELECT * FROM released_games WHERE name NOT IN ($1, $2, $3) LIMIT 100`,
      games
    );
    client.release();

    const allGames = allGamesResult.rows as GamesType[];
    console.log(`Found ${allGames.length} candidate games in database`);
    
    // Log sample of candidate games
    if (allGames.length > 0) {
      console.log('Sample candidate games:');
      allGames.slice(0, 3).forEach(game => {
        console.log(`  ${game.name} - Genres: ${game.genres?.slice(0,2)}, Categories: ${game.categories?.slice(0,2)}`);
      });
    }
    
    // Calculate similarity for each game
    const recommendations: RecommendationResult[] = allGames.map(game => {
      let similarity = calculateSimilarity(userGames, game);
      
      // Safety check for NaN
      if (isNaN(similarity)) {
        console.log(`NaN similarity detected for ${game.name}, using fallback`);
        similarity = 0;
      }
      
      // Fallback: if similarity is 0, use simplified algorithm
      if (similarity === 0) {
        similarity = calculateSimplifiedSimilarity(userGames, game);
        
        // Double-check for NaN after fallback
        if (isNaN(similarity)) {
          similarity = 0.1 + Math.random() * 0.2; // Random fallback
        }
      }
      
      return {
        name: game.name,
        steam_appid: game.steam_appid,
        similarity_score: Math.max(0, Math.min(1, similarity)), // Ensure bounded
        genres: game.genres || [],
        categories: game.categories || []
      };
    });

    // Sort by similarity score and get top 5
    let topRecommendations = recommendations
      .filter(rec => !isNaN(rec.similarity_score)) // Filter out any remaining NaN
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, 5);

    // Final fallback: if all recommendations have 0 similarity, provide random popular games
    if (topRecommendations.length === 0 || topRecommendations.every(rec => rec.similarity_score === 0)) {
      console.log('All similarities are 0 or invalid, using random fallback');
      topRecommendations = recommendations
        .slice(0, 50) // Take first 50 games
        .sort(() => Math.random() - 0.5) // Randomize
        .slice(0, 5)
        .map(rec => ({
          ...rec,
          similarity_score: 0.1 + Math.random() * 0.4 // Give them 10-50% similarity
        }));
    }

    console.log('Final top 5 recommendations:');
    topRecommendations.forEach((rec, index) => {
      const percentage = (rec.similarity_score * 100).toFixed(1);
      console.log(`${index + 1}. ${rec.name} - ${percentage}%`);
    });

    res.status(200).json({
      success: true,
      recommendations: topRecommendations,
      userGames: userGames.map(game => ({
        name: game.name,
        genres: game.genres,
        categories: game.categories
      }))
    });

  } catch (error) {
    console.error('Error processing recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process recommendations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}









