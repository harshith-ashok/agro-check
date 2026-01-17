function random(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(2);
}

function generateSensorData(battery = 100, req) {
  return {
    device_id: req.deviceId,
    soil_moisture: random(20, 80),
    soil_ph: random(5.5, 7.5),
    air_temp: random(20, 38),
    humidity: random(40, 90),
    battery: +battery.toFixed(2),
    solar_voltage: random(0.4, 0.6),
    // timestamp: new Date().toISOString(),
  };
}

module.exports = {
  generateSensorData,
};
