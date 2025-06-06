import './About.css';
// installer en faisant `npm install react-icons`
import {
  FaEnvelope,
  FaFacebook,
  FaFilm,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhone,
  FaRocket,
  FaUsers,
} from 'react-icons/fa';

function About() {
  return (
    <div className="about">
      {/* Titre principal */}
      <div className="about-header">
        <h1>À propos de PIMP MY FILM</h1>
        <p className="about-subtitle">
          La plateforme futuriste pour les cinéphiles du monde entier
        </p>
      </div>

      {/* Container principal avec grille */}
      <div className="about-container">
        {/* Section Mission */}
        <div className="about-section mission">
          <div className="section-icon">
            <FaRocket />
          </div>
          <h2>Notre Mission</h2>
          <p>
            Pimp my film est une plateforme révolutionnaire dédiée aux
            cinéphiles qui souhaitent découvrir de nouveaux films et les noter.
            Notre objectif est de créer une communauté où les utilisateurs
            peuvent partager leurs passions et découvrir de nouveaux
            chefs-d'œuvre du cinéma grâce à l'intelligence artificielle et aux
            technologies de pointe.
          </p>
          <div className="stats">
            <div className="stat-item">
              <FaFilm className="stat-icon" />
              <span>1000+ Films</span>
            </div>
            <div className="stat-item">
              <FaUsers className="stat-icon" />
              <span>10K+ Utilisateurs</span>
            </div>
          </div>
        </div>

        {/* Section Bureaux */}
        <div className="about-section offices">
          <div className="section-icon">
            <FaMapMarkerAlt />
          </div>
          <h2>Nos Bureaux</h2>
          <ul className="office-list">
            <li className="office-item">
              <FaMapMarkerAlt className="icon" />
              <div className="office-details">
                <strong>Paris HQ</strong>
                <span>14 Rue Désiré Doué</span>
                <span>75001 Paris, France</span>
              </div>
            </li>
            <li className="office-item">
              <FaMapMarkerAlt className="icon" />
              <div className="office-details">
                <strong>Lyon Tech Center</strong>
                <span>128 Avenue Rayan Cherki</span>
                <span>69000 Lyon, France</span>
              </div>
            </li>
            <li className="office-item">
              <FaMapMarkerAlt className="icon" />
              <div className="office-details">
                <strong>Marseille Innovation Lab</strong>
                <span>46 Impasse Adrien Rabiot</span>
                <span>13000 Marseille, France</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Section Contact */}
        <div className="about-section contact">
          <div className="section-icon">
            <FaEnvelope />
          </div>
          <h2>Contactez-nous</h2>
          <ul className="contact-list">
            <li className="contact-item">
              <FaEnvelope className="icon" />
              <div className="contact-details">
                <strong>Email</strong>
                <a href="mailto:contact@pimpmyfilm.com">
                  contact@pimpmyfilm.com
                </a>
              </div>
            </li>
            <li className="contact-item">
              <FaPhone className="icon" />
              <div className="contact-details">
                <strong>Téléphone</strong>
                <a href="tel:+33123456789">+33 1 23 45 67 89</a>
              </div>
            </li>
            <li className="contact-item">
              <FaFacebook className="icon" />
              <div className="contact-details">
                <strong>Facebook</strong>
                <a
                  href="https://facebook.com/pimpmyfilm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  facebook.com/pimpmyfilm
                </a>
              </div>
            </li>
            <li className="contact-item">
              <FaInstagram className="icon" />
              <div className="contact-details">
                <strong>Instagram</strong>
                <a
                  href="https://instagram.com/pimpmyfilm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  instagram.com/pimpmyfilm
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default About;
