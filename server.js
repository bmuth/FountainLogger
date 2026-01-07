require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const dgram = require('dgram');
const mysql = require('mysql2/promise');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const UDP_PORT = 8889;
const HTTP_PORT = 3000;

// MySQL Database Configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  waitForConnections: true,
  queueLimit: 0
};

let pool;

async function initializeDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    console.log('✓ MySQL database connected');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        timestamp DATETIME(3) NOT NULL,
        fountain TINYINT(1) UNSIGNED NOT NULL,
        message VARCHAR(1024) NOT NULL,
        INDEX idx_timestamp (timestamp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Database table initialized');

    connection.release();
    return true;
  } catch (error) {
    console.error('✗ Database initialization failed:', error);
    console.error('  Make sure MariaDB is running and credentials in .env are correct');
    process.exit(1);
  }
}

// Parse UDP message in format: "fountain message"
function parseUdpMessage(message) {
  const trimmed = message.trim();
  if (!trimmed) {
    console.warn('Empty UDP message received');
    return null;
  }

  const spaceIndex = trimmed.indexOf(' ');

  // No space found - entire message is the fountain number, empty text
  if (spaceIndex === -1) {
    const fountain = parseInt(trimmed, 10);
    if (isNaN(fountain) || fountain < -32768 || fountain > 32767) {
      console.warn(`Invalid fountain number: "${trimmed}" (must be between -32768 and 32767)`);
      return null;
    }
    return { fountain, message: '' };
  }

  const fountainPart = trimmed.substring(0, spaceIndex);
  const fountain = parseInt(fountainPart, 10);

  if (isNaN(fountain) || fountain < -32768 || fountain > 32767) {
    console.warn(`Invalid fountain number: "${fountainPart}" (must be between -32768 and 32767)`);
    return null;
  }

  let messageText = trimmed.substring(spaceIndex + 1);
  if (messageText.length > 1024) {
    console.warn(`Message text truncated from ${messageText.length} to 1024 characters`);
    messageText = messageText.substring(0, 1024);
  }

  return { fountain, message: messageText };
}

// Serve static files from public directory
app.use(express.static('public'));

// UDP Server setup
const udpServer = dgram.createSocket('udp4');

udpServer.on('error', (err) => {
  console.error(`UDP server error:\n${err.stack}`);
  udpServer.close();
});

udpServer.on('message', async (msg, rinfo) => {
  const rawMessage = msg.toString();
  console.log(`Received UDP from ${rinfo.address}:${rinfo.port} - ${rawMessage}`);

  const parsed = parseUdpMessage(rawMessage);
  if (!parsed) {
    console.error('Failed to parse, skipping:', rawMessage);
    return;
  }

  const { fountain, message } = parsed;
  const timestamp = new Date();

  try {
    const [result] = await pool.execute(
      'INSERT INTO logs (timestamp, fountain, message) VALUES (?, ?, ?)',
      [timestamp, fountain, message]
    );

    console.log(`✓ Logged [ID: ${result.insertId}] ${fountain} | ${message}`);

    io.emit('newLogEntry', {
      id: result.insertId,
      timestamp: timestamp.toISOString(),
      fountain: fountain,
      message: message
    });
  } catch (err) {
    console.error('✗ Database insert error:', err);
  }
});

udpServer.on('listening', () => {
  const address = udpServer.address();
  console.log(`UDP server listening on ${address.address}:${address.port}`);
});

udpServer.bind(UDP_PORT);

// API endpoint to get last n lines
app.get('/api/logs/:lines', async (req, res) => {
  const numLines = parseInt(req.params.lines) || 10;
  const fountainFilter = req.query.fountain;

  if (numLines < 1 || numLines > 10000) {
    return res.status(400).json({ error: 'lines must be between 1 and 10000' });
  }

  try {
    let query = 'SELECT id, timestamp, fountain, message FROM logs';
    let params = [];

    // Add fountain filter if provided
    if (fountainFilter !== undefined && fountainFilter !== '') {
      const filterValue = parseInt(fountainFilter, 10);
      if (!isNaN(filterValue)) {
        query += ' WHERE fountain = ?';
        params.push(filterValue);
      }
    }

    query += ' ORDER BY timestamp DESC, id DESC LIMIT ?';
    params.push(numLines);

    const [rows] = await pool.execute(query, params);

    const entries = rows.reverse();
    res.json({ entries: entries, count: entries.length });
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Failed to query database' });
  }
});

// API endpoint to get logs from a specific timestamp
app.get('/api/logs/from', async (req, res) => {
  const timestampParam = req.query.timestamp;
  const fountainFilter = req.query.fountain;

  if (!timestampParam) {
    return res.status(400).json({ error: 'timestamp parameter is required' });
  }

  const targetDate = new Date(timestampParam);
  if (isNaN(targetDate.getTime())) {
    return res.status(400).json({ error: 'Invalid timestamp format' });
  }

  try {
    let query = 'SELECT id, timestamp, fountain, message FROM logs WHERE timestamp >= ?';
    let params = [targetDate];

    // Add fountain filter if provided
    if (fountainFilter !== undefined && fountainFilter !== '') {
      const filterValue = parseInt(fountainFilter, 10);
      if (!isNaN(filterValue)) {
        query += ' AND fountain = ?';
        params.push(filterValue);
      }
    }

    query += ' ORDER BY timestamp ASC, id ASC';

    const [rows] = await pool.execute(query, params);

    res.json({
      entries: rows,
      count: rows.length,
      requestedTimestamp: timestampParam,
      firstLogTimestamp: rows.length > 0 ? rows[0].timestamp : null
    });
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Failed to query database' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Initialize database then start HTTP server
initializeDatabase().then(() => {
  httpServer.listen(HTTP_PORT, () => {
    console.log(`HTTP server listening on http://localhost:${HTTP_PORT}`);
    console.log(`UDP server listening on port ${UDP_PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
