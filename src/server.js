require('dotenv').config();
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { initWebSocket } = require('./websocket/wsServer');
const routes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SocketIOT Backend API',
    version: '1.0.0',
    description: 'Secure bridge backend for Flutter mobile app and React web admin dashboard',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Development server',
    },
  ],
  components: {
    schemas: {
      Destination: {
        type: 'object',
        required: ['lat', 'lng'],
        properties: {
          lat: {
            type: 'number',
            description: 'Latitude of the destination',
            example: 37.7749,
          },
          lng: {
            type: 'number',
            description: 'Longitude of the destination',
            example: -122.4194,
          },
        },
      },
      SpeedLimit: {
        type: 'object',
        required: ['speedLimit'],
        properties: {
          speedLimit: {
            type: 'number',
            description: 'Speed limit in km/h',
            example: 60,
          },
        },
      },
      Location: {
        type: 'object',
        properties: {
          lat: {
            type: 'number',
            example: 37.7749,
          },
          lng: {
            type: 'number',
            example: -122.4194,
          },
        },
      },
      Alert: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Speed alert',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2023-12-10T10:00:00Z',
          },
        },
      },
    },
  },
  paths: {
    '/send-destination': {
      post: {
        summary: 'Send destination to mobile app',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Destination',
              },
              example: {
                lat: 37.7749,
                lng: -122.4194,
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Destination sent successfully',
            content: {
              'application/json': {
                example: { success: true },
              },
            },
          },
          400: {
            description: 'Bad request',
            content: {
              'application/json': {
                example: { error: 'lat and lng required' },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                example: { error: 'SSH not connected' },
              },
            },
          },
        },
      },
    },
    '/location': {
      get: {
        summary: 'Get latest location from mobile app',
        responses: {
          200: {
            description: 'Latest location',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Location',
                },
                example: { lat: 37.7749, lng: -122.4194 },
              },
            },
          },
        },
      },
    },
    '/alerts': {
      get: {
        summary: 'Get all speed alerts',
        responses: {
          200: {
            description: 'List of alerts',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Alert',
                  },
                },
                example: [
                  { message: 'Speed alert', timestamp: '2023-12-10T10:00:00Z' },
                ],
              },
            },
          },
        },
      },
    },
    '/set-speed-limit': {
      post: {
        summary: 'Set speed limit for mobile app',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SpeedLimit',
              },
              example: { speedLimit: 60 },
            },
          },
        },
        responses: {
          200: {
            description: 'Speed limit set successfully',
            content: {
              'application/json': {
                example: { success: true },
              },
            },
          },
          400: {
            description: 'Bad request',
            content: {
              'application/json': {
                example: { error: 'speedLimit required' },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                example: { error: 'SSH not connected' },
              },
            },
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

app.use(express.json());
app.use('/', routes);

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});

initWebSocket(server);

// Simulate receiving data from mobile via SSH
// In real implementation, integrate with sshClient.receiveData
// For demo, mock some data
setTimeout(() => {
  const locationService = require('./services/locationService');
  const alertService = require('./services/alertService');
  const { decrypt } = require('./services/crypto');

  // Mock encrypted data
  const mockLocation = { lat: 37.7749, lng: -122.4194 };
  const mockAlert = { message: 'Speed alert', timestamp: new Date() };

  locationService.updateLocation(mockLocation);
  alertService.addAlert(mockAlert);
}, 10000);