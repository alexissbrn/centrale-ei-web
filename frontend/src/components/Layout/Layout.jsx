import './Layout.css';
import Header from '../Header/Header';

const Layout = ({ children }) => {
  return (
    <div className="Layout-container">
      {/* Effet de particules animées en arrière-plan */}
      <div className="Layout-particles"></div>

      {/* Grille en arrière-plan */}
      <div className="Layout-grid"></div>

      {/* Header avec effet de blur */}
      <div className="Layout-header-wrapper">
        <Header />
      </div>

      {/* Contenu principal */}
      <main className="Layout-content">
        <div className="Layout-content-inner">{children}</div>
      </main>

      {/* Effets visuels supplémentaires */}
      <div className="Layout-ambient-light"></div>
    </div>
  );
};

export default Layout;
