import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav('/');
  };

  return (
    <header className="nav">
      <Link to="/" className="brand">
        <span className="brand-logo">⇄</span>
        <span>SkillSwap</span>
      </Link>
      <nav className="nav-links">
        <NavLink to="/" end>Browse</NavLink>
        {user && <NavLink to="/dashboard">Dashboard</NavLink>}
        {user && <NavLink to="/profile">Profile</NavLink>}
        {user && <NavLink to="/requests">Requests</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      <div className="nav-actions">
        {!user ? (
          <>
            <Link to="/login" className="btn btn-ghost">Log in</Link>
            <Link to="/register" className="btn btn-primary">Sign up</Link>
          </>
        ) : (
          <>
            <span className="hello">Hi, {user.name}</span>
            <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
          </>
        )}
      </div>
    </header>
  );
}
