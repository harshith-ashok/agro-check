#!/bin/bash

# Create main folder
mkdir -p soil-iot-backend
cd soil-iot-backend || exit

# Initialize package.json
cat > package.json << 'EOF'
{
  "name": "soil-iot-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "axios": "^1.7.0",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
EOF

# Create utils folder and mockDB.js
mkdir -p utils
cat > utils/mockDB.js << 'EOF'
const users = [
  { id: 1, identity_code: "ABC123", name: "John Doe", email: "john@example.com", created_at: new Date().toISOString() },
];

const systems = [
  { id: 1, user_id: 1, device_id: "ESP001", name: "North Field", region: "North", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 2, user_id: 1, device_id: "ESP003", name: "South Field", region: "South", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const sensorReadings = {}; // device_id => latest reading

module.exports = { users, systems, sensorReadings };
EOF

# Create routes folder
mkdir -p routes

# auth.js
cat > routes/auth.js << 'EOF'
const express = require("express");
const router = express.Router();
const { users } = require("../utils/mockDB");

router.post("/register", (req, res) => {
  const { email, name } = req.body;
  const identity_code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const newUser = { id: users.length + 1, email, name, identity_code, created_at: new Date().toISOString() };
  users.push(newUser);
  res.json({ user: identity_code });
});

router.post("/login", (req, res) => {
  const { identityCode } = req.body;
  const user = users.find(u => u.identity_code === identityCode);
  if (!user) return res.status(404).json({ error: "Invalid identity code" });
  res.json({ user });
});

router.post("/verify", (req, res) => {
  const { identityCode } = req.body;
  const user = users.find(u => u.identity_code === identityCode);
  res.json({ success: !!user });
});

module.exports = router;
EOF

# systems.js
cat > routes/systems.js << 'EOF'
const express = require("express");
const router = express.Router();
const { systems, sensorReadings } = require("../utils/mockDB");

// Get all systems for user
router.get("/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const userSystems = systems
    .filter(s => s.user_id === userId)
    .map(s => ({
      ...s,
      status: sensorReadings[s.device_id] ? "online" : "offline",
      latest_reading: sensorReadings[s.device_id] || null,
    }));
  res.json({ success: true, systems: userSystems });
});

router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const system = systems.find(s => s.id === id);
  if (!system) return res.status(404).json({ error: "System not found" });
  res.json({ success: true, system });
});

router.post("/", (req, res) => {
  const { userId, deviceId, name, region } = req.body;
  const newSystem = {
    id: systems.length + 1,
    user_id: userId,
    device_id: deviceId,
    name,
    region,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  systems.push(newSystem);
  res.json({ success: true, system: newSystem });
});

module.exports = router;
EOF

# sensors.js
cat > routes/sensors.js << 'EOF'
const express = require("express");
const router = express.Router();
const axios = require("axios");
const { systems, sensorReadings } = require("../utils/mockDB");

// Fetch one sensor from mock server 4000
router.get("/fetch/:deviceId", async (req, res) => {
  const { deviceId } = req.params;
  try {
    const response = await axios.get(`http://localhost:4000/api/sensors/fetch/${deviceId}`);
    const data = response.data.data;
    sensorReadings[deviceId] = { ...data };
    res.json({ success: true, device_id: deviceId, latest_reading: sensorReadings[deviceId] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from ESP server" });
  }
});

// Fetch all sensors for a user
router.post("/fetch-all", async (req, res) => {
  const { userId } = req.body;
  const userSystems = systems.filter(s => s.user_id === userId);
  for (const sys of userSystems) {
    try {
      const response = await axios.get(`http://localhost:4000/api/sensors/fetch/${sys.device_id}`);
      sensorReadings[sys.device_id] = response.data.data;
    } catch (err) {
      console.log("Failed to fetch sensor", sys.device_id);
    }
  }
  res.json({ success: true });
});

// Manual data entry
router.post("/manual/:deviceId", (req, res) => {
  const { deviceId } = req.params;
  const { soil_moisture, soil_ph, air_temp, humidity, battery } = req.body;
  sensorReadings[deviceId] = { soil_moisture, soil_ph, air_temp, humidity, battery, timestamp: new Date().toISOString() };
  res.json({ success: true, latest_reading: sensorReadings[deviceId] });
});

module.exports = router;
EOF

# Done
echo "Folder structure and files created. Run 'npm install' and then 'npm run dev' to start the server."

