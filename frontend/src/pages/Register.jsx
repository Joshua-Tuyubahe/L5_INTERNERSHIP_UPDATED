import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();

      if (response.ok) {
        setMessage('Registration successful. You can log in now.');
        setName('');
        setEmail('');
        setPassword('');
        setTimeout(() => {
          navigate('/login');
        }, 1200);
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      setMessage('Network error: unable to reach server.');
      console.error('Register fetch error:', error);
    }
  }

  return (
    <div className="page-center">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Create Account</h1>
          <p className="card-subtitle">Join us to start ordering delicious food</p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Enter your full name"
              required
            />
          </div>
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
              placeholder="Create a secure password"
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block">Create Account</button>
          </div>
        </form>
        {message && (
          <div className={`message ${message.includes('successful') ? 'success' : 'error'} fade-in`}>
            {message}
          </div>
        )}
        <p className="text-center text-secondary">
          Already have an account? <Link to="/login" className="text-secondary font-medium">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
