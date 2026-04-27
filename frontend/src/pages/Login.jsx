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
        <div className="login-toggle">
          <button
            type="button"
            className={role === 'user' ? 'active' : ''}
            onClick={() => setRole('user')}
          >
            User Login
          </button>
          <button
            type="button"
            className={role === 'admin' ? 'active' : ''}
            onClick={() => setRole('admin')}
          >
            Admin Login
          </button>
        </div>

        <h2>{role === 'admin' ? 'Admin Login' : 'User Login'}</h2>
        <p className="muted">
          {role === 'admin'
            ? 'Sign in with your admin credentials to access the admin dashboard.'
            : 'Sign in to your account.'}
        </p>

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </label>
          <button type="submit">Login</button>
        </form>
        {message && <div className="message error">{message}</div>}
        <p>
          New user? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
