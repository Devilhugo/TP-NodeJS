-- =========================================================
--  Base de données du blog (PostgreSQL)
--  Exécution : npm run db:init   (ou coller dans un éditeur SQL)
-- =========================================================

-- Utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  password    VARCHAR(100) NOT NULL,              -- hash bcrypt (60 caractères)
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Articles du blog
CREATE TABLE IF NOT EXISTS blogposts (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  body         TEXT,
  image_data   BYTEA,                             -- contenu binaire de l'image
  image_type   VARCHAR(50),                       -- ex : image/png
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_posted  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blogposts_user_id     ON blogposts (user_id);
CREATE INDEX IF NOT EXISTS idx_blogposts_date_posted ON blogposts (date_posted DESC);

-- Sessions (format attendu par connect-pg-simple)
CREATE TABLE IF NOT EXISTS "session" (
  "sid"    VARCHAR      NOT NULL COLLATE "default",
  "sess"   JSON         NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
