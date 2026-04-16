import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';

const GRID = 20;
const CELL = 20;
const TICK_MS = 130;

// #7 — fixed: uses Set to avoid infinite loop when grid is full
function randomFood(snake) {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));
  const free = [];
  for (let x = 0; x < GRID; x++)
    for (let y = 0; y < GRID; y++)
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
  if (free.length === 0) return null;
  return free[Math.floor(Math.random() * free.length)];
}

function initialState() {
  const snake = [
    { x: 10, y: 10 },
    { x: 9,  y: 10 },
    { x: 8,  y: 10 },
  ];
  return {
    snake,
    dir: { x: 1, y: 0 },
    food: randomFood(snake),
    score: 0,
    over: false,
  };
}

export default function SnakeGame() {
  const canvasRef = useRef(null);
  const stateRef = useRef(initialState());
  const dirQueueRef = useRef([]);
  const intervalRef = useRef(null);
  const [, forceRender] = useState(0);
  const [saveStatus, setSaveStatus] = useState(null);
  const [playerName, setPlayerName] = useState('');

  function tick() {
    const s = stateRef.current;
    if (s.over) return;

    if (dirQueueRef.current.length > 0) {
      const next = dirQueueRef.current.shift();
      if (next.x !== -s.dir.x || next.y !== -s.dir.y) s.dir = next;
    }

    const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
    const hitWall = head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID;
    const hitSelf = s.snake.some((p) => p.x === head.x && p.y === head.y);
    if (hitWall || hitSelf) {
      s.over = true;
      forceRender((v) => v + 1);
      return;
    }

    s.snake.unshift(head);
    if (head.x === s.food?.x && head.y === s.food?.y) {
      s.score += 1;
      const next = randomFood(s.snake);
      if (!next) { s.over = true; } // grid full — victory
      else s.food = next;
    } else {
      s.snake.pop();
    }
    forceRender((v) => v + 1);
  }

  function draw() {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const s = stateRef.current;
    const W = GRID * CELL;

    ctx.fillStyle = '#030a03';
    ctx.fillRect(0, 0, W, W);

    ctx.strokeStyle = '#0a1a0a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, W); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(W, i * CELL); ctx.stroke();
    }

    if (s.food) {
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(s.food.x * CELL + 3, s.food.y * CELL + 3, CELL - 6, CELL - 6);
      ctx.shadowBlur = 0;
    }

    const len = s.snake.length;
    s.snake.forEach((p, i) => {
      const ratio = i / Math.max(len - 1, 1);
      if (i === 0) {
        ctx.shadowColor = '#39ff14';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#39ff14';
      } else {
        ctx.shadowBlur = 0;
        const g = Math.round(220 * (1 - ratio * 0.75));
        ctx.fillStyle = `rgb(0, ${g}, 0)`;
      }
      ctx.fillRect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2);
    });
    ctx.shadowBlur = 0;

    if (len > 0) {
      const h = s.snake[0];
      const d = s.dir;
      ctx.fillStyle = '#030a03';
      const perp = { x: -d.y, y: d.x };
      const cx = h.x * CELL + CELL / 2;
      const cy = h.y * CELL + CELL / 2;
      [[1, -1], [1, 1]].forEach(([fwd, side]) => {
        const ex = cx + d.x * fwd * 3 + perp.x * side * 3;
        const ey = cy + d.y * fwd * 3 + perp.y * side * 3;
        ctx.beginPath();
        ctx.arc(ex, ey, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  useEffect(() => {
    function onKey(e) {
      const map = {
        ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
      };
      const next = map[e.key];
      if (next) { e.preventDefault(); dirQueueRef.current.push(next); }
    }

    // #8 — pause timer when tab is hidden
    function onVisibility() {
      if (document.hidden) {
        clearInterval(intervalRef.current);
      } else {
        intervalRef.current = setInterval(tick, TICK_MS);
      }
    }

    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVisibility);
    intervalRef.current = setInterval(tick, TICK_MS);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVisibility);
      clearInterval(intervalRef.current);
    };
  }, []);

  // Redraws whenever React re-renders (driven by forceRender in tick)
  useEffect(() => { draw(); });

  function reset() {
    stateRef.current = initialState();
    dirQueueRef.current = [];
    setSaveStatus(null);
    forceRender((v) => v + 1);
  }

  async function save() {
    setSaveStatus('saving');
    try {
      await api.saveScore(playerName.trim() || 'Anonymous', stateRef.current.score);
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus(`error: ${err.message}`);
    }
  }

  const s = stateRef.current;

  return (
    <div className="game">
      <div className="hud">
        <span className="score">Score: {s.score}</span>
        <span className="hint">Arrow keys / WASD</span>
      </div>
      <div className="canvas-wrap">
        <canvas ref={canvasRef} width={GRID * CELL} height={GRID * CELL} />
        {s.over && (
          <div className="overlay">
            <h2>Game over</h2>
            <p>Final score: {s.score}</p>
            <div className="save-row">
              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={32}
                placeholder="Your name"
              />
              {/* #9 — disabled when score is 0 */}
              <button
                onClick={save}
                disabled={s.score === 0 || saveStatus === 'saving' || saveStatus === 'saved'}
              >
                {saveStatus === 'saved' ? 'Saved ✓' : saveStatus === 'saving' ? 'Saving…' : 'Save record'}
              </button>
            </div>
            {saveStatus?.startsWith('error') && <p className="error">{saveStatus}</p>}
            <button className="primary" onClick={reset}>Play again</button>
          </div>
        )}
      </div>
    </div>
  );
}
