"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.get("/user/:userId", async (req, res, next) => {
    try {
        const [rows] = await db_1.pool.query(`
      SELECT s.*, r.soil_moisture, r.soil_ph, r.air_temp, r.humidity, r.battery, r.timestamp
      FROM systems s
      LEFT JOIN sensor_readings r ON r.id = (
        SELECT id FROM sensor_readings WHERE system_id = s.id ORDER BY timestamp DESC LIMIT 1
      )
      WHERE s.user_id = ?
    `, [req.params.userId]);
        res.json(rows);
    }
    catch (err) {
        next(err);
    }
});
router.get("/:id", async (req, res, next) => {
    try {
        const [rows] = await db_1.pool.query(`
      SELECT s.*, r.*
      FROM systems s
      LEFT JOIN sensor_readings r ON r.id = (
        SELECT id FROM sensor_readings WHERE system_id = s.id ORDER BY timestamp DESC LIMIT 1
      )
      WHERE s.id = ?
    `, [req.params.id]);
        res.json(rows[0]);
    }
    catch (err) {
        next(err);
    }
});
router.post("/", async (req, res, next) => {
    try {
        const data = req.body;
        const [existing] = await db_1.pool.query("SELECT id FROM systems WHERE device_id = ?", [data.device_id]);
        if (existing.length)
            return res.status(400).json({ error: "Device already exists" });
        await db_1.pool.query("INSERT INTO systems SET ?", [data]);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
router.put("/:id", async (req, res, next) => {
    try {
        await db_1.pool.query("UPDATE systems SET ? WHERE id = ?", [
            req.body,
            req.params.id,
        ]);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
router.delete("/:id", async (req, res, next) => {
    try {
        await db_1.pool.query("DELETE FROM systems WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
router.get("/:id/history", async (req, res, next) => {
    try {
        const limit = Number(req.query.limit) || 100;
        const days = Number(req.query.days) || 7;
        const [rows] = await db_1.pool.query(`
      SELECT * FROM sensor_readings
      WHERE system_id = ?
      AND timestamp >= NOW() - INTERVAL ? DAY
      ORDER BY timestamp DESC
      LIMIT ?
    `, [req.params.id, days, limit]);
        res.json(rows);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
