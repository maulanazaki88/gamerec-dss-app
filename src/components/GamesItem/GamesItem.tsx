import React from 'react'
import s from './GamesItem.module.css'
import { getGameDescription } from './GameDescriptions'

interface GamesItemProps {
  name: string;
  description?: string;
  similarity_score: number;
  genres?: string[];
  categories?: string[];
  steam_appid?: string;
}

const GamesItem: React.FC<GamesItemProps> = ({
  name,
  description,
  similarity_score,
  genres = [],
  categories = [],
  steam_appid
}) => {
  return (
    <div className={s.gameCard}>
      <div className={s.gameImagePlaceholder}>
        <div className={s.placeholderIcon}>🎮</div>
      </div>
      
      <div className={s.gameContent}>
        <h3 className={s.gameTitle}>{name}</h3>
        
        <p className={s.gameDescription}>
          {description || getGameDescription(name, genres, categories, similarity_score)}
        </p>
        
        {genres.length > 0 && (
          <div className={s.gameGenres}>
            <span className={s.genreLabel}>Genres:</span>
            <div className={s.genreList}>
              {genres.slice(0, 3).map((genre, index) => (
                <span key={index} className={s.genreTag}>
                  {genre}
                </span>
              ))}
              {genres.length > 3 && (
                <span className={s.genreTag}>+{genres.length - 3}</span>
              )}
            </div>
          </div>
        )}
        
        {categories.length > 0 && (
          <div className={s.gameCategories}>
            <span className={s.categoryLabel}>Categories:</span>
            <div className={s.categoryList}>
              {categories.slice(0, 2).map((category, index) => (
                <span key={index} className={s.categoryTag}>
                  {category}
                </span>
              ))}
              {categories.length > 2 && (
                <span className={s.categoryTag}>+{categories.length - 2}</span>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className={s.gameScore}>
        <div className={s.scoreValue}>
          {(similarity_score * 100).toFixed(1)}
        </div>
        <div className={s.scoreLabel}>Match %</div>
      </div>
    </div>
  )
}

export default GamesItem
