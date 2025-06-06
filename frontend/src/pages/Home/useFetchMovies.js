import { useEffect, useState } from 'react';
import axios from 'axios';

export function useFetchMovies(sortOption = 'default', globalSearchQuery = '') {
  const [movies, setMovies] = useState([]);
  const [moviesloading, setMoviesLoading] = useState(false);
  const [movieserrror, setMoviesError] = useState(null);

  // URL du backend depuis les variables d'environnement
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  // Fonction pour convertir le tri en paramètres pour votre API backend
  const getSortParams = (option) => {
    switch (option) {
      case 'release_date':
        return {
          sortBy: 'release_date',
          sortOrder: 'DESC',
          limit: 200,
        };

      case 'vote_average':
        return {
          sortBy: 'vote_average',
          sortOrder: 'DESC',
          minRating: 1, // Films avec au moins une note
          limit: 200,
        };

      case 'vote_count':
        return {
          sortBy: 'vote_count',
          sortOrder: 'DESC',
          limit: 200,
        };

      case 'popularity':
        return {
          sortBy: 'popularity',
          sortOrder: 'DESC',
          limit: 200,
        };

      case 'alphabetical':
        return {
          sortBy: 'title',
          sortOrder: 'ASC',
          limit: 200,
        };

      case 'alphabetical_reverse':
        return {
          sortBy: 'title',
          sortOrder: 'DESC',
          limit: 200,
        };

      default: // 'default' = par popularité
        return {
          sortBy: 'popularity',
          sortOrder: 'DESC',
          limit: 200,
        };
    }
  };

  // Fonction pour récupérer les films depuis votre backend
  const fetchMovies = async () => {
    setMoviesError(null);
    setMoviesLoading(true);

    try {
      console.log(`Récupération des films avec tri: ${sortOption}`);

      // Obtenir les paramètres de tri
      const sortParams = getSortParams(sortOption);
      console.log(`Paramètres de tri:`, sortParams);

      // Faire la requête vers votre backend
      const response = await axios.get(`${BACKEND_URL}/movies`, {
        params: sortParams,
        timeout: 30000, // 30 secondes de timeout
      });

      // Vérifier la réponse
      if (response.data && response.data.movies) {
        setMovies(response.data.movies);
        console.log(
          `${response.data.movies.length} films récupérés depuis le backend`
        );

        // Afficher les infos de pagination si disponibles
        if (response.data.pagination) {
          console.log(`Pagination:`, response.data.pagination);
        }
      } else {
        throw new Error('Format de réponse invalide du backend');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des films:', err);

      // Messages d'erreur plus explicites
      if (err.code === 'ECONNREFUSED') {
        setMoviesError(
          "Impossible de se connecter au serveur backend. Vérifiez qu'il est démarré."
        );
      } else if (err.response?.status === 404) {
        setMoviesError(
          'Endpoint non trouvé. Vérifiez que la route /movies existe.'
        );
      } else if (err.response?.status >= 500) {
        setMoviesError(
          'Erreur serveur backend. Consultez les logs du serveur.'
        );
      } else if (err.response?.data?.error) {
        setMoviesError(`Erreur backend: ${err.response.data.error}`);
      } else {
        setMoviesError(
          err.message || 'Erreur inconnue lors de la récupération des films'
        );
      }
    } finally {
      setMoviesLoading(false);
    }
  };

  // Fonction pour récupérer les films populaires (route spécialisée)
  const fetchPopularMovies = async () => {
    setMoviesError(null);
    setMoviesLoading(true);

    try {
      console.log('Récupération des films populaires');

      const response = await axios.get(`${BACKEND_URL}/movies/popular`, {
        params: { limit: 200 },
        timeout: 30000,
      });

      if (response.data && response.data.movies) {
        setMovies(response.data.movies);
        console.log(
          `${response.data.movies.length} films populaires récupérés`
        );
      }
    } catch (err) {
      console.error('Erreur films populaires:', err);
      setMoviesError(err.response?.data?.error || err.message);
    } finally {
      setMoviesLoading(false);
    }
  };

  // Fonction pour récupérer les films les mieux notés (route spécialisée)
  const fetchTopRatedMovies = async () => {
    setMoviesError(null);
    setMoviesLoading(true);

    try {
      console.log('Récupération des films les mieux notés');

      const response = await axios.get(`${BACKEND_URL}/movies/top-rated`, {
        params: { limit: 200 },
        timeout: 30000,
      });

      if (response.data && response.data.movies) {
        setMovies(response.data.movies);
        console.log(`${response.data.movies.length} films top-rated récupérés`);
      }
    } catch (err) {
      console.error('Erreur films top-rated:', err);
      setMoviesError(err.response?.data?.error || err.message);
    } finally {
      setMoviesLoading(false);
    }
  };

  // Fonction pour récupérer les films récents (route spécialisée)
  const fetchRecentMovies = async () => {
    setMoviesError(null);
    setMoviesLoading(true);

    try {
      console.log('Récupération des films récents');

      const response = await axios.get(`${BACKEND_URL}/movies/recent`, {
        params: { limit: 200 },
        timeout: 30000,
      });

      if (response.data && response.data.movies) {
        setMovies(response.data.movies);
        console.log(`${response.data.movies.length} films récents récupérés`);
      }
    } catch (err) {
      console.error('Erreur films récents:', err);
      setMoviesError(err.response?.data?.error || err.message);
    } finally {
      setMoviesLoading(false);
    }
  };

  // Fonction de recherche de films dans toute la BDD
  const searchMovies = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim() === '') {
      return fetchMovies(); // Retour à la liste normale si pas de recherche
    }

    setMoviesError(null);
    setMoviesLoading(true);

    try {
      console.log(`Recherche dans toute la BDD: "${searchQuery}"`);

      // Recherche paginée pour récupérer tous les résultats
      const allSearchResults = [];
      let currentPage = 1;
      let hasMorePages = true;
      const maxResultsPerPage = 100; // Limite par page pour éviter les timeouts

      while (hasMorePages) {
        console.log(`Recherche page ${currentPage}...`);

        const response = await axios.get(`${BACKEND_URL}/movies/search`, {
          params: {
            q: searchQuery.trim(),
            limit: maxResultsPerPage,
            page: currentPage,
          },
          timeout: 30000,
        });

        if (response.data && response.data.movies) {
          const moviesFromThisPage = response.data.movies;
          allSearchResults.push(...moviesFromThisPage);

          console.log(
            `Page ${currentPage}: ${moviesFromThisPage.length} films trouvés`
          );
          console.log(`Total cumulé: ${allSearchResults.length} films`);

          // Vérifier s'il y a encore des pages
          const pagination = response.data.pagination;
          if (pagination) {
            hasMorePages =
              pagination.hasNextPage && currentPage < pagination.totalPages;
            console.log(
              `Pagination: page ${pagination.currentPage}/${pagination.totalPages}, hasNext: ${pagination.hasNextPage}`
            );
          } else {
            // Si pas de pagination dans la réponse, on suppose qu'il n'y a qu'une page
            hasMorePages = false;
          }

          currentPage++;

          // Sécurité: limiter à 50 pages max pour éviter les boucles infinies
          if (currentPage > 50) {
            console.warn('Limite de 50 pages atteinte, arrêt de la recherche');
            hasMorePages = false;
          }

          // Petite pause entre les requêtes pour ne pas surcharger le serveur
          if (hasMorePages) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        } else {
          hasMorePages = false;
        }
      }

      setMovies(allSearchResults);
      console.log(
        `Recherche terminée: ${allSearchResults.length} films trouvés au total pour "${searchQuery}"`
      );
    } catch (err) {
      console.error('Erreur recherche complète:', err);
      setMoviesError(err.response?.data?.error || err.message);
    } finally {
      setMoviesLoading(false);
    }
  };

  // Fonction principale qui gère à la fois le tri et la recherche
  const fetchData = async () => {
    // Si on a une recherche globale, on l'exécute
    if (globalSearchQuery && globalSearchQuery.trim() !== '') {
      return searchMovies(globalSearchQuery);
    }

    // Sinon, on récupère les films selon le tri
    return executeSearch();
  };

  // Choisir la fonction appropriée selon le type de tri
  const executeSearch = () => {
    switch (sortOption) {
      case 'popular':
        return fetchPopularMovies();
      case 'top_rated':
        return fetchTopRatedMovies();
      case 'recent':
        return fetchRecentMovies();
      default:
        return fetchMovies();
    }
  };

  // Lancer la récupération au chargement et quand le tri ou la recherche change
  useEffect(() => {
    fetchData();
  }, [sortOption, globalSearchQuery]);

  // Retourner les données et fonctions utiles
  return {
    movies,
    moviesloading,
    movieserrror,
    fetchMovies,
    fetchPopularMovies,
    fetchTopRatedMovies,
    fetchRecentMovies,
    searchMovies, // Recherche manuelle dans toute la BDD
    // Pour compatibilité avec l'ancien code
    refetch: fetchData, // Utilise fetchData au lieu de fetchMovies
    // Statistiques utiles pour debug
    get moviesCount() {
      return movies.length;
    },
    // Fonction pour rafraîchir selon les paramètres actuels
    refresh: fetchData,
  };
}
