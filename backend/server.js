const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "pass",
  database: process.env.DB_NAME || "agritech",
  waitForConnections: true,
  connectionLimit: 10,
});

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SENSOR_API_URL = process.env.SENSOR_API_URL || "http://localhost:4000";
const COLLECTION_INTERVAL =
  parseInt(process.env.COLLECTION_INTERVAL) || 10 * 60 * 1000; // 10 minutes default

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Authentication routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    const token = jwt.sign({ userId: result.insertId }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: result.insertId, name, email } });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Systems routes
app.get("/api/systems", authMiddleware, async (req, res) => {
  try {
    const [systems] = await pool.query(
      `SELECT s.*, 
        (SELECT JSON_OBJECT(
          'soil_moisture', sd.soil_moisture,
          'soil_ph', sd.soil_ph,
          'air_temp', sd.air_temp,
          'humidity', sd.humidity,
          'battery', sd.battery,
          'solar_voltage', sd.solar_voltage,
          'created_at', sd.created_at
        ) FROM sensor_data sd 
        WHERE sd.system_id = s.id 
        ORDER BY sd.created_at DESC 
        LIMIT 1) as lastData
      FROM systems s 
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC`,
      [req.userId]
    );

    const parsedSystems = systems.map((s) => ({
      ...s,
      lastData: s.lastData ? JSON.parse(s.lastData) : null,
    }));

    res.json(parsedSystems);
  } catch (error) {
    console.error("Get systems error:", error);
    res.status(500).json({ error: "Failed to fetch systems" });
  }
});

app.get("/api/systems/:id", authMiddleware, async (req, res) => {
  try {
    const [systems] = await pool.query(
      "SELECT * FROM systems WHERE id = ? AND user_id = ?",
      [req.params.id, req.userId]
    );

    if (systems.length === 0) {
      return res.status(404).json({ error: "System not found" });
    }

    res.json(systems[0]);
  } catch (error) {
    console.error("Get system error:", error);
    res.status(500).json({ error: "Failed to fetch system" });
  }
});

app.post("/api/systems", authMiddleware, async (req, res) => {
  try {
    const { name, device_id } = req.body;

    const [result] = await pool.query(
      "INSERT INTO systems (user_id, name, device_id) VALUES (?, ?, ?)",
      [req.userId, name, device_id]
    );

    res.json({ id: result.insertId, name, device_id });
  } catch (error) {
    console.error("Create system error:", error);
    res.status(500).json({ error: "Failed to create system" });
  }
});

app.delete("/api/systems/:id", authMiddleware, async (req, res) => {
  try {
    const [system] = await pool.query(
      "SELECT * FROM systems WHERE id = ? AND user_id = ?",
      [req.params.id, req.userId]
    );

    if (system.length === 0) {
      return res.status(404).json({ error: "System not found" });
    }

    await pool.query("DELETE FROM systems WHERE id = ?", [req.params.id]);

    res.json({ success: true, message: "System deleted" });
  } catch (error) {
    console.error("Delete system error:", error);
    res.status(500).json({ error: "Failed to delete system" });
  }
});

app.get("/api/systems/:id/data", authMiddleware, async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;

    const [system] = await pool.query(
      "SELECT * FROM systems WHERE id = ? AND user_id = ?",
      [req.params.id, req.userId]
    );

    if (system.length === 0) {
      return res.status(404).json({ error: "System not found" });
    }

    const [data] = await pool.query(
      `SELECT * FROM sensor_data 
      WHERE system_id = ? 
      AND created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      ORDER BY created_at DESC`,
      [req.params.id, hours]
    );

    res.json(data);
  } catch (error) {
    console.error("Get sensor data error:", error);
    res.status(500).json({ error: "Failed to fetch sensor data" });
  }
});

// Sensor data endpoint (receives data from sensors or collector)
app.post("/api/sensor-data", async (req, res) => {
  try {
    const {
      device_id,
      soil_moisture,
      soil_ph,
      air_temp,
      humidity,
      battery,
      solar_voltage = 0, // Default to 0 if not provided
    } = req.body;

    // Validate required fields (solar_voltage is now optional)
    if (
      !device_id ||
      soil_moisture === undefined ||
      soil_ph === undefined ||
      air_temp === undefined ||
      humidity === undefined ||
      battery === undefined
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [systems] = await pool.query(
      "SELECT id FROM systems WHERE device_id = ?",
      [device_id]
    );

    if (systems.length === 0) {
      return res.status(404).json({ error: "Device not found" });
    }

    const systemId = systems[0].id;

    await pool.query(
      `INSERT INTO sensor_data 
      (system_id, soil_moisture, soil_ph, air_temp, humidity, battery, solar_voltage) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        systemId,
        soil_moisture,
        soil_ph,
        air_temp,
        humidity,
        battery,
        solar_voltage,
      ]
    );

    console.log(
      `[${new Date().toISOString()}] Data recorded for device: ${device_id}`
    );

    res.json({ success: true, message: "Data recorded" });
  } catch (error) {
    console.error("Record sensor data error:", error);
    res.status(500).json({ error: "Failed to record sensor data" });
  }
});

// Automatic sensor data collection function
async function collectSensorData() {
  try {
    console.log(
      `[${new Date().toISOString()}] Starting sensor data collection...`
    );

    // Get all registered systems/devices
    const [systems] = await pool.query("SELECT device_id FROM systems");

    if (systems.length === 0) {
      console.log(`[${new Date().toISOString()}] No systems registered yet.`);
      return;
    }

    // Collect data for each device
    for (const system of systems) {
      try {
        // Fetch data from sensor API - append device_id to URL or as query param
        // Adjust the URL format based on your sensor API endpoint structure
        const sensorUrl = `${SENSOR_API_URL}/api/sensors/data/${system.device_id}`;
        // Alternative: const sensorUrl = `${SENSOR_API_URL}/data?device=${system.device_id}`;

        console.log(
          `[${new Date().toISOString()}] Fetching data from: ${sensorUrl}`
        );

        const response = await axios.get(sensorUrl, {
          timeout: 10000, // 10 second timeout
        });

        const sensorData = response.data;

        // Validate the response format (solar_voltage is optional)
        if (
          !sensorData.device_id ||
          sensorData.soil_moisture === undefined ||
          sensorData.soil_ph === undefined ||
          sensorData.air_temp === undefined ||
          sensorData.humidity === undefined ||
          sensorData.battery === undefined
        ) {
          console.error(
            `[${new Date().toISOString()}] Invalid data format from ${
              system.device_id
            }`
          );
          continue;
        }

        // Add default solar_voltage if not provided
        if (sensorData.solar_voltage === undefined) {
          sensorData.solar_voltage = 0;
        }

        // Store the data using the same endpoint
        await axios.post(
          `http://localhost:${PORT}/api/sensor-data`,
          sensorData
        );

        console.log(
          `[${new Date().toISOString()}] ✓ Data collected for ${
            system.device_id
          }:`,
          {
            moisture: sensorData.soil_moisture,
            ph: sensorData.soil_ph,
            temp: sensorData.air_temp,
            humidity: sensorData.humidity,
            battery: sensorData.battery,
            solar: sensorData.solar_voltage,
          }
        );
      } catch (deviceError) {
        console.error(
          `[${new Date().toISOString()}] Failed to collect data for ${
            system.device_id
          }:`,
          deviceError.message
        );
      }
    }

    console.log(
      `[${new Date().toISOString()}] Sensor data collection completed.`
    );
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Sensor collection error:`,
      error.message
    );
  }
}

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Sensor API URL: ${SENSOR_API_URL}`);
  console.log(`Collection interval: ${COLLECTION_INTERVAL / 60000} minutes`);

  // Start automatic sensor data collection
  console.log("Starting automatic sensor data collection...");

  // Run immediately on startup
  collectSensorData();

  // Then run at specified intervals
  setInterval(collectSensorData, COLLECTION_INTERVAL);
});
