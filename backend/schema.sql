CREATE DATABASE agritech;
USE agritech;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  identity_code CHAR(6) UNIQUE NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);

CREATE TABLE systems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  device_id VARCHAR(100) UNIQUE,
  name VARCHAR(255),
  region VARCHAR(255),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  farm_size FLOAT,
  crop_type VARCHAR(255),
  soil_type VARCHAR(255),
  installation_date DATE,
  notes TEXT,
  status ENUM('online','warning','offline') DEFAULT 'offline',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE sensor_readings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  system_id INT,
  device_id VARCHAR(100),
  soil_moisture FLOAT,
  soil_ph FLOAT,
  air_temp FLOAT,
  humidity FLOAT,
  battery FLOAT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE CASCADE
);
