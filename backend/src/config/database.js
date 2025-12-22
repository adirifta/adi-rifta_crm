const { Pool } = require('pg');
require('dotenv').config();

// SIMPLE CONFIG FOR RAILWAY
const getDatabaseConfig = () => {
  // ALWAYS use DATABASE_URL if available (Railway provides this)
  if (process.env.DATABASE_URL) {
    console.log('🔗 Using DATABASE_URL from Railway');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    };
  }
  
  // Fallback for local development
  console.log('🔗 Using local database config');
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'crm_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  };
};

const pool = new Pool(getDatabaseConfig());

// Log the config (for debugging)
console.log('Database Config:', {
  hasDatabaseUrl: !!process.env.DATABASE_URL,
  host: pool.options.host || 'from-connection-string',
  database: pool.options.database || 'from-connection-string'
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};