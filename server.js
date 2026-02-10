const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const config = require('./config.json');

class HytaleServer {
    constructor(port = 8080) {
        this.port = port;
        this.wss = null;
        this.players = new Map();
        this.worldState = {
            timeOfDay: 0,
            weather: 'clear',
            entities: []
        };
        this.tickRate = 20; // 20 ticks per second
        this.running = false;
        this.gameLoopInterval = null;
        this.WORLD_UPDATE_FREQUENCY = 100; // Broadcast world updates every 100 ticks
    }

    start() {
        this.wss = new WebSocket.Server({ port: this.port });
        console.log(`[Hytale Server] Starting server on port ${this.port}...`);

        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });

        this.wss.on('error', (error) => {
            console.error('[Hytale Server] WebSocket error:', error);
        });

        this.running = true;
        this.startGameLoop();

        console.log(`[Hytale Server] Server started successfully!`);
        console.log(`[Hytale Server] Players can connect to ws://localhost:${this.port}`);
    }

    handleConnection(ws, req) {
        const playerId = uuidv4();
        const playerInfo = {
            id: playerId,
            username: null,
            position: { x: 0, y: 64, z: 0 },
            health: 100,
            connectedAt: new Date(),
            ws: ws
        };

        console.log(`[Hytale Server] New connection attempt: ${playerId}`);

        ws.on('message', (message) => {
            this.handleMessage(playerId, message);
        });

        ws.on('close', () => {
            this.handleDisconnect(playerId);
        });

        ws.on('error', (error) => {
            console.error(`[Hytale Server] Player ${playerId} error:`, error);
        });

        this.players.set(playerId, playerInfo);

        // Send welcome message
        this.sendToPlayer(playerId, {
            type: 'welcome',
            playerId: playerId,
            worldState: this.worldState,
            message: 'Welcome to Hytale Local Server!'
        });
    }

    handleMessage(playerId, message) {
        try {
            const data = JSON.parse(message);
            const player = this.players.get(playerId);

            switch (data.type) {
                case 'join':
                    player.username = data.username || `Player_${playerId.substring(0, 8)}`;
                    console.log(`[Hytale Server] ${player.username} joined the server`);
                    this.broadcast({
                        type: 'playerJoined',
                        playerId: playerId,
                        username: player.username
                    }, playerId);
                    break;

                case 'move':
                    if (data.position) {
                        player.position = data.position;
                        this.broadcast({
                            type: 'playerMoved',
                            playerId: playerId,
                            position: data.position
                        }, playerId);
                    }
                    break;

                case 'chat':
                    console.log(`[Chat] ${player.username}: ${data.message}`);
                    this.broadcast({
                        type: 'chat',
                        playerId: playerId,
                        username: player.username,
                        message: data.message
                    });
                    break;

                case 'action':
                    console.log(`[Hytale Server] ${player.username} performed action: ${data.action}`);
                    this.broadcast({
                        type: 'playerAction',
                        playerId: playerId,
                        username: player.username,
                        action: data.action
                    });
                    break;

                default:
                    console.log(`[Hytale Server] Unknown message type: ${data.type}`);
            }
        } catch (error) {
            console.error('[Hytale Server] Error parsing message:', error);
        }
    }

    handleDisconnect(playerId) {
        const player = this.players.get(playerId);
        if (player) {
            console.log(`[Hytale Server] ${player.username || playerId} disconnected`);
            this.broadcast({
                type: 'playerLeft',
                playerId: playerId,
                username: player.username
            });
            this.players.delete(playerId);
        }
    }

    sendToPlayer(playerId, data) {
        const player = this.players.get(playerId);
        if (player && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(data));
        }
    }

    broadcast(data, excludePlayerId = null) {
        const message = JSON.stringify(data);
        this.players.forEach((player, playerId) => {
            if (playerId !== excludePlayerId && player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(message);
            }
        });
    }

    startGameLoop() {
        const tickInterval = 1000 / this.tickRate;
        
        this.gameLoopInterval = setInterval(() => {
            if (this.running) {
                this.tick();
            }
        }, tickInterval);
    }

    tick() {
        // Update world state
        this.worldState.timeOfDay = (this.worldState.timeOfDay + 0.01) % 24;

        // Send periodic updates to all players
        if (Math.floor(this.worldState.timeOfDay * this.WORLD_UPDATE_FREQUENCY) % this.WORLD_UPDATE_FREQUENCY === 0) {
            this.broadcast({
                type: 'worldUpdate',
                worldState: this.worldState
            });
        }
    }

    getServerStats() {
        return {
            playerCount: this.players.size,
            uptime: process.uptime(),
            worldState: this.worldState
        };
    }

    stop() {
        console.log('[Hytale Server] Shutting down server...');
        this.running = false;
        
        // Clear the game loop interval
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
        }
        
        this.broadcast({
            type: 'serverShutdown',
            message: 'Server is shutting down'
        });

        this.wss.close(() => {
            console.log('[Hytale Server] Server stopped');
        });
    }
}

// Start server if run directly
if (require.main === module) {
    const server = new HytaleServer(config.port || 8080);
    server.start();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        server.stop();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        server.stop();
        process.exit(0);
    });
}

module.exports = HytaleServer;
