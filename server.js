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

        db.run(`CREATE TABLE IF NOT EXISTS user_blocks (
            email TEXT,
            block_id TEXT,
            visited BOOLEAN DEFAULT 0,
            completed BOOLEAN DEFAULT 0,
            task TEXT,
            PRIMARY KEY (email, block_id),
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
        return res.json({ success: true, user: { email, xp: 0, isAdmin: true }, blocks: {} });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(400).json({ error: 'Account not found' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Incorrect password' });

        // Fetch their block progress
        db.all('SELECT * FROM user_blocks WHERE email = ?', [email], (err, blocks) => {
            const blocksObj = {};
            if (!err && blocks) {
                blocks.forEach(b => {
                    blocksObj[b.block_id] = { visited: !!b.visited, completed: !!b.completed, task: b.task };
                });
            }
            res.json({ success: true, user: { email: user.email, xp: user.xp, isAdmin: !!user.isAdmin }, blocks: blocksObj });
        });
    });
});

// Sync Progress Endpoint
app.post('/api/sync', (req, res) => {
    const { email, xp, blocks } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    // Update XP
    db.run('UPDATE users SET xp = ? WHERE email = ?', [xp, email]);

    // Update/Insert Blocks
    if (blocks && Object.keys(blocks).length > 0) {
        const stmt = db.prepare(`
            INSERT INTO user_blocks (email, block_id, visited, completed, task) 
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(email, block_id) DO UPDATE SET 
            visited=excluded.visited, completed=excluded.completed, task=excluded.task
        `);

        for (const [blockId, data] of Object.entries(blocks)) {
            stmt.run(email, blockId, data.visited ? 1 : 0, data.completed ? 1 : 0, data.task || '');
        }
        stmt.finalize();
    }

    res.json({ success: true });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Skyfall Backend running on http://localhost:${PORT}`);
});
