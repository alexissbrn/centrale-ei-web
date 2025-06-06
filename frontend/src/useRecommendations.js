import { useEffect, useState } from 'react';
import axios from 'axios';

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/recommendations`
      );

      if (response.data.success) {
        setRecommendations(response.data.movies);
      } else {
        throw new Error('Erreur lors de la récupération des recommandations');
      }
    } catch (err) {
      console.error('Erreur recommendations:', err);
      setError(err.response?.data?.error || 'Erreur de connexion');
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const likeMovie = async (movieId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/movies/${movieId}/like`
      );
      // Rafraîchir les recommandations après un like
      setTimeout(fetchRecommendations, 500);
    } catch (err) {
      console.error('Erreur like:', err);
    }
  };

  const dislikeMovie = async (movieId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/movies/${movieId}/dislike`
      );
      // Rafraîchir les recommandations après un dislike
      setTimeout(fetchRecommendations, 500);
    } catch (err) {
      console.error('Erreur dislike:', err);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return {
    recommendations,
    isLoading,
    error,
    fetchRecommendations,
    likeMovie,
    dislikeMovie,
  };
};
