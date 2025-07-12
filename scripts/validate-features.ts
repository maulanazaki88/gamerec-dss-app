import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

async function validateFeatures() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Validating game_features table...\n');
    
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'game_features'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ game_features table does not exist');
      console.log('💡 Run: npm run create-features');
      return;
    }
    
    // Get basic statistics
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_games,
        AVG(array_length(feature_vector, 1)) as avg_vector_length,
        COUNT(CASE WHEN genre_action = true THEN 1 END) as action_games,
        COUNT(CASE WHEN genre_rpg = true THEN 1 END) as rpg_games,
        COUNT(CASE WHEN platform_windows = true THEN 1 END) as windows_games,
        AVG(normalized_review_score) as avg_norm_review,
        AVG(normalized_metacritic) as avg_norm_metacritic,
        MIN(normalized_review_score) as min_review,
        MAX(normalized_review_score) as max_review
      FROM game_features
    `);
    
    const data = stats.rows[0];
    
    console.log('📊 Game Features Statistics:');
    console.log(`   Total games: ${data.total_games}`);
    console.log(`   Average vector length: ${data.avg_vector_length}`);
    console.log(`   Action games: ${data.action_games}`);
    console.log(`   RPG games: ${data.rpg_games}`);
    console.log(`   Windows games: ${data.windows_games}`);
    console.log(`   Avg normalized review: ${parseFloat(data.avg_norm_review).toFixed(3)}`);
    console.log(`   Avg normalized metacritic: ${parseFloat(data.avg_norm_metacritic).toFixed(3)}`);
    console.log(`   Review score range: ${parseFloat(data.min_review).toFixed(3)} - ${parseFloat(data.max_review).toFixed(3)}`);
    
    // Sample some games
    const samples = await client.query(`
      SELECT name, 
             genre_action, genre_rpg, genre_strategy,
             platform_windows, platform_mac,
             normalized_review_score, normalized_metacritic,
             array_length(feature_vector, 1) as vector_length
      FROM game_features
      ORDER BY normalized_review_score DESC
      LIMIT 5
    `);
    
    console.log('\n🎮 Top 5 Games by Review Score:');
    samples.rows.forEach((game, index) => {
      console.log(`${index + 1}. ${game.name}`);
      console.log(`   Genres: Action(${game.genre_action}) RPG(${game.genre_rpg}) Strategy(${game.genre_strategy})`);
      console.log(`   Platforms: Win(${game.platform_windows}) Mac(${game.platform_mac})`);
      console.log(`   Scores: Review(${game.normalized_review_score?.toFixed(3)}) Metacritic(${game.normalized_metacritic?.toFixed(3)})`);
      console.log(`   Vector length: ${game.vector_length}`);
      console.log('');
    });
    
    // Test vector similarity
    const testSimilarity = await client.query(`
      SELECT 
        a.name as game_a,
        b.name as game_b,
        (
          SELECT 
            (SELECT sum(a_val * b_val) FROM unnest(a.feature_vector, b.feature_vector) AS t(a_val, b_val)) / 
            (sqrt((SELECT sum(a_val * a_val) FROM unnest(a.feature_vector) AS t(a_val))) * 
             sqrt((SELECT sum(b_val * b_val) FROM unnest(b.feature_vector) AS t(b_val))))
        ) as cosine_similarity
      FROM game_features a, game_features b
      WHERE a.steam_appid != b.steam_appid
        AND a.genre_action = true 
        AND b.genre_action = true
      ORDER BY cosine_similarity DESC
      LIMIT 3
    `);
    
    console.log('🔢 Sample Cosine Similarity (Action Games):');
    testSimilarity.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.game_a} ↔ ${row.game_b}`);
      console.log(`   Similarity: ${parseFloat(row.cosine_similarity).toFixed(4)}`);
    });
    
    console.log('\n✅ Validation completed successfully!');
    
  } catch (error) {
    console.error('❌ Validation error:', error);
  } finally {
    client.release();
  }
}

// Main execution
async function main() {
  try {
    await validateFeatures();
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