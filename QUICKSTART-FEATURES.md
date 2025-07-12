# 🚀 Quick Start: Game Features Indexing

Panduan cepat untuk membuat table `game_features` yang akan meningkatkan akurasi recommendation engine dengan **cosine similarity**.

## Step 1: Install Dependencies

```bash
npm install
```

Dependencies yang diperlukan sudah ditambahkan ke `package.json`:
- `dotenv` - untuk environment variables
- `tsx` - untuk menjalankan TypeScript scripts
- `@types/dotenv` - type definitions

## Step 2: Jalankan Indexing Script

```bash
npm run create-features
```

Script akan:
1. ✅ Membuat table `game_features` dengan schema lengkap
2. ✅ Melakukan one-hot encoding untuk genres, platforms, categories
3. ✅ Normalisasi numerical features (review score, metacritic, price, dll)
4. ✅ Generate feature vectors (38 dimensions) untuk cosine similarity
5. ✅ Membuat indexes untuk optimasi query performance

**Estimasi waktu:** 5-15 menit (tergantung jumlah games di database)

## Step 3: Validasi Hasil

```bash
npm run validate-features
```

Script akan menampilkan:
- 📊 Statistik data (total games, distribution genres, dll)
- 🎮 Sample games dengan feature vectors
- 🔢 Test cosine similarity antar games
- ✅ Konfirmasi bahwa semua berjalan dengan baik

## Step 4: Update Recommendation Engine (Optional)

Setelah table `game_features` berhasil dibuat, Anda bisa:

1. **Update API `/api/process-recommendation.ts`** untuk menggunakan:
   - Cosine similarity (lebih akurat dari Jaccard)
   - Feature vectors yang sudah di-preprocess
   - Query yang lebih optimal

2. **Implementasi caching** untuk recommendations

3. **A/B testing** perbandingan dengan algoritma lama

## Expected Output

### Success Create Features:
```
🚀 Starting Game Features Processing...

🔥 Creating game_features table...
✅ game_features table created successfully!

📊 Calculating min/max values for normalization...
🔄 Processing games and creating features...
✅ Processed 500/1000 games
✅ Processed 1000/1000 games
🎉 All games processed successfully!

🔍 Creating additional indexes...
✅ Indexes created successfully!

📊 Processing Statistics:
   Total games processed: 1000
   Average vector length: 38
   Action games: 250
   Windows games: 950

🎉 Game Features Processing Complete!
```

### Success Validation:
```
🔍 Validating game_features table...

📊 Game Features Statistics:
   Total games: 1000
   Average vector length: 38
   Action games: 250
   RPG games: 180
   Windows games: 950
   Avg normalized review: 0.742

🎮 Top 5 Games by Review Score:
1. Counter-Strike 2
   Genres: Action(true) RPG(false) Strategy(false)
   Scores: Review(0.978) Metacritic(0.850)
   Vector length: 38

🔢 Sample Cosine Similarity (Action Games):
1. Counter-Strike 2 ↔ CS:GO
   Similarity: 0.9234

✅ Validation completed successfully!
```

## Database Schema Created

Table `game_features` dengan:
- **38 features total:**
  - 19 genre features (one-hot encoded)
  - 3 platform features (one-hot encoded)
  - 10 category features (one-hot encoded)
  - 6 normalized numerical features
- **Feature vector array** untuk cosine similarity
- **Indexes** untuk optimasi query performance

## Troubleshooting

### ❌ Error: "Cannot find module 'dotenv'"
```bash
npm install dotenv @types/dotenv tsx
```

### ❌ Error: "Database connection failed"
- Pastikan PostgreSQL running
- Cek `.env.local` configuration
- Test dengan `npm run dev` lalu akses `/api/test-db`

### ❌ Error: "released_games table not found"
- Pastikan table name sesuai dengan database Anda
- Jika berbeda, update nama table di script

## Next Steps

1. **Jalankan indexing:** `npm run create-features`
2. **Validasi hasil:** `npm run validate-features`
3. **Test recommendation engine** dengan UI yang sudah ada
4. **Compare performance** sebelum dan sesudah optimization

---

📝 **Note:** Scripts ini membuat table `game_features` yang **tidak menggantikan** table `released_games` yang sudah ada. Keduanya akan digunakan bersama-sama untuk recommendation engine yang lebih akurat. 