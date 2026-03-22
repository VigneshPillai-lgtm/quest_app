require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve landing page as default
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing-page.html'));
});

// Serve other static files (CSS, JS, HTML files that aren't index)
app.use(express.static(path.join(__dirname)));

// Initialize Neon Database Connection
let db;

async function initializeDatabase() {
  try {
    db = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    await db.connect();
    console.log("Connected to Neon PostgreSQL database.");

    // Create tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        xp INTEGER DEFAULT 0,
        isAdmin BOOLEAN DEFAULT false,
        repoLink TEXT DEFAULT '',
        driveLink TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS user_venues (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        venue_id TEXT NOT NULL,
        visited BOOLEAN DEFAULT false,
        completed BOOLEAN DEFAULT false,
        task TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(email, venue_id),
        FOREIGN KEY (email) REFERENCES users(email)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS newsletter (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        subscribed BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS faq (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category TEXT NOT NULL,
        order_num INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        devpost_link TEXT,
        category TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log("Database tables initialized successfully.");
  } catch (err) {
    console.error("Error connecting to database:", err.message);
    // Retry connection after delay
    setTimeout(initializeDatabase, 5000);
  }
}

// Initialize Database on startup
initializeDatabase();

// ==========================================
// ROUTES - Landing Page
// ==========================================

// Newsletter subscription
app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    const result = await db.query(
      'INSERT INTO newsletter (email) VALUES ($1) ON CONFLICT (email) DO NOTHING RETURNING *',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Email already subscribed' });
    }

    res.json({ success: true, message: 'Successfully subscribed!' });
  } catch (error) {
    console.error('Newsletter error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get FAQ
app.get('/api/faq', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM faq ORDER BY order_num ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('FAQ error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get projects
app.get('/api/projects', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Projects error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ==========================================
// ROUTES - Authentication (from previous Skyfall app)
// ==========================================

// Register
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING email, xp',
      [email, hash]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    if (error.message.includes('duplicate')) {
      return res.status(400).json({ error: 'Email already exists. Try logging in.' });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.json({
      success: true,
      user: {
        email: user.email,
        xp: user.xp,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get user profile
app.get('/api/user/:email', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT email, xp, isAdmin, repoLink, driveLink FROM users WHERE email = $1',
      [req.params.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update user profile
app.post('/api/user/update/:email', async (req, res) => {
  const { repoLink, driveLink } = req.body;
  const email = req.params.email;

  try {
    const result = await db.query(
      'UPDATE users SET repoLink = $1, driveLink = $2 WHERE email = $3 RETURNING *',
      [repoLink || '', driveLink || '', email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ==========================================
// ROUTES - Venues (for quest functionality)
// ==========================================

app.post('/api/venues/visit', async (req, res) => {
  const { email, venueId, task } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO user_venues (email, venue_id, visited, task) 
       VALUES ($1, $2, true, $3) 
       ON CONFLICT (email, venue_id) DO UPDATE SET visited = true 
       RETURNING *`,
      [email, venueId, task]
    );

    res.json({ success: true, venue: result.rows[0] });
  } catch (error) {
    console.error('Venue visit error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/venues/:email', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM user_venues WHERE email = $1 ORDER BY created_at',
      [req.params.email]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Venues fetch error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ==========================================
// ERROR HANDLING
// ==========================================

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ==========================================
// SERVER START
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Landing page: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  if (db) {
    await db.end();
  }
  process.exit(0);
});
