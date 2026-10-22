const path = require('path');

let Database;

try {
  Database = require('better-sqlite3');
} catch {
  const { DatabaseSync } = require('node:sqlite');
  Database = class NodeSqliteAdapter {
    constructor(filename) {
      this._db = new DatabaseSync(filename);
    }
    pragma(str) {
      return this._db.exec(`PRAGMA ${str}`);
    }
    exec(sql) {
      return this._db.exec(sql);
    }
    prepare(sql) {
      return this._db.prepare(sql);
    }
    transaction(fn) {
      return (...args) => {
        this._db.exec('BEGIN');
        try {
          const res = fn(...args);
          this._db.exec('COMMIT');
          return res;
        } catch (e) {
          this._db.exec('ROLLBACK');
          throw e;
        }
      };
    }
  };
}

const db = new Database(process.env.DB_FILE || path.join(__dirname, 'classtrack.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, quota INTEGER NOT NULL DEFAULT 8
);
CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY, name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS batch_students (
  batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  PRIMARY KEY (batch_id, student_id)
);
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL,
  batch_id TEXT
);
CREATE TABLE IF NOT EXISTS class_students (
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  PRIMARY KEY (class_id, student_id)
);
CREATE TABLE IF NOT EXISTS attendance (
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('p','a','r')),  -- p=present, a=absent, r=record
  PRIMARY KEY (class_id, student_id)
);
`);

module.exports = db;
