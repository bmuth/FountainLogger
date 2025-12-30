# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Overview

This is a real-time log viewer application that:
- Listens for UDP messages on port 8889
- Timestamps incoming messages with ISO 8601 format
- Appends them to `app.log` in the project root
- Broadcasts updates to connected web clients via WebSocket
- Displays logs in a web interface with configurable line limits

## Architecture

The application has two main components that communicate via WebSocket:

**Backend (server.js)**
- Express HTTP server on port 3000 serving static files from `public/`
- Socket.io WebSocket server for real-time updates
- UDP server (Node.js dgram) listening on port 8889
- REST API endpoint: `GET /api/logs/:lines` returns last n lines from log file

**Frontend (public/index.html)**
- Single-page application with embedded CSS and JavaScript
- Socket.io client connected to backend
- Auto-scrolling log display with smart scroll detection
- Client-side trimming to maintain max n entries in DOM

**Data Flow:**
1. UDP message arrives on port 8889
2. Backend timestamps it and appends to `app.log`
3. Backend emits `newLogEntry` event via Socket.io
4. All connected clients receive update and append to their DOM
5. Clients automatically trim old entries based on configured line limit

## Common Commands

Start the application:
```bash
npm start
```

Install dependencies:
```bash
npm install
```

## Configuration

All configuration constants are in server.js:
- `UDP_PORT` (line 12): UDP listening port, default 8889
- `LOG_FILE` (line 13): Log file path, default `app.log` in project root
- `HTTP_PORT` (line 14): Web server port, default 3000

## Testing

Send test UDP messages using PowerShell:
```powershell
$udpClient = New-Object System.Net.Sockets.UdpClient
$bytes = [System.Text.Encoding]::ASCII.GetBytes("Test message")
$udpClient.Send($bytes, $bytes.Length, "localhost", 8889)
$udpClient.Close()
```

Or using Node.js:
```javascript
const dgram = require('dgram');
const client = dgram.createSocket('udp4');
client.send(Buffer.from('Test message'), 8889, 'localhost', () => client.close());
```

## Log Format

Each log entry follows the format: `[MM/DD/YYYY, HH:mm:ss] message`

Timestamps are in local timezone (24-hour format). The frontend parses this format to separate timestamp from message for color-coded display.
