// Utility untuk generate deskripsi game berdasarkan genre dan kategori
export const generateGameDescription = (
  gameName: string,
  genres: string[] = [],
  categories: string[] = [],
  similarityScore: number
): string => {
  const score = (similarityScore * 100).toFixed(1);
  
  // Deskripsi berdasarkan genre utama
  const genreDescriptions: Record<string, string> = {
    'Action': 'An intense action game that delivers thrilling combat and fast-paced gameplay.',
    'Adventure': 'An immersive adventure that takes you on an epic journey filled with discovery.',
    'RPG': 'A rich role-playing experience with deep character development and engaging storytelling.',
    'Strategy': 'A strategic masterpiece that challenges your tactical thinking and planning skills.',
    'Simulation': 'A detailed simulation that offers realistic gameplay and authentic experiences.',
    'Sports': 'An exciting sports experience that captures the thrill of competition.',
    'Racing': 'A high-speed racing adventure with stunning visuals and realistic driving mechanics.',
    'Casual': 'A fun and accessible game perfect for quick gaming sessions.',
    'Indie': 'An innovative indie title that brings fresh ideas and unique gameplay mechanics.',
    'Puzzle': 'A mind-bending puzzle game that will challenge your problem-solving skills.',
    'Shooter': 'An action-packed shooter with precise controls and engaging combat systems.',
    'Horror': 'A spine-chilling horror experience that will keep you on the edge of your seat.',
    'Survival': 'A challenging survival game where resource management and strategy are key.',
    'Multiplayer': 'A social gaming experience designed for playing with friends and online communities.'
  };
  
  // Pilih deskripsi berdasarkan genre pertama
  let baseDescription = '';
  if (genres.length > 0) {
    const primaryGenre = genres[0];
    baseDescription = genreDescriptions[primaryGenre] || 
      `An engaging ${primaryGenre.toLowerCase()} game that offers unique gameplay experiences.`;
  } else {
    baseDescription = 'An exciting gaming experience that offers engaging gameplay and entertainment.';
  }
  
  // Tambahkan informasi tentang multiplayer jika ada
  const hasMultiplayer = categories.some(cat => 
    cat.toLowerCase().includes('multi') || 
    cat.toLowerCase().includes('co-op') || 
    cat.toLowerCase().includes('pvp')
  );
  
  if (hasMultiplayer && !baseDescription.includes('multiplayer')) {
    baseDescription += ' Features multiplayer gameplay for shared experiences.';
  }
  
  // Tambahkan compatibility score
  const compatibilityText = score >= '80' ? 'Highly recommended' : 
                           score >= '60' ? 'Recommended' : 
                           'Suggested';
  
  return `${baseDescription} ${compatibilityText} based on your gaming preferences (${score}% match).`;
};

// Deskripsi alternatif untuk game-game populer
export const popularGameDescriptions: Record<string, string> = {
  // Monster Hunter Series
  'Monster Hunter 4': 'Monster Hunter 4 is the second game in the aforementioned series to be released on the Nintendo 3DS. Many updates and improvements have been made that set this sequel apart.',
  'Monster Hunter Generations Ultimate': 'An enhanced version of Monster Hunter Generations. It features new monsters, hunting styles, and the more challenging G-Rank quests.',
  'Monster Hunter Stories': 'Monster Hunter Stories is a role-playing game spin-off of the popular Monster Hunter franchise, but features a drastically different gameplay focus.',
  'Monster Hunter Stories 2: Wings of Ruin': 'Monster Hunter Stories 2: Wings of Ruin offers both RPG and Monster Hunter fans a unique new experience with a drastically different gameplay focus.',
  
  // Popular Action Games
  'Dark Souls': 'Prepare to die in this challenging action RPG that revolutionized the genre with its unforgiving difficulty and intricate world design.',
  'Elden Ring': 'An open-world action RPG from FromSoftware that combines their signature challenging gameplay with expansive exploration.',
  'The Witcher 3': 'An epic fantasy RPG featuring Geralt of Rivia in a massive open world filled with meaningful choices and consequences.',
  
  // Popular Strategy Games
  'Civilization VI': 'Build an empire that will stand the test of time in this turn-based strategy masterpiece.',
  'Total War': 'Command vast armies in epic real-time battles while managing your empire in detailed turn-based campaign.',
  
  // Add more as needed...
};

// Function untuk mendapatkan deskripsi game
export const getGameDescription = (
  gameName: string,
  genres: string[] = [],
  categories: string[] = [],
  similarityScore: number
): string => {
  // Cek apakah ada deskripsi khusus untuk game ini
  if (popularGameDescriptions[gameName]) {
    return popularGameDescriptions[gameName];
  }
  
  // Generate deskripsi berdasarkan genre dan kategori
  return generateGameDescription(gameName, genres, categories, similarityScore);
}; 