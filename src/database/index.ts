import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync('krnl_core.db');
  await initDatabase(dbInstance);
  return dbInstance;
}

async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- Files Index Table (for fast incremental scans)
    CREATE TABLE IF NOT EXISTS files_index (
      path TEXT PRIMARY KEY,
      size INTEGER NOT NULL,
      last_modified INTEGER NOT NULL,
      mime_type TEXT,
      partial_hash TEXT,
      full_hash TEXT,
      perceptual_hash TEXT,
      scanned_at INTEGER NOT NULL
    );

    -- Quarantine / Trash Table (internal recycle bin)
    CREATE TABLE IF NOT EXISTS trash (
      id TEXT PRIMARY KEY,
      original_path TEXT NOT NULL,
      quarantine_path TEXT NOT NULL,
      source TEXT NOT NULL, -- 'mediastore' | 'filesystem'
      size INTEGER NOT NULL,
      deleted_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );

    -- History of freed space
    CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY,
      date INTEGER NOT NULL,
      bytes_in_trash INTEGER NOT NULL,
      bytes_freed INTEGER NOT NULL,
      category TEXT NOT NULL
    );

    -- Scan Runs
    CREATE TABLE IF NOT EXISTS scan_runs (
      id TEXT PRIMARY KEY,
      date INTEGER NOT NULL,
      module TEXT NOT NULL,
      duration_ms INTEGER NOT NULL,
      bytes_found INTEGER NOT NULL
    );

    -- Debloat Backups
    CREATE TABLE IF NOT EXISTS debloat_backups (
      id TEXT PRIMARY KEY,
      package_name TEXT NOT NULL,
      action TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
  `);
}
