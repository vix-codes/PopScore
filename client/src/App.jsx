import { NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Admin from "./pages/Admin";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Movie discovery platform</p>
          <NavLink to="/" className="brand">
            PopScore
          </NavLink>
        </div>
        <nav className="nav-links">
          <NavLink to="/">Browse</NavLink>
          <NavLink to="/admin">Admin</NavLink>
          {user ? (
            <>
              <span className="user-chip">
                {user.name} | {user.role}
              </span>
              <button type="button" className="ghost-button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/auth">Login / Signup</NavLink>
          )}
        </nav>
      </header>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
