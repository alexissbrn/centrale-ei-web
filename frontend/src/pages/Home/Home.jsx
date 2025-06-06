import React, { useCallback, useEffect, useState } from 'react';
import './Home.css';
import { useFetchMovies } from './useFetchMovies';
import Movie from '../../components/Movie/Movie.jsx';

function Home() {
  const [movieName, setMovieName] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [debouncedMovieName, setDebouncedMovieName] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const moviesPerPage = 30;

  const { movies, moviesloading, movieserrror, fetchMovies } = useFetchMovies(
    sortOption,
    debouncedMovieName
  );

  const startIndex = currentPage * moviesPerPage;
  const endIndex = startIndex + moviesPerPage;
  const moviesToDisplay = movies.slice(startIndex, endIndex);

  // Debounce pour éviter trop de requêtes pendant la frappe
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMovieName(movieName);
    }, 500);

    return () => clearTimeout(timer);
  }, [movieName]);

  // Fonction memoized pour gérer le changement dans l'input de recherche
  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    setMovieName(value);
  }, []);

  // Fonction memoized pour gérer le changement de tri
  const handleSortChange = useCallback((event) => {
    const value = event.target.value;
    setSortOption(value);
  }, []);

  // Fonction pour empêcher la soumission du formulaire
  const handleFormSubmit = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>PIMP MY FILM</h1>

        {/* Formulaire de recherche */}
        <form onSubmit={handleFormSubmit}>
          <input
            type="text"
            placeholder="Rechercher un film..."
            value={movieName}
            onChange={handleSearchChange}
          />
        </form>

        {/* Sélecteur de tri optionnel */}
        <div className="sort-section">
          <label className="sort-label" htmlFor="sort-select">
            Trier par :
          </label>
          <select
            id="sort-select"
            className="sort-select"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="default">Popularité</option>
            <option value="alphabetical">A → Z</option>
            <option value="alphabetical_reverse">Z → A</option>
            <option value="vote_average">Meilleures notes</option>
            <option value="vote_count">Plus de votes</option>
            <option value="release_date">Plus récents</option>
          </select>
        </div>

        {/* Indicateur de frappe */}
        {movieName !== debouncedMovieName && movieName.length > 0 && (
          <div className="typing-indicator">
            <p>En cours de frappe... La recherche se lancera automatiquement</p>
          </div>
        )}
      </header>

      <main className="movies-list">
        {moviesloading ? (
          <p>Chargement des films...</p>
        ) : movieserrror ? (
          <div className="error-container">
            <h2>Erreur</h2>
            <p>{movieserrror}</p>
            <button onClick={fetchMovies} type="button">
              Réessayer
            </button>
          </div>
        ) : movies.length > 0 ? (
          moviesToDisplay.map((movie) => <Movie key={movie.id} movie={movie} />)
        ) : (
          <div className="no-results">
            {debouncedMovieName ? (
              <>
                <p>
                  Aucun film trouvé dans la base de données pour "
                  {debouncedMovieName}"
                </p>
                <p>
                  Essayez un autre terme de recherche ou vérifiez l'orthographe
                </p>
              </>
            ) : (
              <p>Aucun film disponible avec ces critères</p>
            )}
          </div>
        )}
      </main>
      <div>
        <button
          className="prev-button"
          disabled={currentPage === 0}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Précédent
        </button>
        <span className="current-page">Page {currentPage}</span>
        <button
          className="next-button"
          disabled={endIndex >= movies.length}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

export default Home;
