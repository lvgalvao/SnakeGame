import { Link, useNavigate } from 'react-router-dom';
import { isAdmin, clearSession, getUsername } from '../auth.js';

export default function NavBar({ onChange }) {
  const navigate = useNavigate();
  const admin = isAdmin();

  function handleLogout() {
    clearSession();
    onChange?.();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="brand">SNAKE</Link>
        <Link to="/leaderboard">Leaderboard</Link>
      </div>
      <div className="nav-right">
        {admin ? (
          <>
            <span className="user">{getUsername()}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}
