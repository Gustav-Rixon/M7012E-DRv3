// Log
var logs = document.querySelector("#logs");
function log(text) {
  console.log(text);
  logs.innerHTML += "<div>" + text + "</div>";
}

var socket = null;
function connectWebsocket() {
  // Note: This uses HTTP. For HTTPS use wss instead.
  socket = new WebSocket("ws://" + window.location.hostname + ":3000");
  log("socket")
  socket.onopen = function (event) { log("Connected to server"); };
  log(socket)
  socket.onclose = function () {
    log("Disconnected from server");
    endCall();
    socket = null;
    setTimeout(connectWebsocket, 1000);
  }

  // Receives signal from socket and parses it to JSON format for switch cases.
  socket.onmessage = function (event) {
    var signal = null;
    try {
      signal = JSON.parse(event.data);
      log(signal);
    } catch (e) {
      log(event.data);
    }

    if (signal) {
      // Note: DO NOT pass DRDoubleSDK commands directy from your driver or you will be opening a massive security hole to your robot. 
      // You should use your own command structure for your signaling server, then hard-code commands for the DRDoubleSDK on the robot side - just like we're doing right here.
      switch (signal.type) {

        // Check if a robot is connected to the socket pool.
        case "isRobotAvailable":
          sendToServer({ type: "robotIsAvailable", message: "Robot is here!" });
          log("Received availability check");
          break;

        case "startCall":
          log("startCall");
          DRDoubleSDK.sendCommand("webrtc.enable", {
            servers: signal.servers,
            transportPolicy: signal.transportPolicy || "all",
            manageCamera: true
          });
          break;

        case "endCall":
          endCall();
          break;

        case "candidate":
          log("Received signal");
          DRDoubleSDK.sendCommand("webrtc.signal", signal);
          break;

        // Raise the pole
        case "poleStand":
          DRDoubleSDK.sendCommand("base.pole.stand");
          break;

        // Lower the pole
        case "poleSit":
          DRDoubleSDK.sendCommand("base.pole.sit");
          break;

        // Stop pole movement
        case "poleStop":
          DRDoubleSDK.sendCommand("base.pole.stop");
          break;

        // Enable robot navigation
        case "enableNavigation":
          DRDoubleSDK.sendCommand("navigate.enable");
          break;

        // Drive robot forward, 500 ms
        case "driveForward":
          DRDoubleSDK.sendCommand("navigate.drive", { throttle: 0.5, turn: 0, powerDrive: false, disableTurn: false });
          break;

        // Drive robot backward, 500 ms
        case "driveBackward":
          DRDoubleSDK.sendCommand("navigate.drive", { throttle: -0.5, turn: 0, powerDrive: false, disableTurn: false });
          break;

        // Turn robot left, 500 ms
        case "turnLeft":
          DRDoubleSDK.sendCommand("navigate.drive", { throttle: 0, turn: -0.5, powerDrive: false, disableTurn: false });
          break;

        // Turn robot right, 500 ms
        case "turnRight":
          DRDoubleSDK.sendCommand("navigate.drive", { throttle: 0, turn: 0.5, powerDrive: false, disableTurn: false });
          break;
      }
    }
  };
}

connectWebsocket();
function sendToServer(message) {
  socket.send(JSON.stringify(message));
}

function endCall() {
  log("endCall");
  DRDoubleSDK.sendCommand("webrtc.disable");
  DRDoubleSDK.sendCommand("navigate.disable");
}

// DRDoubleSDK is preloaded in the web view on the robot, so it will show errors on the Glitch.com editor
if (typeof DRDoubleSDK === 'undefined' || DRDoubleSDK === null) {
  var DRDoubleSDK = {};
}

// Make sure the camera and webrtc modules are off, so we can use them.
DRDoubleSDK.sendCommand("camera.disable");
DRDoubleSDK.sendCommand("webrtc.disable");

// We must reset the watchdog faster than every 3 seconds, so D3 knows that our pages is still running ok.
DRDoubleSDK.resetWatchdog();
window.setInterval(() => {
  DRDoubleSDK.resetWatchdog();
  DRDoubleSDK.sendCommand("screensaver.nudge");
}, 2000);

DRDoubleSDK.sendCommand("events.subscribe", {
  events: [
    "DRWebRTC.signal"
  ]
});

// Subscribe to events that we want to receive.
DRDoubleSDK.on("event", (message) => {

  // Event messages include: { class: "DRNetwork", key: "info", data: {...} }
  switch (message.class + "." + message.key) {
    case "DRWebRTC.signal":
      sendToServer(message.data);
      break;
  }
});
