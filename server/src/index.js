require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const scoreRoutes = require('./routes/scores');

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Snake server listening on http://localhost:${port}`);
});
