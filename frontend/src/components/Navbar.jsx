import { Link, useNavigate } from 'react-router-dom';

function Navbar({ showNotification = false, notificationCount = 0, notifications = [], isNotificationsOpen = false, onNotificationClick = () => {} }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  function handleLogout() {
    localStorage.clear();
    navigate('/login');
  }

  return (
    <header className={`navbar ${token ? '' : 'navbar-home'}`} style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: 'white' }}>
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-icon">🍽️</span>
          <span>FD Management System</span>
        </Link>

        {!token ? (
          <div className="navbar-home-actions">
            <div className="navbar-menu">
              <Link to="#home" className="navbar-links-item">Home</Link>
              <Link to="#foods" className="navbar-links-item">Foods</Link>
              <Link to="#orders" className="navbar-links-item">Orders</Link>
              <Link to="#about" className="navbar-links-item">About Us</Link>
              <Link to="#contact" className="navbar-links-item">Contact</Link>
            </div>
            <div className="navbar-buttons">
              <Link to="/login" className="btn btn-orange">Login</Link>
            </div>
          </div>
        ) : (
          <div className="navbar-buttons" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
            {showNotification && (
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-ghost"
                  style={{
                    position: 'relative',
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'background 0.2s ease, transform 0.2s ease',
                    backgroundColor: notificationCount > 0 ? '#fff1f2' : 'transparent',
                    border: notificationCount > 0 ? '1px solid #fecdd3' : '1px solid transparent'
                  }}
                  onClick={onNotificationClick}
                  aria-label={`Notifications (${notificationCount} unread)`}
                >
                  <span style={{ fontSize: '1.2rem', color: notificationCount > 0 ? '#dc2626' : '#0f172a', transition: 'color 0.2s ease' }}>
                    🔔
                  </span>
                  {notificationCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 0 3px rgba(255,255,255,0.8)'
                    }}>
                      {notificationCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    width: '320px',
                    maxHeight: '340px',
                    overflowY: 'auto',
                    backgroundColor: 'white',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '14px',
                    boxShadow: '0 18px 50px rgba(15, 23, 42, 0.18)',
                    zIndex: 1200,
                    padding: '0.5rem'
                  }}>
                    <div style={{ padding: '0.75rem 0.75rem 0.5rem', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', marginBottom: '0.5rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Notifications
                      <button
                        onClick={onNotificationClick}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Refresh
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '0.75rem', color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
                        You’re all caught up. No admin updates have been made to your orders yet.
                      </div>
                    ) : (
                      notifications.map((item, index) => (
                        <div key={index} style={{ padding: '0.85rem', borderRadius: '12px', backgroundColor: '#f8fafc', marginBottom: '0.5rem', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                          <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 600, marginBottom: '0.25rem' }}>
                            {item.message || item.text || 'Order update from admin'}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                            {item.details || item.description || 'Your order was updated by admin.'}
                          </div>
                          {item.time && (
                            <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: '#64748b' }}>
                              {item.time}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
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
