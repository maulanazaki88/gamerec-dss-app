import { Pool } from 'pg';
import { GamesType } from '../models/games.model';

// PostgreSQL connection pool
let pool: Pool;

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Alternative configuration if using separate env variables
      // host: process.env.DB_HOST,
      // port: parseInt(process.env.DB_PORT),
      // database: process.env.DB_NAME,
      // user: process.env.DB_USER,
      // password: process.env.DB_PASSWORD,
      ssl: false, // Set to true if using SSL
      max: 10, // Maximum number of connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  
  return pool;
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await getPool().connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Get all games from released_games table
export const getAllGames = async (): Promise<GamesType[]> => {
  try {
    const client = await getPool().connect();
    const result = await client.query('SELECT * FROM released_games LIMIT 10');
    client.release();
    return result.rows as GamesType[];
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
};

// Get game suggestions based on partial name
export const getGameSuggestions = async (partial: string): Promise<string[]> => {
  try {
    const client = await getPool().connect();
    const result = await client.query(
      'SELECT name FROM released_games WHERE name ILIKE $1 ORDER BY name LIMIT 10',
      [`%${partial}%`]
    );
    client.release();
    return result.rows.map(row => row.name);
  } catch (error) {
    console.error('Error fetching game suggestions:', error);
    throw error;
  }
};

// Get specific games by names for recommendation processing
export const getGamesByNames = async (gameNames: string[]): Promise<GamesType[]> => {
  try {
    const client = await getPool().connect();
    const placeholders = gameNames.map((_, index) => `$${index + 1}`).join(', ');
    const result = await client.query(
      `SELECT * FROM released_games WHERE name IN (${placeholders})`,
      gameNames
    );
    client.release();
    return result.rows as GamesType[];
  } catch (error) {
    console.error('Error fetching games by names:', error);
    throw error;
  }
}; 