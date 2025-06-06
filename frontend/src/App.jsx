import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Users from './pages/Users/Users';
import About from './pages/About/About';
import MovieDetails from './pages/MovieDetails/MovieDetails';
import Recommendations from './pages/Recommendations/Recommendations'; // Nouvelle import

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="users" element={<Users />} />
        <Route path="about" element={<About />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/recommendations" element={<Recommendations />} />
      </Routes>
    </Layout>
  );
}

export default App;
