const express = require('express');
const router = express.Router();
const locationService = require('../services/locationService');
const alertService = require('../services/alertService');
const sshClient = require('../services/sshClient');
const { encrypt } = require('../services/crypto');

// POST /send-destination
router.post('/send-destination', (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng required' });
  }
  const data = { type: 'destination', lat, lng };
  try {
    sshClient.sendData(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /location
router.get('/location', (req, res) => {
  res.json(locationService.getLatestLocation());
});

// GET /alerts
router.get('/alerts', (req, res) => {
  res.json(alertService.getAllAlerts());
});

// POST /set-speed-limit
router.post('/set-speed-limit', (req, res) => {
  const { speedLimit } = req.body;
  if (!speedLimit) {
    return res.status(400).json({ error: 'speedLimit required' });
  }
  const data = { type: 'speedLimit', speedLimit };
  try {
    sshClient.sendData(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;