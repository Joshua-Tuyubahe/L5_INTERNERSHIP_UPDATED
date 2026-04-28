import { Link, useNavigate } from 'react-router-dom';

function Navbar({ role }) {
  const navigate = useNavigate();
  const isHome = !role;

  function handleLogout() {
    localStorage.clear();
    navigate('/login');
  }

  return (
    <header className={`navbar ${isHome ? 'navbar-home' : 'navbar-app'}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-icon">🍽️</span>
          <span>FD Management System</span>
        </Link>

        {isHome ? (
          <>
            <div className="navbar-links">
              <a href="#home">Home</a>
              <a href="#foods">Foods</a>
              <a href="#orders">Orders</a>
              <a href="#about">About Us</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="navbar-actions">
              <Link to="/login" className="btn btn-outline btn-sm">User Login</Link>
              <Link to="/login" className="btn btn-orange btn-sm">Admin Login</Link>
            </div>
          </>
        ) : (
          <div className="navbar-actions navbar-app-actions">
            {role === 'admin' && (
              <Link to="/admin-dashboard" className="navbar-link">Dashboard</Link>
            )}
            {role === 'user' && (
              <Link to="/user-dashboard" className="navbar-link">Menu</Link>
            )}
            <button className="btn btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
