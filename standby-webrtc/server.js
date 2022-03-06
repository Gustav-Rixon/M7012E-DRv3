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

app.get("/forward", (request, response) => {
  response.send("Turing forward")

  if (signal.hasOwnProperty("x") && signal.hasOwnProperty("y")) {
    DRDoubleSDK.sendCommand("navigate.target", { relative: true, x: signal.x, y: signal.y });
  }

});

app.get("/backward", (request, response) => {
  response.send("going backward");

  if (signal.hasOwnProperty("x") && signal.hasOwnProperty("y")) {
    DRDoubleSDK.sendCommand("navigate.target", { relative: true, x: signal.x, y: signal.y });
  }

});

app.get("/left", (request, response) => {
  response.send("Turing left")

  if (signal.hasOwnProperty("x") && signal.hasOwnProperty("y")) {
    DRDoubleSDK.sendCommand("navigate.target", { relative: true, x: signal.x, y: signal.y });
  }

});

app.get("/right", (request, response) => {
  response.send("Turing right")

  if (signal.hasOwnProperty("x") && signal.hasOwnProperty("y")) {
    DRDoubleSDK.sendCommand("navigate.target", { relative: true, x: signal.x, y: signal.y });
  }

});

app.get("/up", (request, response) => {
  response.send("Raising pole")
  DRDoubleSDK.sendCommand("base.pole.stand");
});

app.get("/down", (request, response) => {
  response.send("Lowering pole")
  DRDoubleSDK.sendCommand("base.pole.sit");
});

// Launch express server
const server = createServer(app);
server.listen(3000, '0.0.0.0', () => {
  console.info(`Server running on port: 3000`);
});

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
});
