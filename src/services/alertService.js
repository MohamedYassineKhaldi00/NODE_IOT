const EventEmitter = require('events');

class AlertService extends EventEmitter {
  constructor() {
    super();
    this.alerts = [];
  }

  addAlert(alert) {
    this.alerts.push(alert);
    this.emit('newAlert', alert);
  }

  getAllAlerts() {
    return this.alerts;
  }
}

module.exports = new AlertService();