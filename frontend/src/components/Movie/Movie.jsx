import { Link } from 'react-router-dom';
import './Movie.css';

function Movie({ movie, showActions = false, onLike, onDislike }) {
  // URL de base pour les images TMDB
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  // Image par défaut si pas de poster
  const defaultImage = '/path/to/default-movie-poster.jpg';

  const handleLike = (e) => {
    e.preventDefault(); // Empêcher la navigation du Link
    e.stopPropagation();
    if (onLike) {
      onLike(movie.id, e);
    }
  };

  const handleDislike = (e) => {
    e.preventDefault(); // Empêcher la navigation du Link
    e.stopPropagation();
    if (onDislike) {
      onDislike(movie.id, e);
    }
  };

  return (
    <Link to={`/movie/${movie.id}`} className="movie-link">
      <div className="movie-item">
        <img
          src={
            movie.poster_path
              ? `${IMAGE_BASE_URL}${movie.poster_path}`
              : defaultImage
          }
          alt={movie.title}
          className="movie-poster"
          onError={(e) => {
            e.target.src = defaultImage;
          }}
        />

        <div className="movie-info">
          <h3>{movie.title}</h3>

          {movie.release_date && (
            <p>Sortie : {new Date(movie.release_date).getFullYear()}</p>
          )}

          {movie.vote_average && (
            <p className="movie-rating">
              ⭐ {movie.vote_average.toFixed(1)}/10
            </p>
          )}

          {movie.vote_count && (
            <p className="movie-vote_count">{movie.vote_count} votes</p>
          )}

          {movie.overview && <p className="movie-overview">{movie.overview}</p>}

          {showActions && (
            <div className="movie-actions">
              <button
                className="like-button"
                onClick={handleLike}
                title="J'aime ce film"
              >
                👍 J'aime
              </button>
              <button
                className="dislike-button"
                onClick={handleDislike}
                title="Je n'aime pas ce film"
              >
                👎 Je n'aime pas
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default Movie;
