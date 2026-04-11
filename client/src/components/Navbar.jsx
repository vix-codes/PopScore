import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { PopKernelCluster } from './PopKernelIcon.jsx';

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
        <Link to="/" className="brand">
          <span className="brand-pop"><PopKernelCluster count={3} size={19} /></span>
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
          background: rgba(10, 11, 15, 0.85);
          backdrop-filter: blur(12px);
        }
        .nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0.85rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.35rem;
          letter-spacing: -0.03em;
        }
        .brand-pop {
          color: var(--accent-2);
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
          gap: 0.25rem;
          flex: 1;
        }
        .nav-links a {
          padding: 0.5rem 0.85rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
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
          gap: 0.5rem;
        }
        .user-pill {
          font-size: 0.85rem;
          color: var(--text-muted);
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          border: 1px solid var(--border);
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        @media (max-width: 768px) {
          .nav-inner {
            flex-wrap: wrap;
          }
          .nav-links {
            order: 3;
            width: 100%;
            flex-wrap: wrap;
          }
          .user-pill {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
