import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { setSession } from '../auth.js';

export default function Login({ onChange }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, username: u } = await api.login(username, password);
      setSession(token, u);
      onChange?.();
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 380 }}>
      <h2>// Admin Access</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus autoComplete="username" spellCheck={false} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        {error && <p className="error">{'> '}{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Authenticating…' : '> Login'}</button>
      </form>
    </div>
  );
}
