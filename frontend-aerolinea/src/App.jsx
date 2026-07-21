import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FlightsListPage from "./pages/FlightsListPage";
import AdminPanel from "./pages/AdminPanel";
import AddFlightPage from "./pages/AddFlightPage";
import DeleteFlightPage from "./pages/DeleteFlightPage";
import AdminLayout from "./layouts/AdminLayout";
import PublicLayout from "./layouts/PublicLayout";
import AdminHeroManager from "./pages/AdminHeroManager";
import BookingFormPage from "./pages/BookingFormPage";
import AdminRecommendationsPage from "./pages/AdminRecommendationsPage";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import EditRecommendationPage from "./pages/EditRecommendationPage";
import RecommendationDetailPage from "./pages/RecommendationDetailPage";
import PassengersListPage from "./pages/PassengersListPage";
import AddPassengerPage from "./pages/AddPassengerPage";
import SearchResultsPage from "./pages/SearchResultsPage.jsx";
import RecommendationGalleryPage from "./pages/RecommendationGalleryPage";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminUserFormPage from "./pages/AdminUserFormPage";
import AdminCharacteristicsPage from "./pages/AdminCharacteristicsPage";
import CategoryResultsPage from "./pages/CategoryResultsPage";
import AdminPoliciesPage from "./pages/AdminPoliciesPage";
import ReservationPage from "./pages/ReservationPage";
import ReservationConfirmationPage from "./pages/ReservationConfirmationPage";

const RequireAdmin = ({ children, auth }) => {
  if (!auth.user || !auth.isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RequireUser = ({ children, auth }) => {
  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [auth, setAuth] = useState(() => {
    const savedAuth = localStorage.getItem("auth");
    return savedAuth ? JSON.parse(savedAuth) : { isAdmin: false, user: null };
  });

  const onLogin = async ({ email, password }) => {
    //  Login → obtener token
    const res = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error de login");
    }

    // Guardar token
    localStorage.setItem("token", data.token);

    // Obtener usuario actual
    const meRes = await fetch("http://localhost:8080/api/auth/me", {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    const meData = await meRes.json();

    if (!meRes.ok) {
      throw new Error("No se pudo obtener el usuario");
    }

    return {
      isAdmin: meData.roles.includes("ROLE_ADMIN"),
      user: meData,
    };
  };

  const handleLogin = async (credentials) => {
    const result = await onLogin(credentials);

    const newAuth = {
      isAdmin: result.isAdmin,
      user: result.user,
    };

    setAuth(newAuth);
    localStorage.setItem("auth", JSON.stringify(newAuth));

    return result;
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    setAuth({ isAdmin: false, user: null });
  };

  useEffect(() => {
    localStorage.setItem("auth", JSON.stringify(auth));
  }, [auth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* RUTAS ADMIN –  */}

        <Route
          path="/admin"
          element={
            <RequireAdmin auth={auth}>
              <AdminLayout auth={auth} onLogout={handleLogout} />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminPanel />} />
          <Route
            path="listar-vuelos"
            element={<FlightsListPage adminView={true} />}
          />
          <Route path="add-flight" element={<AddFlightPage />} />
          <Route path="edit-flight/:id" element={<AddFlightPage />} />
          <Route path="delete-flight/:id" element={<DeleteFlightPage />} />
          <Route path="hero" element={<AdminHeroManager />} />
          <Route
            path="recommendations"
            element={<AdminRecommendationsPage />}
          />
          <Route
            path="recommendations/edit/:id"
            element={<EditRecommendationPage />}
          />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="passengers" element={<PassengersListPage />} />
          <Route path="add-passenger" element={<AddPassengerPage />} />
          <Route path="admin-users" element={<AdminUsersPage />} />
          <Route path="admin-user" element={<AdminUserFormPage />} />
          <Route path="admin-user/:id" element={<AdminUserFormPage />} />
          <Route
            path="characteristics"
            element={<AdminCharacteristicsPage />}
          />
          <Route path="policies" element={<AdminPoliciesPage />} />
        </Route>

        {/* RUTAS PÚBLICAS */}
        <Route
          path="/"
          element={<PublicLayout auth={auth} onLogout={handleLogout} />}
        >
          <Route index element={<HomePage auth={auth} />} />
          <Route path="login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="flights" element={<FlightsListPage />} />
          <Route path="booking" element={<BookingFormPage />} />
          <Route path="reservation" element={<ReservationPage auth={auth} />} />
          <Route path="reservation-confirmation"        element={
              <RequireUser auth={auth}>
                <ReservationConfirmationPage auth={auth} />
              </RequireUser>
            }
          />
          <Route
            path="recommendations/:id"
            element={<RecommendationDetailPage />}
          />
          <Route path="reco/:id" element={<RecommendationDetailPage />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="search-results" element={<SearchResultsPage />} />
          <Route
            path="/recommendations/:id/gallery"
            element={<RecommendationGalleryPage />}
          />
          <Route path="category-results" element={<CategoryResultsPage />} />

          {/* PROFILE — SOLO USUARIO LOGUEADO */}
          <Route
            path="profile"
            element={
              <RequireUser auth={auth}>
                <ProfilePage auth={auth} onLogout={handleLogout} />
              </RequireUser>
            }
          />
        </Route>
        {/* DEFAULT */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
