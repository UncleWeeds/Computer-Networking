
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const crypto = require('crypto');


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clientCount = 0;
let totalBytesReceived = 0;

const users = {
  'sam': crypto.createHash('sha256').update('password1').digest('hex'),
  'john': crypto.createHash('sha256').update('password2').digest('hex'),
  'Abhi': crypto.createHash('sha256').update('Abhi').digest('hex'),
};

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

function broadcast(message) {
  wss.clients.forEach((client) => {
      client.send(message);
  });
}


wss.on('connection', (ws) => {
  console.log('Client connected');
  clientCount++;
  //broadcast(`A new client has joined the chat room.`);

  ws.name = 'Guest'; 

  ws.on('message', (message) => {

    if (Buffer.isBuffer(message)) {
      message = message.toString(); 
    }

    if (!ws.isAuthenticated) {
      const [username, password] = message.split(':');
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  
      if (users[username] && users[username] === hashedPassword) {
        ws.isAuthenticated = true;
        //ws.name = username;
        ws.send('Authentication successful, please enter your name:');
        return; 
      } else {
        ws.send('Authentication failed, please try again.');
        ws.close();
        return;
      }
    }

    if (ws.name === 'Guest') { 
      ws.name = message; 
      //ws.send(`Welcome, ${ws.name}!`);
      logMessage(`${ws.name} joined the chat.`);
      broadcast(`${ws.name} joined the chat room.`);
      return;
    }
   
    const chatMessage = `${ws.name}: ${message}`; 
    console.log(chatMessage);
    logMessage(chatMessage);
    totalBytesReceived += Buffer.from(message).length;
    broadcast(chatMessage);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clientCount--;
    broadcast(`${ws.name} has left the chat room.`);
  });
});

setInterval(reportNetworkUsage, 10000);

server.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});