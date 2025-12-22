const db = require('./database');
require('dotenv').config();

const createTables = async () => {
  try {
    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) CHECK (role IN ('sales', 'manager')) DEFAULT 'sales',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Leads table
    await db.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(100) NOT NULL,
        contact VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        requirement TEXT,
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        hpp DECIMAL(10,2) NOT NULL,
        margin DECIMAL(5,2) NOT NULL,
        price DECIMAL(10,2) GENERATED ALWAYS AS (hpp * (1 + margin/100)) STORED,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Projects/Deals table
    await db.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES leads(id),
        user_id INTEGER REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'waiting_approval',
        approved_by INTEGER REFERENCES users(id),
        approval_date TIMESTAMP,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Project Items table (multiple products per project)
    await db.query(`
      CREATE TABLE IF NOT EXISTS project_items (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id),
        product_id INTEGER REFERENCES products(id),
        negotiated_price DECIMAL(10,2) NOT NULL,
        quantity INTEGER DEFAULT 1,
        subtotal DECIMAL(10,2) GENERATED ALWAYS AS (negotiated_price * quantity) STORED
      )
    `);

    // Customers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER REFERENCES leads(id),
        user_id INTEGER REFERENCES users(id),
        subscription_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Customer Services table (multiple services per customer)
    await db.query(`
      CREATE TABLE IF NOT EXISTS customer_services (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        product_id INTEGER REFERENCES products(id),
        start_date DATE NOT NULL,
        end_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tables created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
};

createTables();