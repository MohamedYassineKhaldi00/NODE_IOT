const EventEmitter = require('events');

class LocationService extends EventEmitter {
  constructor() {
    super();
    this.latestLocation = null;
  }

  updateLocation(location) {
    this.latestLocation = location;
    this.emit('locationUpdate', location);
  }

  getLatestLocation() {
    return this.latestLocation;
  }
}

module.exports = new LocationService();