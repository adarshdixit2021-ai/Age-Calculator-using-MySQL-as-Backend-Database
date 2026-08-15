const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Connection Configuration
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Adarsh123',
    database: 'age_calculator_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Database Connection Test
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ MySQL Connection Failed:', err.message);
    } else {
        console.log('✅ MySQL Database Connected Successfully!');
        connection.release();
    }
});

// 1. Route to FETCH latest records
app.get('/api/records', (req, res) => {
    const sql = 'SELECT * FROM users_dob ORDER BY created_at DESC LIMIT 10';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ error: 'Failed to fetch records.' });
        }
        res.json(results);
    });
});

// 2. Route to SAVE new record
app.post('/api/save-record', (req, res) => {
    const { name, dob, zodiac_sign, total_days_lived } = req.body;

    if (!name || !dob) {
        return res.status(400).json({ error: 'Name and DOB are required.' });
    }

    const sql = 'INSERT INTO users_dob (name, dob, zodiac_sign, total_days_lived) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, dob, zodiac_sign, total_days_lived], (err, result) => {
        if (err) {
            console.error('Database Error:', err);
            return res.status(500).json({ error: err.sqlMessage || err.message });
        }
        res.status(201).json({ message: 'Record saved successfully!', insertId: result.insertId });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running smoothly at: http://localhost:${PORT}`);
});