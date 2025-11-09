import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || 'localhost',
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'postOfficeDatabase',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// testing to make sure connection works between node.js server and MySQL database
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('Connected to MySQL database')
    connection.release()
  } catch (err) {
    console.error('Error connecting to database:', err)
  }
}

testConnection();

export default pool;
