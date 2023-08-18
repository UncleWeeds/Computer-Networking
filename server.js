const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function logMessage(message) {
  fs.appendFile('chat.log', message + '\n', (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    logMessage(`Received: ${message}`);
  });

  ws.send('Welcome to the chat server!');
});

server.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
