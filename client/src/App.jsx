import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import SnakeGame from './components/SnakeGame.jsx';
import Login from './components/Login.jsx';
import Leaderboard from './components/Leaderboard.jsx';

export default function App() {
  const [authVersion, setAuthVersion] = useState(0);
  const bumpAuth = () => setAuthVersion((v) => v + 1);

  return (
    <div className="app" key={authVersion}>
      <NavBar onChange={bumpAuth} />
      <main>
        <Routes>
          <Route path="/" element={<SnakeGame />} />
          <Route path="/login" element={<Login onChange={bumpAuth} />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>
    </div>
  );
}
