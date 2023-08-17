const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
  });

  ws.send('Welcome to the chat server!');
});

server.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
