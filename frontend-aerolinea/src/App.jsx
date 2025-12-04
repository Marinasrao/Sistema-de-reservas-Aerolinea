import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FlightsListPage from './pages/FlightsListPage';
import AdminPanel from './pages/AdminPanel';
import AddFlightPage from './pages/AddFlightPage';
import DeleteFlightPage from './pages/DeleteFlightPage';
import AdminLayout from './layouts/AdminLayout';
import PublicLayout from './layouts/PublicLayout';
import AdminHeroManager from './pages/AdminHeroManager';
import BookingFormPage from './pages/BookingFormPage';
import AdminRecommendationsPage from './pages/AdminRecommendationsPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import EditRecommendationPage from './pages/EditRecommendationPage';
import RecommendationDetailPage from './pages/RecommendationDetailPage';
import PassengersListPage from './pages/PassengersListPage';
import AddPassengerPage from './pages/AddPassengerPage';
import SearchResultsPage from './pages/SearchResultsPage.jsx';

const RequireAuth = ({ children, auth }) => {
  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }
  if (auth.user && !auth.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const [auth, setAuth] = useState(() => {
    const savedAuth = localStorage.getItem('auth');
    return savedAuth
      ? JSON.parse(savedAuth)
      : { isAdmin: false, user: null };
  });

  const handleLogin = async (credentials) => {
    let userData = null;

    if (credentials.email === 'admin@aerolinea.com' && credentials.password === 'admin123') {
      userData = { isAdmin: true, name: 'Admin Demo', email: credentials.email };
    } else if (credentials.email === 'user@aerolinea.com' && credentials.password === 'user123') {
      userData = { isAdmin: false, name: 'Usuario Demo', email: credentials.email };
    }

    if (userData) {
      const newAuth = {
        isAdmin: userData.isAdmin,
        user: { name: userData.name, email: userData.email }
      };
      setAuth(newAuth);
      localStorage.setItem('auth', JSON.stringify(newAuth));
      return { success: true, isAdmin: userData.isAdmin };
    }

    return { success: false };
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setAuth({ isAdmin: false, user: null });
  };

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);

  return (
    <BrowserRouter>
      <Routes>

  {/* RUTAS ADMIN –  */}
  <Route
    path="/admin"
    element={
      <RequireAuth auth={auth}>
        <AdminLayout auth={auth} onLogout={handleLogout} />
      </RequireAuth>
    }
  >
    <Route index element={<AdminPanel />} />
    <Route path="listar-vuelos" element={<FlightsListPage adminView={true} />} />
    <Route path="add-flight" element={<AddFlightPage />} />
    <Route path="edit-flight/:id" element={<AddFlightPage />} />
    <Route path="delete-flight/:id" element={<DeleteFlightPage />} />
    <Route path="hero" element={<AdminHeroManager />} />
    <Route path="recommendations" element={<AdminRecommendationsPage />} />
    <Route path="recommendations/edit/:id" element={<EditRecommendationPage />} />
    <Route path="categories" element={<AdminCategoriesPage />} />
    <Route path="passengers" element={<PassengersListPage />} />
    <Route path="add-passenger" element={<AddPassengerPage />} />
  </Route>

  {/* RUTAS PÚBLICAS */}
  <Route
    path="/"
    element={<PublicLayout auth={auth} onLogout={handleLogout} />}
  >
    <Route index element={<HomePage />} />
    <Route path="login" element={<LoginPage onLogin={handleLogin} />} />
    <Route path="register" element={<RegisterPage />} />
    <Route path="flights" element={<FlightsListPage />} />
    <Route path="booking" element={<BookingFormPage />} />
    <Route path="recommendations/:id" element={<RecommendationDetailPage />} />
    <Route path="reco/:id" element={<RecommendationDetailPage />} />
    <Route path="search" element={<SearchResultsPage />} />
    <Route path="search-results" element={<SearchResultsPage />} />
  </Route>

  {/* DEFAULT */}
  <Route path="*" element={<Navigate to="/" />} />

</Routes>

    </BrowserRouter>
  );
}

export default App;
