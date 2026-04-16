CREATE TABLE IF NOT EXISTS scores (
  id          SERIAL PRIMARY KEY,
  player_name TEXT        NOT NULL,
  score       INTEGER     NOT NULL CHECK (score >= 0 AND score <= 397),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scores_score ON scores (score DESC, created_at ASC);
