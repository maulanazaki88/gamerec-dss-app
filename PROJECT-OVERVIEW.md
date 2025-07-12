# GameRec Overview

## Deskripsi
GameRec adalah game recomendation engine yang bekerja dengan cara melakukan perhitungan Content-Based Filtering dengan similarity metrics. User akan menginputkan beberapa nama game yang terdapat pada database, kemudian engine akan memberikan daftar game yang memiliki kecocokan dengan preferensi user.

### Konsep Implementasi Content-Based Filtering
- **No User Profile**: Setiap request adalah independent, tidak ada penyimpanan preferensi user
- **Pure Content-Based**: Rekomendasi murni berdasarkan similarity antara 3 game input dengan game lain di database
- **Learning Focus**: Fokus pada implementasi algoritma similarity dan vector operations

### Similarity Metrics
- **Jaccard Similarity**: Untuk mengukur kemiripan fitur kategorikal (genre, platform, kategori)
- **Normalized Numerical Similarity**: Untuk fitur numerik (review score, price)
- **Weighted Combination**: Kombinasi berbobot dari berbagai jenis similarity
- **Fallback Algorithms**: Algoritma cadangan untuk edge cases dan robustness

## Arsitektur
- Framework: Next Js 14.2.48 Page Router
- Database: PostgreSQL
- Backend: TypeScript/Node.js untuk proses encoding

## Workflow
1. User menginputkan 3 nama game yang ada pada database, ketika user mulai menginputkan nama game, akan diberikan daftar nama game yang ada pada database.

2. Ketika user melakukan submit, pada backend akan mulai dilakukan perhitungan, pada UI akan ditampilkan animasi loading.

3. Backend akan menerima data dari user berupa nama games, dan akan melakukan perhitungan:
   - Ekstraksi fitur dari 3 game input (genres, categories, platforms, review scores, prices)
   - Hitung Jaccard similarity untuk fitur kategorikal dan normalized similarity untuk fitur numerik
   - Kombinasi weighted similarity dengan semua game di database (exclude 3 game input)
   - Implementasi fallback algorithms untuk edge cases
   - Return top-5 game dengan similarity tertinggi

## Proses Pengembangan Aplikasi
1. Mencari database game pada kaggle, kemudian diimport ke postgreSQL database
2. Menerapkan indexing agar dapat dilakukan vector search
3. Membuat logic backend dengan TypeScript/Node.js
4. Mengembangkan ui pada frontend 

## Database Schema

### Table Games (Original)
```
CREATE TABLE games (
    steam_appid VARCHAR(20) PRIMARY KEY,
    name TEXT NOT NULL,
    developers TEXT[],
    publishers TEXT[],
    categories TEXT[],
    genres TEXT[],
    required_age INTEGER CHECK (required_age >= 0 AND required_age <= 21),
    n_achievements INTEGER CHECK (n_achievements >= 0),
    platforms TEXT[],
    release_date DATE NOT NULL,
    additional_content TEXT[],
    total_reviews INTEGER CHECK (total_reviews >= 0),
    total_positive INTEGER CHECK (total_positive >= 0),
    total_negative INTEGER CHECK (total_negative >= 0),
    review_score FLOAT CHECK (review_score >= 0 AND review_score <= 100),
    review_score_desc TEXT,
    positive_percentual FLOAT CHECK (positive_percentual >= 0 AND positive_percentual <= 100),
    metacritic INTEGER CHECK (metacritic >= 0 AND metacritic <= 100),
    is_free BOOLEAN,
    price_initial_usd NUMERIC(10,2) CHECK (price_initial_usd >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table Game Features (One-Hot Encoding)
```
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
    
    -- One-hot encoding untuk platforms
    platform_windows BOOLEAN DEFAULT FALSE,
    platform_mac BOOLEAN DEFAULT FALSE,
    platform_linux BOOLEAN DEFAULT FALSE,
    
    -- One-hot encoding untuk categories
    category_single_player BOOLEAN DEFAULT FALSE,
    category_multi_player BOOLEAN DEFAULT FALSE,
    category_coop BOOLEAN DEFAULT FALSE,
    category_online_pvp BOOLEAN DEFAULT FALSE,
    category_cloud_saves BOOLEAN DEFAULT FALSE,
    category_achievements BOOLEAN DEFAULT FALSE,
    category_trading_cards BOOLEAN DEFAULT FALSE,
    category_workshop BOOLEAN DEFAULT FALSE,
    category_vr_support BOOLEAN DEFAULT FALSE,
    
    -- Features numerik (normalized)
    normalized_review_score FLOAT,
    normalized_metacritic FLOAT,
    normalized_price FLOAT,
    normalized_required_age FLOAT,
    normalized_n_achievements FLOAT,
    
    -- Vector representation untuk optimasi
    feature_vector REAL[],
    
    FOREIGN KEY (steam_appid) REFERENCES games(steam_appid)
);
```

## Proses Similarity Processing
1. **Real-time Feature Extraction**: Ekstraksi fitur langsung dari raw data saat runtime
2. **Dynamic Similarity Calculation**: Perhitungan similarity on-the-fly tanpa preprocessing
3. **Jaccard Operations**: Implementasi Jaccard similarity untuk array operations
4. **Normalization**: Dynamic normalization untuk fitur numerik berdasarkan range aktual

## Similarity Calculation

### Algoritma Utama: Weighted Jaccard + Normalized Numerical Similarity

#### 1. Jaccard Similarity untuk Fitur Kategorikal
```
Jaccard(A, B) = |A ∩ B| / |A ∪ B|
```
- **Genre Similarity**: Mengukur overlap genre antara user games dan kandidat
- **Category Similarity**: Mengukur overlap kategori (Single-player, Multi-player, dll)
- **Platform Similarity**: Mengukur overlap platform (Windows, Mac, Linux)

#### 2. Normalized Numerical Similarity
- **Review Score Similarity**: `1 - |avgUserReview - candidateReview| / 100`
- **Price Similarity**: Menggunakan normalized price difference dengan handling khusus:
  - Kedua gratis: similarity = 1.0
  - Salah satu gratis: similarity = 0.3
  - Keduanya berbayar: `1 - priceDiff / maxPrice`

#### 3. Weighted Combination
```
Total Similarity = 
  Genre_Similarity × 0.40 +      // Genre paling penting
  Category_Similarity × 0.25 +    // Kategori gameplay
  Platform_Similarity × 0.15 +    // Kompatibilitas platform
  Review_Similarity × 0.15 +      // Kualitas review
  Price_Similarity × 0.05         // Faktor harga
```

#### 4. Fallback Algorithms
- **Simplified Genre Matching**: Jika similarity utama = 0, gunakan algoritma sederhana berbasis genre
- **Random Fallback**: Jika semua similarity = 0, berikan skor random (10-50%)
- **NaN Safety**: Comprehensive checks untuk mencegah NaN dalam hasil

#### 5. Preprocessing & Safety
- **String Normalization**: Lowercase dan trim untuk matching yang robust
- **Null/Undefined Handling**: Safety checks di setiap tahap perhitungan
- **Bounded Results**: Semua similarity dibatasi antara 0-1

## Tinjauan Pustaka Project Serupa
[Quantic Foundry - Game Recommendation Engine](https://apps.quanticfoundry.com/recommendations/gamerprofile/videogame/)