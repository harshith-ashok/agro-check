import { Router } from "express";
import { pool } from "../db";

const router = Router();

/**
 * Get all systems for a user with latest sensor reading
 */
router.get("/user/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const [systems]: any = await pool.query(
      `
      SELECT s.*,
        r.soil_moisture,
        r.soil_ph,
        r.air_temp,
        r.humidity,
        r.battery,
        r.timestamp
      FROM systems s
      LEFT JOIN (
        SELECT *
        FROM sensor_readings sr1
        WHERE sr1.id = (
          SELECT sr2.id
          FROM sensor_readings sr2
          WHERE sr2.device_id = sr1.device_id
          ORDER BY sr2.timestamp DESC
          LIMIT 1
        )
      ) r ON s.device_id = r.device_id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `,
      [userId]
    );

    const formatted = systems.map((s: any) => {
      let status: "online" | "warning" | "offline" = "offline";

      if (s.timestamp) {
        const diff = Date.now() - new Date(s.timestamp).getTime();
        const mins = diff / 60000;

        if (mins < 10) status = "online";
        else if (mins < 60) status = "warning";
      }

      return {
        id: s.id,
        user_id: s.user_id,
        device_id: s.device_id,
        name: s.name,
        region: s.region,
        latitude: s.latitude,
        longitude: s.longitude,
        farm_size: s.farm_size,
        crop_type: s.crop_type,
        soil_type: s.soil_type,
        installation_date: s.installation_date,
        notes: s.notes,
        status,
        created_at: s.created_at,
        updated_at: s.updated_at,
        latest_reading: s.timestamp
          ? {
              soil_moisture: s.soil_moisture,
              soil_ph: s.soil_ph,
              air_temp: s.air_temp,
              humidity: s.humidity,
              battery: s.battery,
              timestamp: s.timestamp,
            }
          : null,
      };
    });

    res.json({
      success: true,
      systems: formatted,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Create a new system
 */
router.post("/", async (req, res, next) => {
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

    // Required fields
    if (!userId || !deviceId || !name || !region) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Prevent duplicate devices
    const [existing]: any = await pool.query(
      "SELECT id FROM systems WHERE device_id = ?",
      [deviceId]
    );

    if (existing.length) {
      return res.status(400).json({ error: "Device already registered" });
    }

    const [result]: any = await pool.query(
      `
      INSERT INTO systems
      (user_id, device_id, name, region, latitude, longitude, farm_size, crop_type, soil_type, installation_date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
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

    res.json({
      success: true,
      systemId: result.insertId,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Get a single system by ID
 */
router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;

    const [rows]: any = await pool.query("SELECT * FROM systems WHERE id = ?", [
      id,
    ]);

    if (!rows.length) {
      return res.status(404).json({ error: "System not found" });
    }

    res.json({
      success: true,
      system: rows[0],
    });
  } catch (err) {
    next(err);
  }
});

export default router;
