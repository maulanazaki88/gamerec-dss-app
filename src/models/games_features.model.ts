// Game Features Model untuk table yang telah di-encode
export interface GameFeaturesType {
  steam_appid: string;
  name: string;
  
  // One-hot encoded genres
  genre_action: boolean;
  genre_adventure: boolean;
  genre_rpg: boolean;
  genre_strategy: boolean;
  genre_simulation: boolean;
  genre_sports: boolean;
  genre_racing: boolean;
  genre_casual: boolean;
  genre_indie: boolean;
  genre_massively_multiplayer: boolean;
  genre_free_to_play: boolean;
  genre_early_access: boolean;
  genre_mature: boolean;
  genre_puzzle: boolean;
  genre_shooter: boolean;
  genre_horror: boolean;
  genre_survival: boolean;
  genre_open_world: boolean;
  genre_sandbox: boolean;
  
  // One-hot encoded platforms
  platform_windows: boolean;
  platform_mac: boolean;
  platform_linux: boolean;
  
  // One-hot encoded categories
  category_single_player: boolean;
  category_multi_player: boolean;
  category_coop: boolean;
  category_online_pvp: boolean;
  category_achievements: boolean;
  category_cloud_saves: boolean;
  category_trading_cards: boolean;
  category_workshop: boolean;
  category_vr_support: boolean;
  category_controller_support: boolean;
  
  // Normalized numerical features (0-1 range)
  normalized_review_score: number;
  normalized_metacritic: number;
  normalized_price: number;
  normalized_required_age: number;
  normalized_n_achievements: number;
  normalized_positive_ratio: number;
  
  // Feature vector for cosine similarity
  feature_vector: number[];
  
  created_at: string;
}

// Utility type for creating feature vectors
export interface FeatureWeights {
  genre: number;
  platform: number;
  category: number;
  review_score: number;
  metacritic: number;
  price: number;
  age: number;
  achievements: number;
  positive_ratio: number;
}

// Default weights based on project overview
export const DEFAULT_WEIGHTS: FeatureWeights = {
  genre: 0.4,
  platform: 0.2,
  category: 0.15,
  review_score: 0.1,
  metacritic: 0.05,
  price: 0.05,
  age: 0.02,
  achievements: 0.02,
  positive_ratio: 0.01
};

// Utility functions for feature calculations
export const FeatureUtils = {
  // Calculate cosine similarity between two feature vectors
  cosineSimilarity: (vectorA: number[], vectorB: number[]): number => {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }
    
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    
    if (magnitude === 0) return 0;
    
    return dotProduct / magnitude;
  },
  
  // Calculate weighted average of user's preferred games
  calculateUserProfile: (games: GameFeaturesType[]): number[] => {
    if (games.length === 0) return [];
    
    const vectorLength = games[0].feature_vector.length;
    const avgVector = new Array(vectorLength).fill(0);
    
    // Calculate average for each feature
    games.forEach(game => {
      game.feature_vector.forEach((value, index) => {
        avgVector[index] += value;
      });
    });
    
    // Normalize by number of games
    return avgVector.map(sum => sum / games.length);
  },
  
  // Get feature importance explanation
  getFeatureImportance: (gameA: GameFeaturesType, gameB: GameFeaturesType): {
    genre_similarity: number;
    platform_similarity: number;
    category_similarity: number;
    review_similarity: number;
    metacritic_similarity: number;
    overall_similarity: number;
  } => {
    // Calculate individual feature similarities
    const genreFeatures = [
      'genre_action', 'genre_adventure', 'genre_rpg', 'genre_strategy',
      'genre_simulation', 'genre_sports', 'genre_racing', 'genre_casual',
      'genre_indie', 'genre_massively_multiplayer'
    ];
    
    const platformFeatures = ['platform_windows', 'platform_mac', 'platform_linux'];
    const categoryFeatures = [
      'category_single_player', 'category_multi_player', 'category_coop',
      'category_online_pvp', 'category_achievements'
    ];
    
    // Calculate Jaccard similarity for each feature group
    const genreSimilarity = FeatureUtils.calculateJaccardSimilarity(
      genreFeatures.map(f => (gameA as any)[f]),
      genreFeatures.map(f => (gameB as any)[f])
    );
    
    const platformSimilarity = FeatureUtils.calculateJaccardSimilarity(
      platformFeatures.map(f => (gameA as any)[f]),
      platformFeatures.map(f => (gameB as any)[f])
    );
    
    const categorySimilarity = FeatureUtils.calculateJaccardSimilarity(
      categoryFeatures.map(f => (gameA as any)[f]),
      categoryFeatures.map(f => (gameB as any)[f])
    );
    
    const reviewSimilarity = 1 - Math.abs(gameA.normalized_review_score - gameB.normalized_review_score);
    const metacriticSimilarity = 1 - Math.abs(gameA.normalized_metacritic - gameB.normalized_metacritic);
    
    const overallSimilarity = FeatureUtils.cosineSimilarity(
      gameA.feature_vector,
      gameB.feature_vector
    );
    
    return {
      genre_similarity: genreSimilarity,
      platform_similarity: platformSimilarity,
      category_similarity: categorySimilarity,
      review_similarity: reviewSimilarity,
      metacritic_similarity: metacriticSimilarity,
      overall_similarity: overallSimilarity
    };
  },
  
  // Calculate Jaccard similarity for boolean arrays
  calculateJaccardSimilarity: (setA: boolean[], setB: boolean[]): number => {
    const intersection = setA.filter((val, idx) => val && setB[idx]).length;
    const union = setA.filter((val, idx) => val || setB[idx]).length;
    
    return union === 0 ? 0 : intersection / union;
  }
};
