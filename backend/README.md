1. auth.ts - Authentication Routes

POST /api/auth/register - Generate new identity code
POST /api/auth/login - Login with identity code
POST /api/auth/verify - Check if code exists

2. systems.ts - System Management Routes

GET /api/systems/user/:userId - Get all user's systems
GET /api/systems/:id - Get single system
POST /api/systems - Create new system
PUT /api/systems/:id - Update system
DELETE /api/systems/:id - Delete system
GET /api/systems/:id/history - Get historical sensor data

3. sensors.ts - Sensor Data Routes

GET /api/sensors/fetch/:deviceId - Fetch from external API & store
POST /api/sensors/fetch-all - Fetch data for all user's systems
POST /api/sensors/manual/:deviceId - Manual data entry (for testing)
