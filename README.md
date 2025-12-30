# Log Viewer Application

A real-time web-based log viewer that receives UDP messages, timestamps them, and displays them with automatic updates.

## Features

- Listens for UDP messages on port 8889
- Automatically timestamps and appends messages to a log file
- Real-time web interface that updates automatically via WebSocket
- Configurable number of lines to display
- Dark theme interface optimized for log viewing

## Installation

```bash
npm install
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Send UDP messages to port 8889. The messages will appear in real-time on the web page.

## Sending Test Messages

You can test the application by sending UDP messages. Here are some examples:

### Using PowerShell (Windows):
```powershell
$udpClient = New-Object System.Net.Sockets.UdpClient
$bytes = [System.Text.Encoding]::ASCII.GetBytes("Test message from PowerShell")
$udpClient.Send($bytes, $bytes.Length, "localhost", 8889)
$udpClient.Close()
```

### Using netcat (Linux/Mac):
```bash
echo "Test message" | nc -u -w1 localhost 8889
```

### Using Node.js:
```javascript
const dgram = require('dgram');
const client = dgram.createSocket('udp4');
const message = Buffer.from('Test message from Node.js');

client.send(message, 8889, 'localhost', (err) => {
  client.close();
});
```

## Configuration

You can modify these settings in `server.js`:

- `UDP_PORT`: UDP port to listen on (default: 8889)
- `HTTP_PORT`: HTTP server port (default: 3000)
- `LOG_FILE`: Path to the log file (default: app.log in project directory)

## How It Works

1. The server listens for UDP messages on port 8889
2. When a message arrives, it's timestamped with local timezone in MM/DD/YYYY, HH:mm:ss format
3. The timestamped message is appended to `app.log`
4. All connected web clients are notified via WebSocket
5. The web page automatically updates to show the new entry

## Web Interface Controls

- **Show last N lines**: Enter the number of lines you want to display
- **Refresh button**: Manually reload the log entries
- **Auto-scroll**: The view automatically scrolls to the bottom when new entries arrive (unless you scroll up manually)
