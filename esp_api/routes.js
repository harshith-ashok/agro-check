const express = require("express");
const { generateSensorData } = require("./generator");
const { getDevice, updateDevice, getAllDevices } = require("./devices");

const router = express.Router();

/**
 * GET sensor data for a device (mock pull)
 */
router.get("/data/:deviceId", (req, res) => {
  const { deviceId } = req.params;

  const device = getDevice(deviceId);
  const data = generateSensorData(device.battery, req.params);
  const updated = updateDevice(deviceId, data);

  res.json(updated.data);
});

/**
 * POST real sensor data (ESP8266 push)
 */
router.post("/push/:deviceId", (req, res) => {
  const { deviceId } = req.params;
  const payload = req.body;

  if (!payload.soil_moisture || !payload.air_temp) {
    return res.status(400).json({ error: "Invalid sensor payload" });
  }

  const updated = updateDevice(deviceId, {
    ...payload,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: "Data received",
    device: updated,
  });
});

/**
 * View all devices (debug)
 */
router.get("/devices", (req, res) => {
  res.json({
    success: true,
    devices: getAllDevices(),
  });
});

module.exports = router;
