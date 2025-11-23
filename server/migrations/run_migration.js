import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'Seagrams7',
      database: 'dbver17',
      multipleStatements: true
    });

    console.log('Connected to MySQL database');

    // Read the migration SQL file
    const sqlFile = path.join(__dirname, 'add_customer_soft_delete.sql');
    const sql = await fs.readFile(sqlFile, 'utf8');

    console.log('Running migration...');

    // Execute the SQL
    const [results] = await connection.query(sql);

    console.log('Migration completed successfully!');
    console.log('Added is_deleted and deleted_at columns to customer table');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
