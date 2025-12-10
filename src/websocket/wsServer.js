const WebSocket = require('ws');
const locationService = require('../services/locationService');
const alertService = require('../services/alertService');

let wss;

function initWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    // Send initial data
    ws.send(JSON.stringify({ type: 'location', data: locationService.getLatestLocation() }));
    ws.send(JSON.stringify({ type: 'alerts', data: alertService.getAllAlerts() }));

    ws.on('message', (message) => {
      console.log('Received message:', message);
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  // Listen to service events and broadcast
  locationService.on('locationUpdate', (location) => {
    broadcast({ type: 'location', data: location });
  });

  alertService.on('newAlert', (alert) => {
    broadcast({ type: 'alert', data: alert });
  });
}

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

module.exports = { initWebSocket };