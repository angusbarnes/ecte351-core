CREATE TABLE IF NOT EXISTS user (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    account_role TEXT NOT NULL,
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS files (
    uuid TEXT PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_hash TEXT,
    file_size INTEGER
);

CREATE TABLE IF NOT EXISTS job_queue (
    job_id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_name TEXT NOT NULL,
    job_description TEXT,
    job_data TEXT,
    job_progress INTEGER
);