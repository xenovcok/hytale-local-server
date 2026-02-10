# Hytale Local Server

A fun local server implementation for Hytale, allowing you to run your own game server and connect with friends!

## Features

- 🎮 WebSocket-based real-time multiplayer server
- 👥 Player connection and management
- 💬 Chat system
- 🌍 Basic world state management
- ⚡ Real-time player movement and actions
- 🎯 Configurable server settings
- 📊 Server statistics and monitoring

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone this repository:
```bash
git clone https://github.com/xenovcok/hytale-local-server.git
cd hytale-local-server
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Starting the Server

To start the Hytale local server:

```bash
npm start
```

The server will start on port 8080 by default. You should see:
```
[Hytale Server] Starting server on port 8080...
[Hytale Server] Server started successfully!
[Hytale Server] Players can connect to ws://localhost:8080
```

### Connecting with a Client

To connect a test client to the server:

```bash
npm run client
```

Or with a custom username:

```bash
node client.js YourUsername
```

### Multiple Players

You can open multiple terminal windows and run the client command in each to simulate multiple players:

```bash
# Terminal 1
node client.js Alice

# Terminal 2
node client.js Bob

# Terminal 3
node client.js Charlie
```

### Running the Demo

To see all features in action with a scripted demo:

```bash
npm run demo
```

This will start a server and simulate multiple players joining, chatting, moving, and performing actions.

## Configuration

Edit `config.json` to customize your server settings:

```json
{
  "port": 8080,
  "maxPlayers": 10,
  "tickRate": 20,
  "worldSettings": {
    "worldName": "HytaleWorld",
    "seed": 12345,
    "difficulty": "normal",
    "pvp": true,
    "spawnProtection": true
  },
  "serverSettings": {
    "motd": "Welcome to Hytale Local Server!",
    "maxViewDistance": 10,
    "enableWhitelist": false
  }
}
```

## API Documentation

### Server Messages

The server sends the following message types to clients:

- `welcome`: Sent when a player first connects
- `playerJoined`: Broadcast when a new player joins
- `playerLeft`: Broadcast when a player disconnects
- `chat`: Chat messages from other players
- `playerMoved`: Player movement updates
- `playerAction`: Player action notifications
- `worldUpdate`: Periodic world state updates
- `serverShutdown`: Server shutdown notification

### Client Messages

Clients can send the following message types to the server:

- `join`: Join the server with a username
- `move`: Update player position
- `chat`: Send a chat message
- `action`: Perform a game action

### Example Client Usage

```javascript
const HytaleClient = require('./client');

const client = new HytaleClient('ws://localhost:8080');
client.connect('MyUsername');

// Send a chat message
client.chat('Hello, everyone!');

// Move player
client.move(10, 64, 10);

// Perform an action
client.performAction('wave');
```

## Project Structure

```
hytale-local-server/
├── server.js          # Main server implementation
├── client.js          # Example client implementation
├── config.json        # Server configuration
├── package.json       # Node.js package configuration
└── README.md          # This file
```

## Development

### Server Class

The `HytaleServer` class provides the following methods:

- `start()`: Start the server
- `stop()`: Gracefully shut down the server
- `handleConnection(ws, req)`: Handle new player connections
- `handleMessage(playerId, message)`: Process incoming messages
- `handleDisconnect(playerId)`: Handle player disconnections
- `broadcast(data, excludePlayerId)`: Send data to all connected players
- `tick()`: Game loop tick for world updates

## Contributing

Feel free to fork this project and submit pull requests with improvements!

## License

MIT

## Disclaimer

This is an unofficial fan-made project and is not affiliated with Hypixel Studios or Hytale. This server is for educational and entertainment purposes only.