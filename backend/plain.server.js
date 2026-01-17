const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

app.post("/api/sensor-data", async (req, res) => {
  try {
    const {
      device_id,
      soil_moisture,
      soil_ph,
      air_temp,
      humidity,
      battery,
      solar_voltage,
    } = req.body;

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

    res.json({ success: true, message: "Data recorded" });
  } catch (error) {
    console.error("Record sensor data error:", error);
    res.status(500).json({ error: "Failed to record sensor data" });
  }
});

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
