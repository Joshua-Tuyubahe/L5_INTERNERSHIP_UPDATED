import { Link, useNavigate } from 'react-router-dom';

function Navbar({ role }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.clear();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          FD Management
        </Link>
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
      </div>
    </header>
  );
}

export default Navbar;
