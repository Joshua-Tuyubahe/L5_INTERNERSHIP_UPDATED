import { Link, useNavigate } from 'react-router-dom';

function Navbar({ role }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.clear();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">FD Management</div>
      <nav className="navbar-links">
        {role === 'admin' && (
          <>
            <Link to="/admin-dashboard">Dashboard</Link>
            <Link to="/reports">Reports</Link>
          </>
        )}
        {role === 'user' && <Link to="/user-dashboard">Menu</Link>}
        <button className="button-secondary" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
