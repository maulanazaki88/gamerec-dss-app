import React from 'react';
import GamesItem from '../components/GamesItem/GamesItem';

// Mock data untuk demo
const mockGames = [
  {
    name: "Monster Hunter 4",
    steam_appid: "582010",
    similarity_score: 0.952,
    genres: ["Action", "RPG", "Adventure"],
    categories: ["Single-player", "Multi-player", "Co-op"]
  },
  {
    name: "Monster Hunter Generations Ultimate",
    steam_appid: "695130",
    similarity_score: 0.883,
    genres: ["Action", "RPG"],
    categories: ["Single-player", "Multi-player", "Co-op", "Online PvP"]
  },
  {
    name: "Monster Hunter Stories",
    steam_appid: "504230",
    similarity_score: 0.726,
    genres: ["RPG", "Adventure", "Casual"],
    categories: ["Single-player", "Steam Achievements"]
  },
  {
    name: "Dark Souls III",
    steam_appid: "374320",
    similarity_score: 0.654,
    genres: ["Action", "RPG"],
    categories: ["Single-player", "Multi-player", "Online PvP", "Steam Achievements"]
  },
  {
    name: "The Witcher 3: Wild Hunt",
    steam_appid: "292030",
    similarity_score: 0.587,
    genres: ["RPG", "Adventure", "Open World"],
    categories: ["Single-player", "Steam Achievements", "Steam Cloud"]
  },
  {
    name: "Civilization VI",
    steam_appid: "289070",
    similarity_score: 0.423,
    genres: ["Strategy", "Simulation"],
    categories: ["Single-player", "Multi-player", "Online PvP", "Steam Workshop"]
  },
  {
    name: "Counter-Strike 2",
    steam_appid: "730",
    similarity_score: 0.312,
    genres: ["Action", "Shooter"],
    categories: ["Multi-player", "Online PvP", "Steam Achievements", "Steam Trading Cards"]
  }
];

const DemoGamesPage: React.FC = () => {
  return (
    <div style={{ 
      padding: '40px 20px', 
      backgroundColor: '#f5f6fa',
      minHeight: '100vh'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          color: '#2c3e50',
          marginBottom: '30px',
          fontSize: '2.5rem'
        }}>
          🎮 Games Item Component Demo
        </h1>
        
        <p style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '40px',
          fontSize: '1.1rem'
        }}>
          Berikut adalah contoh tampilan komponen GamesItem dengan berbagai jenis game dan similarity score.
        </p>

        <div style={{ marginBottom: '20px' }}>
          {mockGames.map((game, index) => (
            <GamesItem
              key={game.steam_appid}
              name={game.name}
              similarity_score={game.similarity_score}
              genres={game.genres}
              categories={game.categories}
              steam_appid={game.steam_appid}
            />
          ))}
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Features Demo:</h3>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            color: '#666',
            lineHeight: '1.6'
          }}>
            <li>✅ Responsive design (coba resize browser)</li>
            <li>✅ Dynamic descriptions berdasarkan genre</li>
            <li>✅ Similarity score dengan color coding</li>
            <li>✅ Genre dan category tags</li>
            <li>✅ Hover effects dan animations</li>
            <li>✅ Game image placeholder dengan gradient</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DemoGamesPage; 