const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clientCount = 0;
let totalBytesReceived = 0;

function logMessage(message) {
  fs.appendFile('chat.log', message + '\n', (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
}

function reportNetworkUsage() {
  console.log(`Number of clients: ${clientCount}`);
  console.log(`Total bytes received: ${totalBytesReceived}`);
}

function broadcast(message, sender) {
  wss.clients.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}


wss.on('connection', (ws) => {
  console.log('Client connected');
  clientCount++;

  ws.name = 'Guest'; 

  ws.send('Please enter your name:'); 

  ws.on('message', (message) => {
    if (ws.name === 'Guest') { 
      ws.name = message; 
      ws.send(`Welcome, ${ws.name}!`);
      logMessage(`${ws.name} joined the chat.`);
      return;
    }

    const chatMessage = `${ws.name}: ${message}`; 
    console.log(chatMessage);
    logMessage(chatMessage);
    totalBytesReceived += Buffer.from(message).length;
  
    broadcast(chatMessage);
  });
});

setInterval(reportNetworkUsage, 10000);

server.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
