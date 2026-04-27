import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('name', data.name);
        if (data.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/user-dashboard');
        }
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      setMessage('Network error: unable to reach server.');
      console.error('Login fetch error:', error);
    }
  }

  return (
    <div className="page-center">
      <div className="card">
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            className={`btn ${role === 'user' ? 'btn-primary' : 'btn-secondary'} flex-1`}
            onClick={() => setRole('user')}
          >
            User Login
          </button>
          <button
            type="button"
            className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-secondary'} flex-1`}
            onClick={() => setRole('admin')}
          >
            Admin Login
          </button>
        </div>

        <div className="card-header">
          <h1 className="card-title">{role === 'admin' ? 'Admin Login' : 'User Login'}</h1>
          <p className="card-subtitle">
            {role === 'admin'
              ? 'Sign in with your admin credentials to access the admin dashboard.'
              : 'Sign in to your account.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block">Sign In</button>
          </div>
        </form>
        {message && <div className="message error fade-in">{message}</div>}
        <p className="text-center text-secondary">
          New user? <Link to="/register" className="text-secondary font-medium">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
