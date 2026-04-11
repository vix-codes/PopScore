import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="navbar">
      <div className="nav-inner">
        <div className="nav-left" />
        <div className="nav-center">
          <Link to="/" className="brand">
            <span className="brand-pop">🍿</span>
            <span className="brand-text">PopScore</span>
          </Link>
          <nav className="nav-links">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} end>
              Discover
            </NavLink>
            {user && (
              <>
                <NavLink to="/favorites" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Favorites
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Profile
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
                    Admin
                  </NavLink>
                )}
              </>
            )}
          </nav>
        </div>
        <div className="nav-auth">
          {user ? (
            <>
              <span className="user-pill">{user.username}</span>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          border-bottom: 1px solid var(--border);
          background: rgba(10, 11, 15, 0.88);
          backdrop-filter: blur(12px);
        }
        .nav-inner {
          max-width: 1380px;
          margin: 0 auto;
          padding: 1.05rem 1.5rem 1.15rem;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 1rem;
        }
        .nav-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8rem;
        }
        .brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 2.1rem;
          letter-spacing: -0.03em;
        }
        .brand-pop {
          font-size: 2rem;
          filter: drop-shadow(0 0 8px var(--glow));
        }
        .brand-text {
          background: linear-gradient(135deg, #fff, var(--accent-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .nav-links {
          display: flex;
          justify-content: center;
          gap: 0.45rem;
          flex-wrap: wrap;
        }
        .nav-links a {
          padding: 0.72rem 1.2rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-muted);
          transition: color 0.2s, background 0.2s;
        }
        .nav-links a:hover {
          color: var(--text);
          background: rgba(255, 255, 255, 0.05);
        }
        .nav-links a.active {
          color: var(--text);
          background: rgba(255, 107, 53, 0.15);
        }
        .nav-auth {
          display: flex;
          align-items: center;
          justify-self: end;
          gap: 0.5rem;
        }
        .user-pill {
          font-size: 0.95rem;
          color: var(--text-muted);
          padding: 0.45rem 0.9rem;
          border-radius: 999px;
          border: 1px solid var(--border);
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @media (max-width: 900px) {
          .nav-inner {
            grid-template-columns: 1fr;
            justify-items: center;
          }
          .nav-left {
            display: none;
          }
          .nav-auth {
            justify-self: center;
          }
          .brand {
            font-size: 1.8rem;
          }
          .brand-pop {
            font-size: 1.8rem;
          }
        }
        @media (max-width: 640px) {
          .nav-inner {
            padding: 0.95rem 1rem 1rem;
          }
          .brand {
            font-size: 1.55rem;
          }
          .nav-links a {
            padding: 0.62rem 0.95rem;
            font-size: 0.94rem;
          }
          .user-pill {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
