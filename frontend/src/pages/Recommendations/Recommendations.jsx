import React from 'react';
import './Recommendations.css';
import { useRecommendations } from '../../useRecommendations';
import Movie from '../../components/Movie/Movie';

const Recommendations = () => {
  const { recommendations, isLoading, error, fetchRecommendations } =
    useRecommendations();

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h1>Recommandations pour vous</h1>
        <p className="recommendations-subtitle">
          Découvrez des films sélectionnés selon vos goûts
        </p>
        <button
          onClick={fetchRecommendations}
          className="refresh-button"
          disabled={isLoading}
        >
          {isLoading ? 'Actualisation...' : 'Actualiser les recommandations'}
        </button>
      </div>

      <div className="recommendations-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Génération de vos recommandations personnalisées...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <h2>Erreur</h2>
            <p>{error}</p>
            <button onClick={fetchRecommendations} className="retry-button">
              Réessayer
            </button>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="recommendations-grid">
            {recommendations.map((movie) => (
              <div key={movie.id} className="recommendation-item">
                <Movie movie={movie} showActions={false} />
              </div>
            ))}
          </div>
        ) : (
          <div className="no-recommendations">
            <div className="no-recommendations-content">
              <h2>Aucune recommandation disponible</h2>
              <p>
                Pour recevoir des recommandations personnalisées, commencez par
                noter quelques films dans la section "Films".
              </p>
              <p>
                Plus vous noterez de films, plus nos recommandations seront
                précises !
              </p>
              <a href="/movies" className="explore-button">
                Explorer les films
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
