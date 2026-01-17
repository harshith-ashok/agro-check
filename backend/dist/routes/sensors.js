"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const db_1 = require("../db");
const router = (0, express_1.Router)();
function getStatus(battery) {
    if (battery >= 3.0)
        return "online";
    if (battery >= 2.5)
        return "warning";
    return "offline";
}
router.get("/fetch/:deviceId", async (req, res, next) => {
    try {
        const { deviceId } = req.params;
        const response = await axios_1.default.get(process.env.SENSOR_API_URL, {
            params: { device_id: deviceId },
            timeout: 5000,
            headers: { Authorization: `Bearer ${process.env.SENSOR_API_KEY}` },
        });
        const data = response.data;
        const [systems] = await db_1.pool.query("SELECT id FROM systems WHERE device_id = ?", [deviceId]);
        if (!systems.length)
            return res.status(404).json({ error: "System not found" });
        const systemId = systems[0].id;
        await db_1.pool.query("INSERT INTO sensor_readings (system_id, device_id, soil_moisture, soil_ph, air_temp, humidity, battery) VALUES (?, ?, ?, ?, ?, ?, ?)", [
            systemId,
            data.device_id,
            data.soil_moisture,
            data.soil_ph,
            data.air_temp,
            data.humidity,
            data.battery,
        ]);
        await db_1.pool.query("UPDATE systems SET status = ? WHERE id = ?", [
            getStatus(data.battery),
            systemId,
        ]);
        res.json(data);
    }
    catch (err) {
        next(err);
    }
});
router.post("/fetch-all", async (req, res, next) => {
    try {
        const { user_id } = req.body;
        const [systems] = await db_1.pool.query("SELECT device_id FROM systems WHERE user_id = ?", [user_id]);
        for (const s of systems) {
            await axios_1.default.get(`http://localhost:3000/api/sensors/fetch/${s.device_id}`);
        }
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
router.post("/manual/:deviceId", async (req, res, next) => {
    try {
        const { deviceId } = req.params;
        const data = req.body;
        const [systems] = await db_1.pool.query("SELECT id FROM systems WHERE device_id = ?", [deviceId]);
        const systemId = systems[0].id;
        await db_1.pool.query("INSERT INTO sensor_readings (system_id, device_id, soil_moisture, soil_ph, air_temp, humidity, battery) VALUES (?, ?, ?, ?, ?, ?, ?)", [
            systemId,
            deviceId,
            data.soil_moisture,
            data.soil_ph,
            data.air_temp,
            data.humidity,
            data.battery,
        ]);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
