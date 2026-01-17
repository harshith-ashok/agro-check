const devices = new Map();

function getDevice(deviceId) {
  if (!devices.has(deviceId)) {
    devices.set(deviceId, {
      device_id: deviceId,
      battery: 100,
      last_seen: null,
      data: null,
    });
  }
  return devices.get(deviceId);
}

function updateDevice(deviceId, data) {
  const device = getDevice(deviceId);

  device.data = data;
  device.last_seen = new Date().toISOString();
  device.battery = Math.max(device.battery - 0.1, 5); // drain battery slowly

  return device;
}

function getAllDevices() {
  return Array.from(devices.values());
}

module.exports = {
  getDevice,
  updateDevice,
  getAllDevices,
};
