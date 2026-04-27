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
        <h2>Register</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" required />
          </label>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </label>
          <button type="submit">Create Account</button>
        </form>
        {message && <div className="message">{message}</div>}
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
