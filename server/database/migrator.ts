import Database from 'better-sqlite3'

// Migrations embedded directly to work in bundled Nitro builds
const migrations: [string, string][] = [
  ['001_initial_schema.sql', `
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS model_configs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT,
    name TEXT NOT NULL,
    api_endpoint TEXT NOT NULL,
    api_key_encrypted TEXT,
    model_name TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Chat',
    system_prompt TEXT,
    temperature REAL DEFAULT 0.7,
    top_p REAL DEFAULT 0.9,
    model_config_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (model_config_id) REFERENCES model_configs(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    conversation_id TEXT NOT NULL,
    parent_id TEXT,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL DEFAULT '',
    sibling_index INTEGER NOT NULL DEFAULT 0,
    model_name TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES messages(id) ON DELETE CASCADE
);
`],
  ['002_add_indexes.sql', `
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent ON messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_parent ON messages(conversation_id, parent_id);
CREATE INDEX IF NOT EXISTS idx_model_configs_user ON model_configs(user_id);
`],
  ['003_provider_model_split.sql', `
-- Model providers table (endpoint + API key)
CREATE TABLE IF NOT EXISTS model_providers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT,
    name TEXT NOT NULL,
    api_endpoint TEXT NOT NULL,
    api_key_encrypted TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_model_providers_user ON model_providers(user_id);

-- Add provider_id to model_configs
ALTER TABLE model_configs ADD COLUMN provider_id TEXT REFERENCES model_providers(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_model_configs_provider ON model_configs(provider_id);

-- Migrate existing data: create providers from distinct (user_id, endpoint, key) combos
INSERT INTO model_providers (id, user_id, name, api_endpoint, api_key_encrypted, created_at)
SELECT lower(hex(randomblob(16))), user_id, api_endpoint, api_endpoint, api_key_encrypted, MIN(created_at)
FROM model_configs
GROUP BY user_id, api_endpoint, api_key_encrypted;

-- Link existing model_configs to their new providers
UPDATE model_configs SET provider_id = (
    SELECT mp.id FROM model_providers mp
    WHERE mp.api_endpoint = model_configs.api_endpoint
    AND mp.api_key_encrypted IS model_configs.api_key_encrypted
    AND mp.user_id IS model_configs.user_id
    LIMIT 1
);
`],
  ['004_top_k_to_top_p.sql', `
ALTER TABLE conversations RENAME COLUMN top_k TO top_p;
`],
]

export function runMigrations(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  const applied = new Set(
    db.prepare('SELECT name FROM _migrations').all()
      .map((r: any) => r.name),
  )

  for (const [name, sql] of migrations) {
    if (applied.has(name)) continue
    db.exec(sql)
    db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(name)
    console.log(`[db] Applied migration: ${name}`)
  }
}
