const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const { encrypt, decrypt } = require('./crypto');

class SSHClient {
  constructor() {
    this.conn = null;
    this.isConnected = false;
    this.reconnectInterval = 5000; // 5 seconds
    if (process.env.SSH_HOST && process.env.SSH_HOST !== 'localhost') {
      this.initConnection();
    } else {
      console.log('SSH connection skipped (demo mode)');
    }
  }

  initConnection() {
    this.conn = new Client();
    this.conn.on('ready', () => {
      console.log('SSH connection established');
      this.isConnected = true;
      // Here you might set up channels or listeners for receiving data
      // For simplicity, assuming the mobile app sends data via a channel or exec
    });

    this.conn.on('error', (err) => {
      console.error('SSH connection error:', err.message);
      this.isConnected = false;
      this.reconnect();
    });

    this.conn.on('end', () => {
      console.log('SSH connection ended');
      this.isConnected = false;
      this.reconnect();
    });

    this.conn.on('close', () => {
      console.log('SSH connection closed');
      this.isConnected = false;
      this.reconnect();
    });

    this.connect();
  }

  connect() {
    const privateKeyPath = process.env.SSH_PRIVATE_KEY_PATH;
    const privateKey = fs.readFileSync(path.resolve(privateKeyPath));

    this.conn.connect({
      host: process.env.SSH_HOST,
      port: process.env.SSH_PORT,
      username: process.env.SSH_USERNAME,
      privateKey: privateKey,
    });
  }

  reconnect() {
    if (!this.isConnected) {
      console.log('Attempting to reconnect SSH...');
      setTimeout(() => {
        this.initConnection();
      }, this.reconnectInterval);
    }
  }

  sendData(data) {
    if (!this.isConnected) {
      console.log('SSH not connected, data not sent:', data);
      return;
    }
    const encryptedData = encrypt(data);
    // Assuming sending via exec or a channel. For demo, using exec to echo or something.
    // In real scenario, you might have a persistent channel.
    this.conn.exec(`echo '${encryptedData}'`, (err, stream) => {
      if (err) throw err;
      stream.on('close', () => {
        console.log('Data sent via SSH');
      });
    });
  }

  // For receiving, you might need to set up a listener, e.g., via a reverse tunnel or polling.
  // This is simplified; in practice, the mobile might push data via SSH.
  receiveData(callback) {
    // Placeholder: perhaps poll or listen on a channel.
    // For this example, assume data is received via some mechanism.
  }
}

module.exports = new SSHClient();