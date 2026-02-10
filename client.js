const WebSocket = require('ws');

class HytaleClient {
    constructor(serverUrl = 'ws://localhost:8080') {
        this.serverUrl = serverUrl;
        this.ws = null;
        this.playerId = null;
        this.username = null;
    }

    connect(username) {
        this.username = username;
        this.ws = new WebSocket(this.serverUrl);

        this.ws.on('open', () => {
            console.log(`[Client] Connected to server at ${this.serverUrl}`);
            this.send({
                type: 'join',
                username: this.username
            });
        });

        this.ws.on('message', (message) => {
            this.handleMessage(message);
        });

        this.ws.on('close', () => {
            console.log('[Client] Disconnected from server');
        });

        this.ws.on('error', (error) => {
            console.error('[Client] Connection error:', error);
        });
    }

    handleMessage(message) {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'welcome':
                    this.playerId = data.playerId;
                    console.log(`[Client] ${data.message}`);
                    console.log(`[Client] Your Player ID: ${this.playerId}`);
                    console.log(`[Client] World State:`, data.worldState);
                    break;

                case 'playerJoined':
                    console.log(`[Client] ${data.username} joined the server`);
                    break;

                case 'playerLeft':
                    console.log(`[Client] ${data.username} left the server`);
                    break;

                case 'chat':
                    console.log(`[Chat] ${data.username}: ${data.message}`);
                    break;

                case 'playerMoved':
                    // console.log(`[Client] Player ${data.playerId} moved to`, data.position);
                    break;

                case 'playerAction':
                    console.log(`[Client] ${data.username} performed: ${data.action}`);
                    break;

                case 'worldUpdate':
                    // console.log(`[Client] World update:`, data.worldState);
                    break;

                case 'serverShutdown':
                    console.log(`[Client] ${data.message}`);
                    break;

                default:
                    console.log('[Client] Received:', data);
            }
        } catch (error) {
            console.error('[Client] Error parsing message:', error);
        }
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    move(x, y, z) {
        this.send({
            type: 'move',
            position: { x, y, z }
        });
    }

    chat(message) {
        this.send({
            type: 'chat',
            message: message
        });
    }

    performAction(action) {
        this.send({
            type: 'action',
            action: action
        });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Example usage
if (require.main === module) {
    const client = new HytaleClient();
    const username = process.argv[2] || `Player_${Math.floor(Math.random() * 1000)}`;
    
    client.connect(username);

    // Simulate some player actions
    setTimeout(() => {
        client.chat('Hello, Hytale world!');
    }, 1000);

    setTimeout(() => {
        client.move(10, 64, 10);
    }, 2000);

    setTimeout(() => {
        client.performAction('wave');
    }, 3000);

    // Keep the client running
    process.on('SIGINT', () => {
        client.disconnect();
        process.exit(0);
    });
}

module.exports = HytaleClient;
