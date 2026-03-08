const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error("Error opening database: ", err.message);
    else {
        console.log("Connected to SQLite database.");
        // Create tables
        db.run(`CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            xp INTEGER DEFAULT 0,
            isAdmin BOOLEAN DEFAULT 0
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS user_venues (
            email TEXT,
            venue_id TEXT,
            visited BOOLEAN DEFAULT 0,
            completed BOOLEAN DEFAULT 0,
            task TEXT,
            PRIMARY KEY (email, venue_id),
            FOREIGN KEY (email) REFERENCES users(email)
        )`);
    }
});

// Register Endpoint
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
        const hash = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Email already exists. Try logging in.' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ success: true, user: { email, xp: 0, isAdmin: false } });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    // Hardcoded Admin Bypass if requested
    if (email === 'vigroundq@gmail.com' && password === 'skyfall') {
        return res.json({ success: true, user: { email, xp: 0, isAdmin: true }, venues: {} });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(400).json({ error: 'Account not found' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Incorrect password' });

        // Fetch their venue progress
        db.all('SELECT * FROM user_venues WHERE email = ?', [email], (err, venues) => {
            const venuesObj = {};
            if (!err && venues) {
                venues.forEach(v => {
                    venuesObj[v.venue_id] = { visited: !!v.visited, completed: !!v.completed, task: v.task };
                });
            }
            res.json({ success: true, user: { email: user.email, xp: user.xp, isAdmin: !!user.isAdmin }, venues: venuesObj });
        });
    });
});

// Ping / health check (used to pre-warm the Render free instance)
app.get('/api/ping', (req, res) => res.json({ status: 'ok' }));

// Sync Progress Endpoint
app.post('/api/sync', (req, res) => {
    const { email, xp, venues } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    // Update XP
    db.run('UPDATE users SET xp = ? WHERE email = ?', [xp, email]);

    // Update/Insert Venues
    if (venues && Object.keys(venues).length > 0) {
        const stmt = db.prepare(`
            INSERT INTO user_venues (email, venue_id, visited, completed, task) 
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(email, venue_id) DO UPDATE SET 
            visited=excluded.visited, completed=excluded.completed, task=excluded.task
        `);

        for (const [venueId, data] of Object.entries(venues)) {
            stmt.run(email, venueId, data.visited ? 1 : 0, data.completed ? 1 : 0, data.task || '');
        }
        stmt.finalize();
    }

    res.json({ success: true });
});

// Admin endpoint to get all users and their progress
app.get('/api/admin/users', (req, res) => {
    // In a real app we'd authenticate the admin token here
    const { pwd } = req.query;
    if (pwd !== 'skyfall') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    db.all('SELECT email, xp, isAdmin FROM users WHERE isAdmin = 0 ORDER BY xp DESC', [], (err, users) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        db.all('SELECT email, venue_id, completed FROM user_venues WHERE completed = 1', [], (err, venues) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            // Map venues to users
            const usersWithVenues = users.map(user => {
                const userVenues = venues.filter(v => v.email === user.email);
                return {
                    email: user.email,
                    xp: user.xp,
                    completedCount: userVenues.length,
                    venues: userVenues.map(v => v.venue_id)
                };
            });

            res.json({ success: true, users: usersWithVenues });
        });
    });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Skyfall Backend running on http://localhost:${PORT}`);
});
