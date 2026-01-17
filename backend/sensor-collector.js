const axios = require('axios');

// Configuration
const SENSOR_API_URL = 'YOUR_SENSOR_API_ENDPOINT';
const AGRITECH_API_URL = 'http://localhost:3000/api/sensor-data';
const COLLECTION_INTERVAL = 10 * 60 * 1000; // 10 minutes

async function fetchAndStoreSensorData() {
  try {
    console.log(`[${new Date().toISOString()}] Fetching sensor data...`);
    
    // Fetch data from your sensor API
    const response = await axios.get(SENSOR_API_URL);
    const sensorData = response.data;
    
    // Validate data format
    if (!sensorData.device_id || 
        sensorData.soil_moisture === undefined ||
        sensorData.soil_ph === undefined ||
        sensorData.air_temp === undefined ||
        sensorData.humidity === undefined ||
        sensorData.battery === undefined ||
        sensorData.solar_voltage === undefined) {
      throw new Error('Invalid sensor data format');
    }
    
    // Send to AgriTech API
    await axios.post(AGRITECH_API_URL, sensorData);
    
    console.log(`[${new Date().toISOString()}] Data stored successfully for ${sensorData.device_id}`);
    console.log(`  Soil Moisture: ${sensorData.soil_moisture}%`);
    console.log(`  Soil pH: ${sensorData.soil_ph}`);
    console.log(`  Temperature: ${sensorData.air_temp}°C`);
    console.log(`  Humidity: ${sensorData.humidity}%`);
    console.log(`  Battery: ${sensorData.battery}%`);
    console.log(`  Solar: ${sensorData.solar_voltage}V`);
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to collect data:`, error.message);
  }
}

// Initial run
fetchAndStoreSensorData();

// Schedule periodic collection
setInterval(fetchAndStoreSensorData, COLLECTION_INTERVAL);

console.log(`Sensor data collector started. Collecting every ${COLLECTION_INTERVAL / 60000} minutes.`);
