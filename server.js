// server.js

const express = require('express');
const SocketServer = require('ws').Server;
const uuid = require('node-uuid');


// Set the port to 4000
const PORT = 4000;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  console.log('Client connected');
  wss.broadcast(JSON.stringify({type: "updateOnlineUsers", onlineUsers: wss.clients.length}));

  ws.on('message', function incoming(jsonMessage) {
    let message = JSON.parse(jsonMessage);
    message.key = uuid.v1();

    let outMessage = JSON.stringify(message);
    wss.broadcast(outMessage);

  })
  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log('Client disconnected');
    wss.broadcast(JSON.stringify({type: "updateOnlineUsers", onlineUsers: wss.clients.length}));
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client){
    client.send(data);
  });
}
