import { Router } from "express";
import axios from "axios";
import { pool } from "../db";

const router = Router();

/**
 * Fetch latest sensor data for a single device from ESP API
 */
router.get("/fetch/:deviceId", async (req, res, next) => {
  try {
    const { deviceId } = req.params;

    // Pull from ESP temporary API
    const response = await axios.get(
      `http://localhost:4000/sensor/${deviceId}`
    );
    const data = response.data;

    // Insert into DB
    await pool.query(
      `
      INSERT INTO sensor_readings
      (device_id, soil_moisture, soil_ph, air_temp, humidity, battery, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        deviceId,
        data.soil_moisture,
        data.soil_ph,
        data.air_temp,
        data.humidity,
        data.battery,
      ]
    );

    res.json({ success: true, reading: data });
  } catch (err) {
    next(err);
  }
});

/**
 * Fetch latest sensor data for all user's systems
 */
router.post("/fetch-all", async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const [systems]: any = await pool.query(
      "SELECT device_id FROM systems WHERE user_id = ?",
      [userId]
    );

    const results: any[] = [];

    for (const s of systems) {
      try {
        const response = await axios.get(
          `http://localhost:4000/sensor/${s.device_id}`
        );
        const data = response.data;

        await pool.query(
          `
          INSERT INTO sensor_readings
          (device_id, soil_moisture, soil_ph, air_temp, humidity, battery, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
          `,
          [
            s.device_id,
            data.soil_moisture,
            data.soil_ph,
            data.air_temp,
            data.humidity,
            data.battery,
          ]
        );

        results.push({ deviceId: s.device_id, success: true });
      } catch (e) {
        results.push({ deviceId: s.device_id, success: false });
      }
    }

    res.json({ success: true, results });
  } catch (err) {
    next(err);
  }
});

/**
 * Manual sensor data entry
 */
router.post("/manual/:deviceId", async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const { soil_moisture, soil_ph, air_temp, humidity, battery } = req.body;

    if (
      soil_moisture === undefined ||
      soil_ph === undefined ||
      air_temp === undefined ||
      humidity === undefined ||
      battery === undefined
    ) {
      return res.status(400).json({ error: "Missing sensor fields" });
    }

    await pool.query(
      `
      INSERT INTO sensor_readings
      (device_id, soil_moisture, soil_ph, air_temp, humidity, battery, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
      [deviceId, soil_moisture, soil_ph, air_temp, humidity, battery]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
router.get("/fetch/:deviceId", async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const response = await axios.get(
      `http://localhost:4000/api/sensors/fetch/${deviceId}`
    );
    res.json(response.data);
  } catch (err) {
    next(err);
  }
});
export default router;
