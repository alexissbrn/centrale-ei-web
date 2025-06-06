import express from 'express';
import { appDataSource } from '../datasource.js';

const router = express.Router();

// Fonction pour parser les genre_ids JSON/CSV
const parseGenreIds = (genreIdsStr) => {
  try {
    if (!genreIdsStr) {
      return [];
    }

    // Si c'est déjà un tableau, le retourner
    if (Array.isArray(genreIdsStr)) {
      return genreIdsStr;
    }

    // Si c'est une chaîne, essayer de parser
    let parsed;

    // Essayer JSON d'abord
    try {
      parsed = JSON.parse(genreIdsStr);
      if (Array.isArray(parsed)) {
        return parsed.map((id) => Number(id));
      }
    } catch (e) {
      // Si JSON échoue, essayer CSV (comma-separated)
      parsed = genreIdsStr
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id));
    }

    return parsed;
  } catch (error) {
    console.error('Erreur parsing genre_ids:', genreIdsStr, error);

    return [];
  }
};

// Fonction pour calculer les scores des genres
const calculateGenreScores = async () => {
  const movieRepository = appDataSource.getRepository('Movie');
  const genreRepository = appDataSource.getRepository('Genre');

  try {
    console.log('🔍 Calcul des scores de genres...');

    // Récupérer tous les genres
    const genres = await genreRepository.find();
    console.log(`📊 Genres trouvés: ${genres.length}`);

    // Initialiser les scores avec tmdb_id comme clé
    const genreScores = {};
    genres.forEach((genre) => {
      genreScores[genre.tmdb_id] = {
        id: genre.tmdb_id,
        name: genre.name || '',
        score: 0,
      };
    });

    // Récupérer les films aimés (likedislike = 1)
    const likedMovies = await movieRepository.find({
      where: { likedislike: 1 },
      select: ['id', 'genre_ids', 'title'],
    });

    // Récupérer les films non aimés (likedislike = -1)
    const dislikedMovies = await movieRepository.find({
      where: { likedislike: -1 },
      select: ['id', 'genre_ids', 'title'],
    });

    console.log(`👍 Films aimés: ${likedMovies.length}`);
    console.log(`👎 Films non aimés: ${dislikedMovies.length}`);

    // Calculer les scores pour les films aimés
    likedMovies.forEach((movie) => {
      const genreIds = parseGenreIds(movie.genre_ids);
      console.log(`👍 "${movie.title}" - Genres: [${genreIds.join(', ')}]`);

      genreIds.forEach((genreId) => {
        if (genreScores[genreId]) {
          genreScores[genreId].score += 1;
          console.log(
            `  ✅ Genre ${genreId} (${genreScores[genreId].name}): +1 → ${genreScores[genreId].score}`
          );
        }
      });
    });

    // Calculer les scores pour les films non aimés
    dislikedMovies.forEach((movie) => {
      const genreIds = parseGenreIds(movie.genre_ids);
      console.log(`👎 "${movie.title}" - Genres: [${genreIds.join(', ')}]`);

      genreIds.forEach((genreId) => {
        if (genreScores[genreId]) {
          genreScores[genreId].score -= 1;
          console.log(
            `  ❌ Genre ${genreId} (${genreScores[genreId].name}): -1 → ${genreScores[genreId].score}`
          );
        }
      });
    });

    // Afficher le résumé des scores
    const sortedScores = Object.values(genreScores)
      .filter((genre) => genre.score !== 0)
      .sort((a, b) => b.score - a.score);

    console.log('📈 Scores des genres:');
    sortedScores.forEach((genre) => {
      console.log(`  ${genre.name} (${genre.id}): ${genre.score}`);
    });

    return genreScores;
  } catch (error) {
    console.error('❌ Erreur calcul scores genres:', error);
    throw error;
  }
};

// Fonction pour calculer le score de recommandation d'un film
const calculateMovieScore = (movie, genreScores) => {
  const movieGenres = parseGenreIds(movie.genre_ids);
  let totalScore = 0;
  let likedGenresCount = 0;
  let dislikedGenresCount = 0;

  const genreDetails = [];

  movieGenres.forEach((genreId) => {
    if (genreScores[genreId]) {
      const genreScore = genreScores[genreId].score;
      totalScore += genreScore;

      if (genreScore > 0) {
        likedGenresCount++;
      } else if (genreScore < 0) {
        dislikedGenresCount++;
      }

      genreDetails.push({
        id: genreId,
        name: genreScores[genreId].name,
        score: genreScore,
      });
    }
  });

  // Score final pondéré :
  // - Score total des genres (importance des préférences)
  // - Bonus pour nombre de genres aimés (diversité positive)
  // - Malus pour genres détestés (éviter les contenus non aimés)
  // - Popularité normalisée (facteur de départage)

  const genreScore = totalScore;
  const diversityBonus = likedGenresCount * 2; // Bonus pour diversité des genres aimés
  const diversityMalus = dislikedGenresCount * -3; // Malus plus fort pour genres détestés
  const popularityScore = (movie.popularity || 0) / 100; // Normaliser popularité

  const finalScore =
    genreScore + diversityBonus + diversityMalus + popularityScore;

  return {
    finalScore,
    genreScore,
    likedGenresCount,
    dislikedGenresCount,
    diversityBonus,
    diversityMalus,
    popularityScore,
    genreDetails,
  };
};

// GET /recommendations - Obtenir les recommandations
router.get('/recommendations', async (req, res) => {
  try {
    console.log('🎬 Génération des recommandations pondérées...');

    const movieRepository = appDataSource.getRepository('Movie');
    const genreScores = await calculateGenreScores();

    // Vérifier s'il y a des préférences
    const hasPreferences = Object.values(genreScores).some(
      (genre) => genre.score !== 0
    );

    if (!hasPreferences) {
      console.log('📊 Aucune préférence → Films populaires');
      // Pas de préférences, retourner les films populaires
      const movies = await movieRepository
        .createQueryBuilder('movie')
        .where('movie.popularity > :popularity', { popularity: 10.0 })
        .orderBy('movie.popularity', 'DESC')
        .addOrderBy('movie.vote_count', 'DESC')
        .limit(12)
        .getMany();

      return res.json({
        success: true,
        movies: movies,
        total: movies.length,
        algorithm: 'popularity-based',
        message: 'Recommandations basées sur la popularité',
      });
    }

    console.log('🎯 Algorithme basé sur les préférences pondérées...');

    // Récupérer tous les films candidats (non déjà aimés)
    const candidateMovies = await movieRepository
      .createQueryBuilder('movie')
      .where(
        '(movie.likedislike IS NULL OR movie.likedislike = 0 OR movie.likedislike = -1)'
      )
      .andWhere('movie.popularity > :minPopularity', { minPopularity: 1.0 }) // Seuil minimum
      .getMany();

    console.log(`🎬 Films candidats: ${candidateMovies.length}`);

    // Calculer le score pour chaque film
    const scoredMovies = candidateMovies
      .map((movie) => {
        const scoreData = calculateMovieScore(movie, genreScores);

        return {
          ...movie,
          ...scoreData,
        };
      })
      .filter((movie) => movie.finalScore > 0); // Garder seulement les films avec score positif

    // Trier par score final décroissant
    scoredMovies.sort((a, b) => b.finalScore - a.finalScore);

    // Prendre les 12 meilleurs
    const recommendedMovies = scoredMovies.slice(0, 12);

    // Logs détaillés des recommandations
    console.log('🏆 Films recommandés (par score décroissant):');
    recommendedMovies.forEach((movie, index) => {
      console.log(
        `  ${index + 1}. "${movie.title}" (Score: ${movie.finalScore.toFixed(
          2
        )})`
      );
      console.log(`     - Score genres: ${movie.genreScore}`);
      console.log(`     - Genres aimés: ${movie.likedGenresCount}`);
      console.log(`     - Genres détestés: ${movie.dislikedGenresCount}`);
      console.log(`     - Popularité: ${movie.popularityScore.toFixed(2)}`);
      console.log(
        `     - Genres: ${movie.genreDetails
          .map((g) => `${g.name}(${g.score})`)
          .join(', ')}`
      );
    });

    // Si pas assez de films avec score positif, compléter avec populaires
    if (recommendedMovies.length < 12) {
      console.log(
        `📊 Complément avec films populaires (${
          12 - recommendedMovies.length
        } films)...`
      );

      const existingIds = recommendedMovies.map((m) => m.id);
      const additionalMovies = await movieRepository
        .createQueryBuilder('movie')
        .where('movie.popularity > :popularity', { popularity: 10.0 })
        .andWhere('movie.id NOT IN (:...existingIds)', {
          existingIds: existingIds.length > 0 ? existingIds : [0],
        })
        .orderBy('movie.popularity', 'DESC')
        .limit(12 - recommendedMovies.length)
        .getMany();

      // Ajouter les films populaires sans les données de score
      const completeRecommendations = [
        ...recommendedMovies,
        ...additionalMovies.map((movie) => ({
          ...movie,
          finalScore: movie.popularity / 100,
          algorithm: 'popularity-fallback',
        })),
      ];

      return res.json({
        success: true,
        movies: completeRecommendations,
        total: completeRecommendations.length,
        algorithm: 'hybrid-weighted',
        debug: {
          candidateMovies: candidateMovies.length,
          scoredMovies: scoredMovies.length,
          recommendedByPreference: recommendedMovies.length,
          popularityFallback: additionalMovies.length,
        },
        message: 'Recommandations hybrides pondérées',
      });
    }

    res.json({
      success: true,
      movies: recommendedMovies,
      total: recommendedMovies.length,
      algorithm: 'preference-weighted',
      debug: {
        candidateMovies: candidateMovies.length,
        scoredMovies: scoredMovies.length,
        genreScoresUsed: Object.values(genreScores).filter(
          (g) => g.score !== 0
        ),
      },
      message: 'Recommandations basées sur vos préférences pondérées',
    });
  } catch (error) {
    console.error('❌ Erreur recommandations:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /movies/:id/like - Liker un film
router.post('/movies/:id/like', async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    const movieRepository = appDataSource.getRepository('Movie');

    // Récupérer le film pour logs
    const movie = await movieRepository.findOne({ where: { id: movieId } });

    await movieRepository.update(movieId, { likedislike: 1 });

    console.log(`👍 Film liké: "${movie?.title}" (ID: ${movieId})`);

    res.json({
      success: true,
      message: 'Film aimé',
      movieId: movieId,
    });
  } catch (error) {
    console.error('❌ Erreur like:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /movies/:id/dislike - Disliker un film
router.post('/movies/:id/dislike', async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    const movieRepository = appDataSource.getRepository('Movie');

    // Récupérer le film pour logs
    const movie = await movieRepository.findOne({ where: { id: movieId } });

    await movieRepository.update(movieId, { likedislike: -1 });

    console.log(`👎 Film disliké: "${movie?.title}" (ID: ${movieId})`);

    res.json({
      success: true,
      message: 'Film non aimé',
      movieId: movieId,
    });
  } catch (error) {
    console.error('❌ Erreur dislike:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /movies/:id/rating - Supprimer l'évaluation d'un film
router.delete('/movies/:id/rating', async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    const movieRepository = appDataSource.getRepository('Movie');

    await movieRepository.update(movieId, { likedislike: 0 });

    console.log(`⚪ Rating supprimé pour film ID: ${movieId}`);

    res.json({
      success: true,
      message: 'Évaluation supprimée',
      movieId: movieId,
    });
  } catch (error) {
    console.error('❌ Erreur suppression rating:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
