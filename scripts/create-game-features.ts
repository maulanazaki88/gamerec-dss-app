import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

// Feature encoding constants - defined inline in functions for better type safety

interface GameFeatures {
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
  
  // Normalized numerical features
  normalized_review_score: number;
  normalized_metacritic: number;
  normalized_price: number;
  normalized_required_age: number;
  normalized_n_achievements: number;
  normalized_positive_ratio: number;
  
  // Feature vector for cosine similarity
  feature_vector: number[];
}

async function createGameFeaturesTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔥 Creating game_features table...');
    
    const createTableQuery = `
      DROP TABLE IF EXISTS game_features;
      
      CREATE TABLE game_features (
        steam_appid VARCHAR(20) PRIMARY KEY,
        name TEXT NOT NULL,
        
        -- One-hot encoding untuk genres
        genre_action BOOLEAN DEFAULT FALSE,
        genre_adventure BOOLEAN DEFAULT FALSE,
        genre_rpg BOOLEAN DEFAULT FALSE,
        genre_strategy BOOLEAN DEFAULT FALSE,
        genre_simulation BOOLEAN DEFAULT FALSE,
        genre_sports BOOLEAN DEFAULT FALSE,
        genre_racing BOOLEAN DEFAULT FALSE,
        genre_casual BOOLEAN DEFAULT FALSE,
        genre_indie BOOLEAN DEFAULT FALSE,
        genre_massively_multiplayer BOOLEAN DEFAULT FALSE,
        genre_free_to_play BOOLEAN DEFAULT FALSE,
        genre_early_access BOOLEAN DEFAULT FALSE,
        genre_mature BOOLEAN DEFAULT FALSE,
        genre_puzzle BOOLEAN DEFAULT FALSE,
        genre_shooter BOOLEAN DEFAULT FALSE,
        genre_horror BOOLEAN DEFAULT FALSE,
        genre_survival BOOLEAN DEFAULT FALSE,
        genre_open_world BOOLEAN DEFAULT FALSE,
        genre_sandbox BOOLEAN DEFAULT FALSE,
        
        -- One-hot encoding untuk platforms
        platform_windows BOOLEAN DEFAULT FALSE,
        platform_mac BOOLEAN DEFAULT FALSE,
        platform_linux BOOLEAN DEFAULT FALSE,
        
        -- One-hot encoding untuk categories
        category_single_player BOOLEAN DEFAULT FALSE,
        category_multi_player BOOLEAN DEFAULT FALSE,
        category_coop BOOLEAN DEFAULT FALSE,
        category_online_pvp BOOLEAN DEFAULT FALSE,
        category_achievements BOOLEAN DEFAULT FALSE,
        category_cloud_saves BOOLEAN DEFAULT FALSE,
        category_trading_cards BOOLEAN DEFAULT FALSE,
        category_workshop BOOLEAN DEFAULT FALSE,
        category_vr_support BOOLEAN DEFAULT FALSE,
        category_controller_support BOOLEAN DEFAULT FALSE,
        
        -- Normalized numerical features
        normalized_review_score FLOAT DEFAULT 0,
        normalized_metacritic FLOAT DEFAULT 0,
        normalized_price FLOAT DEFAULT 0,
        normalized_required_age FLOAT DEFAULT 0,
        normalized_n_achievements FLOAT DEFAULT 0,
        normalized_positive_ratio FLOAT DEFAULT 0,
        
        -- Feature vector untuk cosine similarity
        feature_vector FLOAT[],
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (steam_appid) REFERENCES released_games(steam_appid)
      );
      
      CREATE INDEX idx_game_features_vector ON game_features USING GIN(feature_vector);
      CREATE INDEX idx_game_features_genres ON game_features (genre_action, genre_adventure, genre_rpg, genre_strategy);
      CREATE INDEX idx_game_features_platforms ON game_features (platform_windows, platform_mac, platform_linux);
    `;
    
    await client.query(createTableQuery);
    console.log('✅ game_features table created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function getMinMaxValues() {
  const client = await pool.connect();
  
  try {
    console.log('📊 Calculating min/max values for normalization...');
    
    const result = await client.query(`
      SELECT 
        MIN(review_score) as min_review, MAX(review_score) as max_review,
        MIN(metacritic) as min_metacritic, MAX(metacritic) as max_metacritic,
        MIN(price_initial_usd) as min_price, MAX(price_initial_usd) as max_price,
        MIN(required_age) as min_age, MAX(required_age) as max_age,
        MIN(n_achievements) as min_achievements, MAX(n_achievements) as max_achievements,
        MIN(positive_percentual) as min_positive, MAX(positive_percentual) as max_positive
      FROM released_games
      WHERE review_score IS NOT NULL AND metacritic IS NOT NULL
    `);
    
    const minMax = result.rows[0];
    console.log('📈 Min/Max values:', minMax);
    
    return minMax;
    
  } finally {
    client.release();
  }
}

function normalizeValue(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

function encodeGenres(genres: string[]): Record<string, boolean> {
  const encoded: Record<string, boolean> = {};
  
  // Initialize all genre fields to false
  const genreFields = [
    'genre_action', 'genre_adventure', 'genre_rpg', 'genre_strategy', 'genre_simulation',
    'genre_sports', 'genre_racing', 'genre_casual', 'genre_indie', 'genre_massively_multiplayer',
    'genre_free_to_play', 'genre_early_access', 'genre_mature', 'genre_puzzle', 'genre_shooter',
    'genre_horror', 'genre_survival', 'genre_open_world', 'genre_sandbox'
  ];
  
  genreFields.forEach(field => {
    encoded[field] = false;
  });
  
  // Set true for matching genres
  genres.forEach(genre => {
    const genreLower = genre.toLowerCase();
    
    // Map common genre variations to our standard fields
    if (genreLower.includes('action')) encoded.genre_action = true;
    if (genreLower.includes('adventure')) encoded.genre_adventure = true;
    if (genreLower.includes('rpg') || genreLower.includes('role-playing')) encoded.genre_rpg = true;
    if (genreLower.includes('strategy')) encoded.genre_strategy = true;
    if (genreLower.includes('simulation')) encoded.genre_simulation = true;
    if (genreLower.includes('sports')) encoded.genre_sports = true;
    if (genreLower.includes('racing')) encoded.genre_racing = true;
    if (genreLower.includes('casual')) encoded.genre_casual = true;
    if (genreLower.includes('indie')) encoded.genre_indie = true;
    if (genreLower.includes('massively multiplayer') || genreLower.includes('mmo')) encoded.genre_massively_multiplayer = true;
    if (genreLower.includes('free to play')) encoded.genre_free_to_play = true;
    if (genreLower.includes('early access')) encoded.genre_early_access = true;
    if (genreLower.includes('mature')) encoded.genre_mature = true;
    if (genreLower.includes('puzzle')) encoded.genre_puzzle = true;
    if (genreLower.includes('shooter')) encoded.genre_shooter = true;
    if (genreLower.includes('horror')) encoded.genre_horror = true;
    if (genreLower.includes('survival')) encoded.genre_survival = true;
    if (genreLower.includes('open world')) encoded.genre_open_world = true;
    if (genreLower.includes('sandbox')) encoded.genre_sandbox = true;
  });
  
  return encoded;
}

function encodePlatforms(platforms: string[]): Record<string, boolean> {
  return {
    platform_windows: platforms.some(p => p.toLowerCase().includes('windows')),
    platform_mac: platforms.some(p => p.toLowerCase().includes('mac')),
    platform_linux: platforms.some(p => p.toLowerCase().includes('linux'))
  };
}

function encodeCategories(categories: string[]): Record<string, boolean> {
  return {
    category_single_player: categories.some(c => c.toLowerCase().includes('single')),
    category_multi_player: categories.some(c => c.toLowerCase().includes('multi')),
    category_coop: categories.some(c => c.toLowerCase().includes('co-op')),
    category_online_pvp: categories.some(c => c.toLowerCase().includes('pvp')),
    category_achievements: categories.some(c => c.toLowerCase().includes('achievement')),
    category_cloud_saves: categories.some(c => c.toLowerCase().includes('cloud')),
    category_trading_cards: categories.some(c => c.toLowerCase().includes('trading')),
    category_workshop: categories.some(c => c.toLowerCase().includes('workshop')),
    category_vr_support: categories.some(c => c.toLowerCase().includes('vr')),
    category_controller_support: categories.some(c => c.toLowerCase().includes('controller') || c.toLowerCase().includes('gamepad'))
  };
}

function createFeatureVector(features: Record<string, any>): number[] {
  const vector: number[] = [];
  
  // Add genre features (19 features) - in predefined order for consistency
  const genreKeys = [
    'genre_action', 'genre_adventure', 'genre_rpg', 'genre_strategy', 'genre_simulation',
    'genre_sports', 'genre_racing', 'genre_casual', 'genre_indie', 'genre_massively_multiplayer',
    'genre_free_to_play', 'genre_early_access', 'genre_mature', 'genre_puzzle', 'genre_shooter',
    'genre_horror', 'genre_survival', 'genre_open_world', 'genre_sandbox'
  ];
  genreKeys.forEach(key => {
    vector.push(features[key] ? 1 : 0);
  });
  
  // Add platform features (3 features)
  const platformKeys = ['platform_windows', 'platform_mac', 'platform_linux'];
  platformKeys.forEach(key => {
    vector.push(features[key] ? 1 : 0);
  });
  
  // Add category features (10 features)
  const categoryKeys = [
    'category_single_player', 'category_multi_player', 'category_coop', 'category_online_pvp',
    'category_achievements', 'category_cloud_saves', 'category_trading_cards', 'category_workshop',
    'category_vr_support', 'category_controller_support'
  ];
  categoryKeys.forEach(key => {
    vector.push(features[key] ? 1 : 0);
  });
  
  // Add normalized numerical features (6 features)
  vector.push(features.normalized_review_score || 0);
  vector.push(features.normalized_metacritic || 0);
  vector.push(features.normalized_price || 0);
  vector.push(features.normalized_required_age || 0);
  vector.push(features.normalized_n_achievements || 0);
  vector.push(features.normalized_positive_ratio || 0);
  
  return vector;
}

async function processGames() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Processing games and creating features...');
    
    // Get min/max values for normalization
    const minMax = await getMinMaxValues();
    
    // Get all games
    const gamesResult = await client.query('SELECT * FROM released_games ORDER BY steam_appid');
    const games = gamesResult.rows;
    
    console.log(`📦 Processing ${games.length} games...`);
    
    // Process games in batches
    const batchSize = 100;
    for (let i = 0; i < games.length; i += batchSize) {
      const batch = games.slice(i, i + batchSize);
      
      for (const game of batch) {
        // Encode genres
        const genreFeatures = encodeGenres(game.genres || []);
        
        // Encode platforms
        const platformFeatures = encodePlatforms(game.platforms || []);
        
        // Encode categories
        const categoryFeatures = encodeCategories(game.categories || []);
        
        // Normalize numerical features
        const normalizedFeatures = {
          normalized_review_score: normalizeValue(game.review_score || 0, minMax.min_review, minMax.max_review),
          normalized_metacritic: normalizeValue(game.metacritic || 0, minMax.min_metacritic, minMax.max_metacritic),
          normalized_price: normalizeValue(game.price_initial_usd || 0, minMax.min_price, minMax.max_price),
          normalized_required_age: normalizeValue(game.required_age || 0, minMax.min_age, minMax.max_age),
          normalized_n_achievements: normalizeValue(game.n_achievements || 0, minMax.min_achievements, minMax.max_achievements),
          normalized_positive_ratio: normalizeValue(game.positive_percentual || 0, minMax.min_positive, minMax.max_positive)
        };
        
        // Combine all features
        const allFeatures = {
          ...genreFeatures,
          ...platformFeatures,
          ...categoryFeatures,
          ...normalizedFeatures
        } as any;
        
        // Create feature vector
        const featureVector = createFeatureVector(allFeatures);
        
        // Insert into game_features table
        const insertQuery = `
          INSERT INTO game_features (
            steam_appid, name,
            genre_action, genre_adventure, genre_rpg, genre_strategy, genre_simulation,
            genre_sports, genre_racing, genre_casual, genre_indie, genre_massively_multiplayer,
            genre_free_to_play, genre_early_access, genre_mature, genre_puzzle, genre_shooter,
            genre_horror, genre_survival, genre_open_world, genre_sandbox,
            platform_windows, platform_mac, platform_linux,
            category_single_player, category_multi_player, category_coop, category_online_pvp,
            category_achievements, category_cloud_saves, category_trading_cards, category_workshop,
            category_vr_support, category_controller_support,
            normalized_review_score, normalized_metacritic, normalized_price,
            normalized_required_age, normalized_n_achievements, normalized_positive_ratio,
            feature_vector
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41)
          ON CONFLICT (steam_appid) DO UPDATE SET
            name = EXCLUDED.name,
            genre_action = EXCLUDED.genre_action,
            genre_adventure = EXCLUDED.genre_adventure,
            genre_rpg = EXCLUDED.genre_rpg,
            genre_strategy = EXCLUDED.genre_strategy,
            genre_simulation = EXCLUDED.genre_simulation,
            genre_sports = EXCLUDED.genre_sports,
            genre_racing = EXCLUDED.genre_racing,
            genre_casual = EXCLUDED.genre_casual,
            genre_indie = EXCLUDED.genre_indie,
            genre_massively_multiplayer = EXCLUDED.genre_massively_multiplayer,
            genre_free_to_play = EXCLUDED.genre_free_to_play,
            genre_early_access = EXCLUDED.genre_early_access,
            genre_mature = EXCLUDED.genre_mature,
            genre_puzzle = EXCLUDED.genre_puzzle,
            genre_shooter = EXCLUDED.genre_shooter,
            genre_horror = EXCLUDED.genre_horror,
            genre_survival = EXCLUDED.genre_survival,
            genre_open_world = EXCLUDED.genre_open_world,
            genre_sandbox = EXCLUDED.genre_sandbox,
            platform_windows = EXCLUDED.platform_windows,
            platform_mac = EXCLUDED.platform_mac,
            platform_linux = EXCLUDED.platform_linux,
            category_single_player = EXCLUDED.category_single_player,
            category_multi_player = EXCLUDED.category_multi_player,
            category_coop = EXCLUDED.category_coop,
            category_online_pvp = EXCLUDED.category_online_pvp,
            category_achievements = EXCLUDED.category_achievements,
            category_cloud_saves = EXCLUDED.category_cloud_saves,
            category_trading_cards = EXCLUDED.category_trading_cards,
            category_workshop = EXCLUDED.category_workshop,
            category_vr_support = EXCLUDED.category_vr_support,
            category_controller_support = EXCLUDED.category_controller_support,
            normalized_review_score = EXCLUDED.normalized_review_score,
            normalized_metacritic = EXCLUDED.normalized_metacritic,
            normalized_price = EXCLUDED.normalized_price,
            normalized_required_age = EXCLUDED.normalized_required_age,
            normalized_n_achievements = EXCLUDED.normalized_n_achievements,
            normalized_positive_ratio = EXCLUDED.normalized_positive_ratio,
            feature_vector = EXCLUDED.feature_vector
        `;
        
        const values = [
          game.steam_appid, game.name,
          allFeatures.genre_action, allFeatures.genre_adventure, allFeatures.genre_rpg,
          allFeatures.genre_strategy, allFeatures.genre_simulation, allFeatures.genre_sports,
          allFeatures.genre_racing, allFeatures.genre_casual, allFeatures.genre_indie,
          allFeatures.genre_massively_multiplayer, allFeatures.genre_free_to_play,
          allFeatures.genre_early_access, allFeatures.genre_mature, allFeatures.genre_puzzle,
          allFeatures.genre_shooter, allFeatures.genre_horror, allFeatures.genre_survival,
          allFeatures.genre_open_world, allFeatures.genre_sandbox,
          allFeatures.platform_windows, allFeatures.platform_mac, allFeatures.platform_linux,
          allFeatures.category_single_player, allFeatures.category_multi_player,
          allFeatures.category_coop, allFeatures.category_online_pvp, allFeatures.category_achievements,
          allFeatures.category_cloud_saves, allFeatures.category_trading_cards,
          allFeatures.category_workshop, allFeatures.category_vr_support,
          allFeatures.category_controller_support,
          normalizedFeatures.normalized_review_score, normalizedFeatures.normalized_metacritic,
          normalizedFeatures.normalized_price, normalizedFeatures.normalized_required_age,
          normalizedFeatures.normalized_n_achievements, normalizedFeatures.normalized_positive_ratio,
          featureVector
        ];
        
        await client.query(insertQuery, values);
      }
      
      console.log(`✅ Processed ${Math.min(i + batchSize, games.length)}/${games.length} games`);
    }
    
    console.log('🎉 All games processed successfully!');
    
  } catch (error) {
    console.error('❌ Error processing games:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function createIndexes() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Creating additional indexes...');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_game_features_review_score ON game_features (normalized_review_score);
      CREATE INDEX IF NOT EXISTS idx_game_features_metacritic ON game_features (normalized_metacritic);
      CREATE INDEX IF NOT EXISTS idx_game_features_price ON game_features (normalized_price);
      CREATE INDEX IF NOT EXISTS idx_game_features_name ON game_features (name);
    `);
    
    console.log('✅ Indexes created successfully!');
    
  } finally {
    client.release();
  }
}

async function validateData() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Validating processed data...');
    
    const result = await client.query(`
      SELECT 
        COUNT(*) as total_games,
        AVG(array_length(feature_vector, 1)) as avg_vector_length,
        COUNT(CASE WHEN genre_action = true THEN 1 END) as action_games,
        COUNT(CASE WHEN platform_windows = true THEN 1 END) as windows_games,
        AVG(normalized_review_score) as avg_norm_review,
        AVG(normalized_metacritic) as avg_norm_metacritic
      FROM game_features
    `);
    
    const stats = result.rows[0];
    
    console.log('📊 Processing Statistics:');
    console.log(`   Total games processed: ${stats.total_games}`);
    console.log(`   Average vector length: ${stats.avg_vector_length}`);
    console.log(`   Action games: ${stats.action_games}`);
    console.log(`   Windows games: ${stats.windows_games}`);
    console.log(`   Average normalized review score: ${parseFloat(stats.avg_norm_review).toFixed(3)}`);
    console.log(`   Average normalized metacritic: ${parseFloat(stats.avg_norm_metacritic).toFixed(3)}`);
    
    // Sample some games
    const sampleResult = await client.query(`
      SELECT name, feature_vector[1:10] as sample_vector
      FROM game_features
      LIMIT 5
    `);
    
    console.log('\n📋 Sample games with feature vectors:');
    sampleResult.rows.forEach(row => {
      console.log(`   ${row.name}: [${row.sample_vector.slice(0, 5).join(', ')}...]`);
    });
    
  } finally {
    client.release();
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting Game Features Processing...\n');
    
    await createGameFeaturesTable();
    await processGames();
    await createIndexes();
    await validateData();
    
    console.log('\n🎉 Game Features Processing Complete!');
    console.log('✅ Table game_features created and populated');
    console.log('✅ Feature vectors generated for cosine similarity');
    console.log('✅ Indexes created for optimal query performance');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  main();
}

export {
  createGameFeaturesTable,
  processGames,
  createIndexes,
  validateData
}; 