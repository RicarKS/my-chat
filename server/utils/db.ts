import Database from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { dirname } from 'path'
import { runMigrations } from '../database/migrator'

let _db: Database.Database | null = null

export function useDb(): Database.Database {
  if (_db) return _db

  const config = useRuntimeConfig()
  const dbPath = config.databasePath

  mkdirSync(dirname(dbPath), { recursive: true })

  _db = new Database(dbPath)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')

  runMigrations(_db)

  return _db
}
