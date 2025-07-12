import Form from '../Form/Form'
import GamesItem from '../GamesItem/GamesItem'
import s from './LandingComp.module.css'
import React, { useState } from 'react'

interface RecommendationResult {
  name: string;
  similarity_score: number;
  steam_appid: string;
  genres: string[];
  categories: string[];
}

const LandingComp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (games: string[]) => {
    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const response = await fetch('/api/process-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ games }),
      });

      const data = await response.json();

      if (data.success) {
        setRecommendations(data.recommendations || []);
      } else {
        setError(data.message || 'Failed to get recommendations');
      }
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError('Failed to get recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={s.main}>
      <section className={s.formSection}>
        <Form onSubmit={handleFormSubmit} isLoading={isLoading} />
      </section>
      
      {error && (
        <section className={s.errorSection}>
          <div className={s.error}>
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        </section>
      )}

      {recommendations.length > 0 && (
        <section className={s.resultsSection}>
          <div className={s.results}>
            <h2>Recommended Games for You</h2>
            <div className={s.gameList}>
              {recommendations.map((game, index) => (
                <GamesItem
                  key={game.steam_appid || index}
                  name={game.name}
                  similarity_score={game.similarity_score}
                  genres={game.genres || []}
                  categories={game.categories || []}
                  steam_appid={game.steam_appid}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

export default LandingComp
