import './About.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhone,
} from 'react-icons/fa';

function About() {
  return (
    <div className="about">
      <h1>About Us</h1>
      <div className="about-container">
        {/* Première colonne : Adresses */}
        <div className="column left">
          <h2>Nos bureaux :</h2>
          <ul>
            <li>
              <FaMapMarkerAlt className="icon" />
              123 Rue des Entrepreneurs, Paris, France
            </li>
            <li>
              <FaMapMarkerAlt className="icon" />
              456 Avenue du Progrès, Lyon, France
            </li>
            <li>
              <FaMapMarkerAlt className="icon" />
              789 Boulevard des Innovations, Marseille, France
            </li>
          </ul>
        </div>

        {/* Deuxième colonne : Contacts */}
        <div className="column middle">
          <h2>Contactez-nous :</h2>
          <ul>
            <li>
              <FaEnvelope className="icon" /> contact@filmrating.com
            </li>
            <li>
              <FaPhone className="icon" /> +33 1 23 45 67 89
            </li>
            <li>
              <FaFacebook className="icon" /> facebook.com/filmrating
            </li>
            <li>
              <FaInstagram className="icon" /> instagram.com/filmrating
            </li>
          </ul>
        </div>

        {/* Troisième colonne : Description */}
        <div className="column right">
          <h2>Qui sommes-nous ?</h2>
          <p>
            FilmRating est une plateforme dédiée aux cinéphiles qui souhaitent
            découvrir de nouveaux films et les noter. Notre objectif est de
            créer une communauté où les utilisateurs peuvent partager leurs
            découvrir de nouveaux chefs-d'œuvre du cinéma.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;

//color: #2c3e50 bleu gris
