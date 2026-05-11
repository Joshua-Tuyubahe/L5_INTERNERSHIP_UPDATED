import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
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
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('name', data.name);
        if (data.redirectTo) {
          navigate(data.redirectTo);
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
        <div className="card-header">
          <h1 className="card-title">Login</h1>
          <p className="card-subtitle">
            Sign in with your email and password to continue.
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
