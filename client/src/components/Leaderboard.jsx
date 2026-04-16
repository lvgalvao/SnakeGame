import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { isAdmin } from '../auth.js';

export default function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const admin = isAdmin();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setScores(await api.listScores());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this score?')) return;
    try {
      await api.deleteScore(id);
      setScores((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  const rankClass = (i) => i === 0 ? 'rank rank-1' : i === 1 ? 'rank rank-2' : i === 2 ? 'rank rank-3' : 'rank rank-rest';
  const rankLabel = (i) => i === 0 ? '#01' : i === 1 ? '#02' : i === 2 ? '#03' : `#${String(i + 1).padStart(2, '0')}`;
  const fmtDate = (s) => {
    try { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return s; }
  };

  return (
    <div className="card">
      <h2>Leaderboard</h2>
      {loading && <p className="lb-loading">Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && scores.length === 0 && <p className="lb-empty">No scores yet.</p>}
      {!loading && !error && scores.length > 0 && (
        <table className="scores">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Score</th>
              <th>Date</th>
              {admin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {scores.map((s, i) => (
              <tr key={s.id}>
                <td className={rankClass(i)}>{rankLabel(i)}</td>
                <td>{s.player_name}</td>
                <td className="score-val">{s.score}</td>
                <td className="date-val">{fmtDate(s.created_at)}</td>
                {admin && (
                  <td>
                    <button className="danger" onClick={() => handleDelete(s.id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
