#!/usr/bin/env node

/**
 * Demo script to showcase all features of the Hytale Local Server
 * This script starts a server and simulates multiple players interacting
 */

const HytaleServer = require('./server');
const HytaleClient = require('./client');

console.log('='.repeat(60));
console.log('Hytale Local Server - Feature Demo');
console.log('='.repeat(60));
console.log('');

// Start server
const server = new HytaleServer(8080);
server.start();

// Wait for server to initialize
setTimeout(() => {
    console.log('\n--- Connecting Players ---\n');
    
    // Create multiple clients
    const alice = new HytaleClient('ws://localhost:8080');
    const bob = new HytaleClient('ws://localhost:8080');
    const charlie = new HytaleClient('ws://localhost:8080');
    
    // Connect Alice
    alice.connect('Alice');
    
    // Connect Bob after 1 second
    setTimeout(() => {
        bob.connect('Bob');
    }, 1000);
    
    // Connect Charlie after 2 seconds
    setTimeout(() => {
        charlie.connect('Charlie');
    }, 2000);
    
    // Simulate player actions
    setTimeout(() => {
        console.log('\n--- Player Actions ---\n');
        alice.chat('Hey everyone!');
    }, 3000);
    
    setTimeout(() => {
        bob.chat('Hi Alice!');
        bob.move(5, 64, 5);
    }, 4000);
    
    setTimeout(() => {
        charlie.chat('Hello team!');
        charlie.performAction('wave');
    }, 5000);
    
    setTimeout(() => {
        alice.move(10, 65, 10);
        alice.performAction('jump');
    }, 6000);
    
    setTimeout(() => {
        bob.chat('This is awesome!');
    }, 7000);
    
    // Display server stats
    setTimeout(() => {
        console.log('\n--- Server Statistics ---\n');
        const stats = server.getServerStats();
        console.log(`Players online: ${stats.playerCount}`);
        console.log(`Server uptime: ${stats.uptime.toFixed(2)} seconds`);
        console.log(`World time: ${stats.worldState.timeOfDay.toFixed(2)}`);
        console.log(`Weather: ${stats.worldState.weather}`);
    }, 8000);
    
    // Cleanup
    setTimeout(() => {
        console.log('\n--- Shutting Down Demo ---\n');
        alice.disconnect();
        bob.disconnect();
        charlie.disconnect();
        
        setTimeout(() => {
            server.stop();
            setTimeout(() => {
                console.log('\n' + '='.repeat(60));
                console.log('Demo completed successfully!');
                console.log('='.repeat(60));
                process.exit(0);
            }, 1000);
        }, 1000);
    }, 9000);
    
}, 1000);

// Handle errors
process.on('uncaughtException', (error) => {
    console.error('Error:', error);
    process.exit(1);
});
