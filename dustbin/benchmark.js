const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("test.db"); // Use in-memory database for benchmarking

const NUM_RECORDS = 1000; // Number of records to write
const BATCH_SIZE = 30; // Batch size for transactions
const numBatches = Math.ceil(NUM_RECORDS / BATCH_SIZE);
let numWrites = 0; // Counter for completed writes
let startTime; // Timestamp when benchmark starts

// Function to create the table
function createTable() {
  db.run("PRAGMA journal_mode = WAL;");
  db.run(
    `
    CREATE TABLE IF NOT EXISTS benchmark (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      float_value REAL,
      int_value INTEGER,
      string_value TEXT,
      timestamp_value DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating table:", err);
        process.exit(1);
      }
      console.log("Table created successfully");
      startBenchmark();
    }
  );
}

// Function to start the benchmark
function startBenchmark() {
  startTime = Date.now();

  db.serialize(() => {
    const stmt = db.prepare(
      "INSERT INTO benchmark (float_value, int_value, string_value, timestamp_value) VALUES (?, ?, ?, ?)"
    );

    for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
      db.run("BEGIN TRANSACTION;"); // Start a transaction
      for (let i = 0; i < BATCH_SIZE; i++) {
        const recordIndex = batchIndex * BATCH_SIZE + i;
        if (recordIndex >= NUM_RECORDS) break; // Break if all records have been inserted

        const floatVal = Math.random() * 1000; // Random float value
        const intVal = Math.floor(Math.random() * 1000); // Random integer value
        const strVal = `String${recordIndex}`; // String value
        const timestampVal = new Date().toISOString(); // Current timestamp

        stmt.run(floatVal, intVal, strVal, timestampVal); // Execute the prepared statement
      }
      db.run("COMMIT;"); // Commit the transaction after all batches are inserted
    }

    stmt.finalize(); // Finalize the prepared statement for this batch
  });

  db.close(() => {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds
    const writesPerSecond = NUM_RECORDS / duration;
    console.log(`Benchmark completed in ${duration} seconds`);
    console.log(`Writes per second: ${writesPerSecond}`);
  });
}

// Create the table and start benchmark
createTable();
