# Database Indexing Scripts

Scripts untuk membuat dan mengelola table `game_features` yang berisi one-hot encoding dan feature vectors untuk recommendation engine.

## Prerequisites

1. **Install dependencies tambahan:**
   ```bash
   npm install dotenv tsx @types/dotenv
   ```

2. **Pastikan database PostgreSQL sudah running** dan `.env.local` sudah dikonfigurasi:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/steam_games
   ```

3. **Pastikan table `released_games` sudah ada** dan berisi data game.

## Scripts Available

### 1. Create Game Features (`create-game-features.ts`)

**Fungsi:**
- Membuat table `game_features` dengan one-hot encoding
- Melakukan normalisasi numerical features
- Generate feature vectors untuk cosine similarity
- Membuat indexes untuk optimasi query

**Menjalankan:**
```bash
npm run create-features
```

**Proses yang dilakukan:**
1. 🔥 Membuat table `game_features` (drop jika sudah ada)
2. 📊 Menghitung min/max values untuk normalisasi
3. 🔄 Memproses semua games dalam batches
4. 🔍 Membuat indexes untuk optimasi
5. 📋 Validasi hasil processing

**Estimasi waktu:** 5-15 menit (tergantung jumlah games)

### 2. Validate Features (`validate-features.ts`)

**Fungsi:**
- Validasi table `game_features`
- Menampilkan statistik data
- Test cosine similarity
- Sample games dengan feature vectors

**Menjalankan:**
```bash
npm run validate-features
```

## Output yang Diharapkan

### Create Features Success:
```
🚀 Starting Game Features Processing...

🔥 Creating game_features table...
✅ game_features table created successfully!

📊 Calculating min/max values for normalization...
📈 Min/Max values: { min_review: 0, max_review: 100, ... }

🔄 Processing games and creating features...
✅ Processed 100/1000 games
✅ Processed 200/1000 games
...
✅ Processed 1000/1000 games
🎉 All games processed successfully!

🔍 Creating additional indexes...
✅ Indexes created successfully!

📊 Processing Statistics:
   Total games processed: 1000
   Average vector length: 38
   Action games: 250
   Windows games: 950
   Average normalized review score: 0.742
   Average normalized metacritic: 0.678

🎉 Game Features Processing Complete!
```

### Validate Features Success:
```
🔍 Validating game_features table...

📊 Game Features Statistics:
   Total games: 1000
   Average vector length: 38
   Action games: 250
   RPG games: 180
   Windows games: 950
   Avg normalized review: 0.742
   Avg normalized metacritic: 0.678
   Review score range: 0.000 - 1.000

🎮 Top 5 Games by Review Score:
1. Counter-Strike 2
   Genres: Action(true) RPG(false) Strategy(false)
   Platforms: Win(true) Mac(false)
   Scores: Review(0.978) Metacritic(0.850)
   Vector length: 38

🔢 Sample Cosine Similarity (Action Games):
1. Counter-Strike 2 ↔ CS:GO
   Similarity: 0.9234

✅ Validation completed successfully!
```

## Troubleshooting

### Error: "Cannot find module 'dotenv'"
```bash
npm install dotenv @types/dotenv tsx
```

### Error: "game_features table does not exist"
```bash
npm run create-features
```

### Error: "Database connection failed"
- Pastikan PostgreSQL running
- Cek konfigurasi `.env.local`
- Pastikan database `steam_games` ada

### Error: "Some games were not found"
- Pastikan table `released_games` ada dan berisi data
- Cek nama table di database (mungkin berbeda dari `released_games`)

## Database Schema

Table `game_features` yang dibuat:

```sql
CREATE TABLE game_features (
  steam_appid VARCHAR(20) PRIMARY KEY,
  name TEXT NOT NULL,
  
  -- One-hot encoded genres (19 fields)
  genre_action BOOLEAN DEFAULT FALSE,
  genre_adventure BOOLEAN DEFAULT FALSE,
  genre_rpg BOOLEAN DEFAULT FALSE,
  -- ... more genres
  
  -- One-hot encoded platforms (3 fields)
  platform_windows BOOLEAN DEFAULT FALSE,
  platform_mac BOOLEAN DEFAULT FALSE,
  platform_linux BOOLEAN DEFAULT FALSE,
  
  -- One-hot encoded categories (10 fields)
  category_single_player BOOLEAN DEFAULT FALSE,
  category_multi_player BOOLEAN DEFAULT FALSE,
  -- ... more categories
  
  -- Normalized numerical features (6 fields)
  normalized_review_score FLOAT DEFAULT 0,
  normalized_metacritic FLOAT DEFAULT 0,
  normalized_price FLOAT DEFAULT 0,
  normalized_required_age FLOAT DEFAULT 0,
  normalized_n_achievements FLOAT DEFAULT 0,
  normalized_positive_ratio FLOAT DEFAULT 0,
  
  -- Feature vector for cosine similarity
  feature_vector FLOAT[],
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (steam_appid) REFERENCES released_games(steam_appid)
);
```

## Performance

- **Vector length:** 38 features total
- **Indexes:** Otomatis dibuat untuk optimasi query
- **Similarity calculation:** Menggunakan PostgreSQL built-in functions
- **Memory usage:** Optimized dengan batching dan connection pooling

## Next Steps

Setelah berhasil membuat `game_features`:

1. **Update recommendation engine** untuk menggunakan cosine similarity
2. **Implementasi caching** untuk recommendations
3. **A/B testing** perbandingan dengan algoritma lama
4. **Monitoring performance** query recommendations 