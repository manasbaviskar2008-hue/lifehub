import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./components/Register";
import Reminders from "./pages/Reminder";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Expenses from "./pages/Expenses";
import Subscriptions from "./pages/Subscriptions";
import Products from "./pages/Products";
import Notes from "./pages/Notes";
import Habits from "./pages/Habits";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

import "./App.css";


// ===============================
// Protected Route
// ===============================
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// ===============================
// App Layout
// ===============================
function AppLayout() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className="app-container">

      {/* Navbar only inside authenticated application */}
      {!isAuthPage && isAuthenticated && <Navbar />}

      <main className="main-content">
        <Routes>

          {/* =========================
              WELCOME / HOME PAGE
          ========================= */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* =========================
              LOGIN
          ========================= */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login />
              )
            }
          />

          {/* =========================
              REGISTER
          ========================= */}
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register />
              )
            }
          />

          {/* =========================
              DASHBOARD
          ========================= */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* =========================
              REMINDERS
          ========================= */}
          <Route
            path="/reminders"
            element={
              <ProtectedRoute>
                <Reminders />
              </ProtectedRoute>
            }
          />

          {/* =========================
              TASKS
          ========================= */}
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />

          {/* =========================
              EXPENSES
          ========================= */}
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Expenses />
              </ProtectedRoute>
            }
          />

          {/* =========================
              SUBSCRIPTIONS
          ========================= */}
          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <Subscriptions />
              </ProtectedRoute>
            }
          />

          {/* =========================
              PRODUCTS
          ========================= */}
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />

          {/* =========================
              NOTES
          ========================= */}
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />

          {/* =========================
              HABITS
          ========================= */}
          <Route
            path="/habits"
            element={
              <ProtectedRoute>
                <Habits />
              </ProtectedRoute>
            }
          />

          {/* =========================
              PROFILE
          ========================= */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* =========================
              NOT FOUND
          ========================= */}
          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </main>

      {!isAuthPage && isAuthenticated && <Footer />}

    </div>
  );
}


// ===============================
// Main App
// ===============================
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;