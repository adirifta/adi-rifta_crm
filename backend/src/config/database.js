const { Pool } = require('pg');
require('dotenv').config();

const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    console.log('Using Railway DATABASE_URL');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    };
  }
  
  // Docker Compose/Local development
  if (process.env.DB_HOST) {
    console.log('Using Docker/local database config');
    return {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'crm_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres'
    };
  }
  
  // Fallback to localhost (development)
  console.log('Using localhost fallback config');
  return {
    host: 'localhost',
    port: 5432,
    database: 'crm_db',
    user: 'postgres',
    password: 'postgres'
  };
};

const pool = new Pool(getDatabaseConfig());

// Test connection
pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Test connection function
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Database connection test successful');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    return false;
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  testConnection
};