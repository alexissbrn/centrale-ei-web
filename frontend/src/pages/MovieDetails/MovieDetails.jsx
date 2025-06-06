import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './MovieDetails.css';
import './Buttons.css';

function MovieDetails() {
  const { id: movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [genres, setGenres] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour les boutons like/dislike
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [ratingError, setRatingError] = useState(null);

  // URL du backend
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

  // Ajout du style dynamique pour les animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 0.8;
        }
        50% {
          transform: scale(1.1);
          opacity: 1;
        }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes thumbsUpSuccess {
        0%, 100% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.3) rotate(5deg); }
        50% { transform: scale(1.2) rotate(-5deg); }
        75% { transform: scale(1.1) rotate(3deg); }
      }
      
      @keyframes thumbsDownSuccess {
        0%, 100% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.3) rotate(-8deg); }
        50% { transform: scale(1.2) rotate(8deg); }
        75% { transform: scale(1.1) rotate(-5deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Récupération des genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        console.log('Récupération des genres...');
        const response = await axios.get(`${BACKEND_URL}/genres`, {
          timeout: 10000,
        });

        if (response.data && response.data.genres) {
          const genresMap = {};
          response.data.genres.forEach((genre) => {
            genresMap[genre.tmdb_id] = genre.name;
          });
          setGenres(genresMap);
          console.log('Genres récupérés:', genresMap);
        }
      } catch (genreError) {
        console.error('Erreur lors de la récupération des genres:', genreError);
      }
    };

    fetchGenres();
  }, [BACKEND_URL]);

  // Récupération du rating depuis la base de données
  const fetchMovieRating = async (currentMovieId) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/movies/${currentMovieId}/rating`,
        {
          timeout: 10000,
        }
      );

      if (response.data && response.data.success) {
        const rating = response.data.data.likedislike || 0;
        setIsLiked(rating === 1);
        setIsDisliked(rating === -1);

        // Synchroniser avec localStorage pour compatibilité
        syncLocalStorageWithRating(currentMovieId, rating);

        console.log(`Rating récupéré pour le film ${currentMovieId}:`, rating);

        return rating;
      }
    } catch (apiError) {
      console.error('Erreur lors de la récupération du rating:', apiError);
      // Fallback sur localStorage si l'API échoue
      loadRatingFromLocalStorage(currentMovieId);

      return null;
    }
  };

  // Synchroniser localStorage avec le rating de la base de données
  const syncLocalStorageWithRating = (currentMovieId, rating) => {
    const likedMovies = JSON.parse(localStorage.getItem('likedMovies') || '[]');
    const dislikedMovies = JSON.parse(
      localStorage.getItem('dislikedMovies') || '[]'
    );
    const movieIdNum = parseInt(currentMovieId);

    // Nettoyer les anciens états
    const updatedLikes = likedMovies.filter((id) => id !== movieIdNum);
    const updatedDislikes = dislikedMovies.filter((id) => id !== movieIdNum);

    // Ajouter le nouvel état selon le rating
    if (rating === 1) {
      updatedLikes.push(movieIdNum);
    } else if (rating === -1) {
      updatedDislikes.push(movieIdNum);
    }

    localStorage.setItem('likedMovies', JSON.stringify(updatedLikes));
    localStorage.setItem('dislikedMovies', JSON.stringify(updatedDislikes));
  };

  // Charger le rating depuis localStorage (fallback)
  const loadRatingFromLocalStorage = (currentMovieId) => {
    const likedMovies = JSON.parse(localStorage.getItem('likedMovies') || '[]');
    const dislikedMovies = JSON.parse(
      localStorage.getItem('dislikedMovies') || '[]'
    );
    const movieIdNum = parseInt(currentMovieId);

    setIsLiked(likedMovies.includes(movieIdNum));
    setIsDisliked(dislikedMovies.includes(movieIdNum));
  };

  // Récupération des détails du film ET de son rating
  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`Récupération des détails du film ID: ${movieId}`);

        // Récupérer les détails du film
        const response = await axios.get(`${BACKEND_URL}/movies/${movieId}`, {
          timeout: 30000,
        });

        if (response.data && response.data.movie) {
          setMovie(response.data.movie);

          // Récupérer le rating depuis la base de données
          await fetchMovieRating(movieId);

          console.log('Détails du film récupérés:', response.data.movie);
        } else {
          throw new Error('Film non trouvé');
        }
      } catch (fetchError) {
        console.error('Erreur lors de la récupération du film:', fetchError);

        if (fetchError.response?.status === 404) {
          setError('Film non trouvé');
        } else if (fetchError.response?.status >= 500) {
          setError('Erreur serveur');
        } else {
          setError('Erreur lors du chargement du film');
        }
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId, BACKEND_URL]);

  // Fonction pour obtenir le nom d'un genre par son ID
  const getGenreName = (genreId) => {
    return genres[genreId] || `Genre ${genreId}`;
  };

  // Fonction pour déterminer si la note est élevée
  const isHighRating = (rating) => {
    return rating && rating >= 8.0;
  };

  // Fonction pour formater les votes
  const formatVotes = (votes) => {
    if (!votes) {
      return '0 votes';
    }

    if (votes >= 1000000) {
      return `${(votes / 1000000).toFixed(1)}M votes`;
    } else if (votes >= 1000) {
      return `${(votes / 1000).toFixed(1)}k votes`;
    }

    return `${votes.toLocaleString()} votes`;
  };

  // Fonction pour formater la popularité
  const formatPopularity = (popularity) => {
    if (!popularity) {
      return 'N/A';
    }

    return `${popularity.toFixed(0)} pts`;
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Date inconnue';
    }

    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Fonction pour formater la durée
  const formatRuntime = (minutes) => {
    if (!minutes) {
      return 'Durée inconnue';
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours}h ${mins}min`;
  };

  // Fonction pour mettre à jour le rating via l'API
  const updateMovieRating = async (rating) => {
    try {
      const response = await axios.patch(
        `${BACKEND_URL}/movies/${movieId}/rating`,
        { likedislike: rating },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.data && response.data.success) {
        console.log(`Rating mis à jour: ${rating}`, response.data);
        // Synchroniser localStorage
        syncLocalStorageWithRating(movieId, rating);

        return { success: true };
      } else {
        throw new Error('Réponse API invalide');
      }
    } catch (apiError) {
      console.error('Erreur lors de la mise à jour du rating:', apiError);

      let errorMessage = 'Erreur de connexion';
      if (apiError.response) {
        errorMessage =
          apiError.response.data.message ||
          apiError.response.data.error ||
          'Erreur serveur';
      } else if (apiError.request) {
        errorMessage = 'Impossible de joindre le serveur';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // Fonction pour gérer le like/unlike avec API
  const handleLike = async () => {
    if (!movie || likeLoading) {
      return;
    }

    setLikeLoading(true);
    setRatingError(null);

    try {
      let targetRating;

      if (isLiked) {
        // Si déjà liké, retirer le like (neutre = 0)
        targetRating = 0;
      } else {
        // Sinon, liker (= 1)
        targetRating = 1;
      }

      const result = await updateMovieRating(targetRating);

      if (result.success) {
        // Mettre à jour les états locaux
        if (targetRating === 0) {
          setIsLiked(false);
        } else {
          setIsLiked(true);
          setIsDisliked(false); // Retirer le dislike si présent
        }

        console.log('Like/Unlike réussi');
      } else {
        setRatingError(result.error || 'Erreur lors de la mise à jour');
        console.error('Erreur API like:', result.error);
      }
    } catch (error) {
      setRatingError('Erreur inattendue');
      console.error('Erreur lors du like:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  // Fonction pour gérer le dislike avec API
  const handleDislike = async () => {
    if (!movie) {
      return;
    }

    setRatingError(null);

    try {
      let targetRating;

      if (isDisliked) {
        // Si déjà disliké, retirer le dislike (neutre = 0)
        targetRating = 0;
      } else {
        // Sinon, disliker (= -1)
        targetRating = -1;
      }

      const result = await updateMovieRating(targetRating);

      if (result.success) {
        // Mettre à jour les états locaux
        if (targetRating === 0) {
          setIsDisliked(false);
        } else {
          setIsDisliked(true);
          setIsLiked(false); // Retirer le like si présent
        }

        console.log('Dislike/Un-dislike réussi');
      } else {
        setRatingError(result.error || 'Erreur lors de la mise à jour');
        console.error('Erreur API dislike:', result.error);
      }
    } catch (error) {
      setRatingError('Erreur inattendue');
      console.error('Erreur lors du dislike:', error);
    }
  };

  if (loading) {
    return (
      <div className="movie-details-container">
        <div className="loading-container">
          <p>Chargement des détails du film...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-details-container">
        <div className="error-container">
          <h2>Erreur</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate(-1)} type="button">
              Retour
            </button>
            <Link to="/" className="home-link">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-details-container">
        <div className="error-container">
          <h2>Film non trouvé</h2>
          <Link to="/" className="home-link">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-details-container">
      {/* Image de fond */}
      {movie.backdrop_path && (
        <div
          className="movie-backdrop"
          style={{
            backgroundImage: `url(${BACKDROP_BASE_URL}${movie.backdrop_path})`,
          }}
        />
      )}

      {/* Navigation */}
      <div className="movie-nav">
        <button onClick={() => navigate(-1)} className="back-btn">
          Retour
        </button>
        <Link to="/" className="home-link">
          Accueil
        </Link>
      </div>

      {/* Contenu principal */}
      <div className="movie-details-content">
        <div className="movie-header">
          {/* Poster */}
          <div className="movie-poster-container">
            <img
              src={
                movie.poster_path
                  ? `${IMAGE_BASE_URL}${movie.poster_path}`
                  : '/default-poster.jpg'
              }
              alt={movie.title}
              className="movie-poster-large"
            />
          </div>

          {/* Informations principales */}
          <div className="movie-main-info">
            <div className="movie-title-section">
              <h1 className="movie-title">{movie.title}</h1>

              <div className="movie-actions">
                {/* Bouton Like */}
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  className={`futuristic-btn like-btn ${
                    isLiked ? 'active' : ''
                  } ${likeLoading ? 'loading' : ''}`}
                  title={
                    isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'
                  }
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                </button>

                {/* Bouton Dislike */}
                <button
                  onClick={handleDislike}
                  className={`futuristic-btn dislike-btn ${
                    isDisliked ? 'active' : ''
                  }`}
                  title={isDisliked ? 'Retirer le dislike' : "Je n'aime pas"}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3zm7-13h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" />
                  </svg>
                </button>
              </div>

              {/* Affichage des erreurs de rating */}
              {ratingError && (
                <div
                  className="rating-error"
                  style={{
                    color: '#ff4757',
                    fontSize: '14px',
                    marginTop: '10px',
                    padding: '8px 12px',
                    background: 'rgba(255, 71, 87, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 71, 87, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>⚠️</span>
                  <span>{ratingError}</span>
                  <button
                    onClick={() => setRatingError(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ff4757',
                      cursor: 'pointer',
                      marginLeft: 'auto',
                      fontSize: '16px',
                    }}
                    title="Fermer"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {movie.original_title && movie.original_title !== movie.title && (
              <h2 className="movie-original-title">({movie.original_title})</h2>
            )}

            <div className="movie-meta">
              <span className="movie-year meta-tag">
                Date: {formatDate(movie.release_date)}
              </span>

              {movie.runtime && (
                <span className="movie-runtime meta-tag">
                  Durée: {formatRuntime(movie.runtime)}
                </span>
              )}

              {movie.vote_average && (
                <span
                  className={`movie-rating meta-tag ${
                    isHighRating(movie.vote_average) ? 'high-rating' : ''
                  }`}
                >
                  Note: {movie.vote_average}/10
                </span>
              )}

              {movie.vote_count && (
                <span className="movie-votes meta-tag">
                  {formatVotes(movie.vote_count)}
                </span>
              )}

              {movie.popularity && (
                <span className="movie-popularity meta-tag">
                  Pop: {formatPopularity(movie.popularity)}
                </span>
              )}
            </div>

            {/* Genres - avec noms réels */}
            {movie.genre_ids && movie.genre_ids.length > 0 && (
              <div className="movie-genres">
                <h4 className="genres-title">GENRES:</h4>
                <div className="genres-list">
                  {movie.genre_ids.map((genreId) => (
                    <span key={genreId} className="genre-tag">
                      {getGenreName(genreId).toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Synopsis */}
            {movie.overview && (
              <div className="movie-overview-section">
                <h3>Synopsis</h3>
                <p className="movie-overview-full">{movie.overview}</p>
              </div>
            )}
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="movie-details-grid">
          {/* Informations générales */}
          <div className="detail-section">
            <h3>Informations générales</h3>
            <div className="detail-list">
              <p>
                <strong>ID:</strong> {movie.id}
              </p>
              <p>
                <strong>Type de média:</strong> {movie.media_type || 'Film'}
              </p>
              <p>
                <strong>ID TMDB:</strong> {movie.tmdb_id}
              </p>
              <p>
                <strong>Langue originale:</strong> {movie.original_language}
              </p>
              <p>
                <strong>Popularité:</strong>{' '}
                {movie.popularity?.toFixed(1) || 'N/A'}
              </p>
            </div>
          </div>

          {/* Statistiques */}
          <div className="detail-section">
            <h3>Statistiques</h3>
            <div className="detail-list">
              <p>
                <strong>Note moyenne:</strong> {movie.vote_average}/10
              </p>
              <p>
                <strong>Nombre de votes:</strong>{' '}
                {movie.vote_count?.toLocaleString()}
              </p>
              <p>
                <strong>Popularité:</strong> {movie.popularity}
              </p>
            </div>
          </div>

          {/* Informations techniques */}
          <div className="detail-section">
            <h3>Détails techniques</h3>
            <div className="detail-list">
              <p>
                <strong>Poster:</strong>{' '}
                {movie.poster_path ? 'Disponible' : 'Non disponible'}
              </p>
              <p>
                <strong>Image de fond:</strong>{' '}
                {movie.backdrop_path ? 'Disponible' : 'Non disponible'}
              </p>
              {movie.runtime && (
                <p>
                  <strong>Durée:</strong> {movie.runtime} minutes
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
