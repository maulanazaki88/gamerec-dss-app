// CREATE TABLE games (
//     steam_appid VARCHAR(20) PRIMARY KEY,
//     name TEXT NOT NULL,
//     developers TEXT[],
//     publishers TEXT[],
//     categories TEXT[],
//     genres TEXT[],
//     required_age INTEGER CHECK (required_age >= 0 AND required_age <= 21),
//     n_achievements INTEGER CHECK (n_achievements >= 0),
//     platforms TEXT[],
//     release_date DATE NOT NULL,
//     additional_content TEXT[],
//     total_reviews INTEGER CHECK (total_reviews >= 0),
//     total_positive INTEGER CHECK (total_positive >= 0),
//     total_negative INTEGER CHECK (total_negative >= 0),
//     review_score FLOAT CHECK (review_score >= 0 AND review_score <= 100),
//     review_score_desc TEXT,
//     positive_percentual FLOAT CHECK (positive_percentual >= 0 AND positive_percentual <= 100),
//     metacritic INTEGER CHECK (metacritic >= 0 AND metacritic <= 100),
//     is_free BOOLEAN,
//     price_initial_usd NUMERIC(10,2) CHECK (price_initial_usd >= 0),
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// create game type according to table
export type GamesType = {
    steam_appid: string;
    name: string;
    developers: string[];
    publishers: string[];
    categories: string[];
    genres: string[];
    required_age: number;
    n_achievements: number;
    platforms: string[];
    release_date: string; // ISO date string
    additional_content: string[];
    total_reviews: number;
    total_positive: number;
    total_negative: number;
    review_score: number;
    review_score_desc: string;
    positive_percentual: number;
    metacritic: number;
    is_free: boolean;
    price_initial_usd: number;
    created_at: string; // ISO timestamp string
}