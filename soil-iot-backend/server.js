// server.js
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const PORT = 3003;

app.use(cors());
app.use(express.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "pass",
  database: "agritech",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ===== Auth Routes =====

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });

    // Generate random 6-char identity code
    const identity_code = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    const [result] = await pool.query(
      "INSERT INTO users (identity_code, name, email) VALUES (?, ?, ?)",
      [identity_code, name, email || null]
    );

    const [userRows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      result.insertId,
    ]);

    res.json({ success: true, user: userRows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { identityCode } = req.body;
    if (!identityCode)
      return res.status(400).json({ error: "identityCode required" });

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE identity_code = ?",
      [identityCode]
    );

    if (!rows.length)
      return res.status(404).json({ error: "Invalid identity code" });

    await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
      rows[0].id,
    ]);

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ===== Systems Routes =====

// Get all systems for a user
app.get("/api/systems/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const [systems] = await pool.query(
      "SELECT * FROM systems WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    res.json({ success: true, systems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch systems" });
  }
});

// Create system
app.post("/api/systems", async (req, res) => {
  try {
    const {
      userId,
      deviceId,
      name,
      region,
      latitude,
      longitude,
      farmSize,
      cropType,
      soilType,
      installationDate,
      notes,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO systems
      (user_id, device_id, name, region, latitude, longitude, farm_size, crop_type, soil_type, installation_date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        deviceId,
        name,
        region,
        latitude || null,
        longitude || null,
        farmSize || null,
        cropType || null,
        soilType || null,
        installationDate || null,
        notes || null,
      ]
    );

    const [rows] = await pool.query("SELECT * FROM systems WHERE id = ?", [
      result.insertId,
    ]);
    res.json({ success: true, system: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create system" });
  }
});

// ===== Sensors Routes =====

// Fetch sensor data for a device (mock example)
app.get("/api/sensors/fetch/:deviceId", async (req, res) => {
  const deviceId = req.params.deviceId;
  const data = {
    soil_moisture: +(Math.random() * 100).toFixed(2),
    soil_ph: +(Math.random() * 14).toFixed(2),
    air_temp: +(Math.random() * 45).toFixed(2),
    humidity: +(Math.random() * 100).toFixed(2),
    battery: +(Math.random() * 100).toFixed(2),
    timestamp: new Date().toISOString(),
  };
  res.json({ success: true, device_id: deviceId, data });
});

app.listen(PORT, () => console.log(`AgriTech backend running on port ${PORT}`));
