import mysql from 'mysql';// or 'mysql' package
import dotenv from 'dotenv';
dotenv.config();

export const db = mysql.createConnection({
  host: process.env.DB_HOST,      // Database host
  user: process.env.DB_USER,           // Your database username
  password: process.env.DB_PASSWORD,           // Your database password
  database: process.env.DB_NAME // Your database name
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL as ID ' + db.threadId);
});

export default db;