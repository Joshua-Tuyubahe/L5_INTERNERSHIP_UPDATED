import { Link, useNavigate } from 'react-router-dom';

function Navbar({ role }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.clear();
    navigate('/login');
  }

  return (
    <header className={`navbar ${role ? '' : 'navbar-home'}`}>
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-icon">🍽️</span>
          <span>FD Management System</span>
        </Link>

        {role ? (
          <nav className="navbar-links">
            {role === 'admin' && (
              <>
                <Link to="/admin-dashboard" className="navbar-links-item">Dashboard</Link>
                <Link to="/reports" className="navbar-links-item">Reports</Link>
              </>
            )}
            {role === 'user' && <Link to="/user-dashboard" className="navbar-links-item">Menu</Link>}
            <button className="btn btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        ) : (
          <div className="navbar-home-actions">
            <div className="navbar-menu">
              <Link to="#home" className="navbar-links-item">Home</Link>
              <Link to="#foods" className="navbar-links-item">Foods</Link>
              <Link to="#orders" className="navbar-links-item">Orders</Link>
              <Link to="#about" className="navbar-links-item">About Us</Link>
              <Link to="#contact" className="navbar-links-item">Contact</Link>
            </div>
            <div className="navbar-buttons">
              <Link to="/login" className="btn btn-secondary btn-outline">User Login</Link>
              <Link to="/login" className="btn btn-orange">Admin Login</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
