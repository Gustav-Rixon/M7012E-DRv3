const { createServer } = require("http");
const express = require("express");
const WebSocket = require("ws");

// Configure express for serving files
const app = express();
app.use(express.json({ extended: false }));
app.use(express.static("public"));
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/driver.html");
});
app.get("/robot", (request, response) => {
  response.sendFile(__dirname + "/public/robot.html");
});



// Launch express server
const server = createServer(app);
server.listen(3000, '0.0.0.0', () => {
  console.info(`Server running on port: 3000`);
}
);

// Launch websocket server
const webSocketServer = new WebSocket.Server({ server });
webSocketServer.on("connection", socket => {
  console.info("Total connected clients:", webSocketServer.clients.size);
  app.locals.clients = webSocketServer.clients;

  // Send all messages to all other clients
  socket.on("message", message => {
    webSocketServer.clients.forEach(client => {
      if (client != socket && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // End call when any client disconnects
  socket.on("close", () => {
    webSocketServer.clients.forEach(client => {
      if (client != socket && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "endCall" }));
      }
    });
  });

  socket.send("Hello from server");



  // Define API endpoints

  app.get("/poleStand", (request, response) => {
    response.send("Raising pole")
    socket.send(JSON.stringify({ type: 'poleStand' }))
  });

  app.get("/poleSit", (request, response) => {
    response.send("Lowering pole")
    socket.send(JSON.stringify({ type: 'poleSit' }))
  });

  app.get("/poleStop", (request, response) => {
    response.send("Stop pole")
    socket.send(JSON.stringify({ type: 'poleStop' }))
  });

  app.get("/enableNavigation", (request, response) => {
    response.send("Enableling navigation")
    socket.send(JSON.stringify({ type: 'enableNavigation' }))
  });

  app.get("/driveForward", (request, response) => {
    response.send("Driveing forward")
    socket.send(JSON.stringify({ type: 'driveForward' }))
  });

  app.get("/driveBackward", (request, response) => {
    response.send("Driveing backward")
    socket.send(JSON.stringify({ type: 'driveBackward' }))
  });

  app.get("/turnLeft", (request, response) => {
    response.send("turnLeft")
    socket.send(JSON.stringify({ type: 'turnLeft' }))
  });

  app.get("/turnRight", (request, response) => {
    response.send("turnRight")
    socket.send(JSON.stringify({ type: 'turnRight' }))
  });

});

