
# Agro Check
## AgriTech Monitoring & Analytics Dashboard

A modern, real-time agricultural monitoring platform for tracking soil conditions, environmental metrics, and system health across distributed IoT sensor networks.

This platform is designed for precision agriculture, research institutions, greenhouse operators, and smart farming deployments that require reliable data collection, real-time insights, and actionable intelligence.

---

## Overview

The AgriTech Dashboard provides a full-stack solution for monitoring agricultural environments using IoT sensor nodes. It offers real-time visualization, historical analytics, intelligent recommendations, and a scalable backend architecture.

The system is built for production usage with strong security, modular architecture, and extensible APIs.

---

## Key Capabilities

### Real-Time Monitoring

* Live sensor data ingestion with automated 10-minute refresh cycles
* Multi-system dashboard with system-level status tracking
* Health indicators based on agricultural best practices
* Online, warning, and offline detection based on last update time

### Analytics & Insights

* Interactive charts for soil moisture, temperature, humidity, and battery health
* Historical trend analysis with configurable retention
* Crop health index derived from multiple sensor parameters
* Searchable and sortable system and sensor data tables

### Smart Recommendations

* Context-aware agronomic suggestions
* Critical alerts for low moisture, extreme temperatures, and poor soil pH
* Battery health and solar charging diagnostics
* Preventive maintenance indicators

### Security & Scalability

* JWT-based authentication and authorization
* User-level system isolation
* RESTful API architecture
* Automatic sensor polling and validation
* Horizontal scalability-ready backend design

### UI & Experience

* Responsive design across mobile, tablet, and desktop
* Minimalist, professional interface
* Smooth animations for data transitions
* Clean typography and spacing using Tailwind CSS

---

## System Architecture

### Frontend

* Vue 3 (Composition API with `<script setup>`)
* Vue Router
* Tailwind CSS v4 (CSS-based theming via `@theme`)
* Chart.js for visualization
* GSAP for animations
* Axios for API communication

### Backend

* Node.js with Express
* MySQL (connection pooling via mysql2)
* JWT authentication
* bcrypt password hashing
* Axios for external sensor API polling

---

## Quick Start

### Prerequisites

* Node.js 18+
* MySQL 8.0+
* npm or yarn

---

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd agritech-dashboard
```

---

#### 2. Database Setup

```bash
mysql -u root -p < backend/schema.sql
```

Ensure the MySQL service is running before executing the script.

---

#### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm start
```

The backend will start on:

```
http://localhost:3000
```

---

#### 4. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will start on:

```
http://localhost:5173
```

---

## Configuration

### Backend Environment Variables

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=agritech
JWT_SECRET=change-this-in-production

SENSOR_API_URL=http://localhost:4000
COLLECTION_INTERVAL=600000
```

---

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Sensor Integration

### Expected Sensor Payload

```json
{
  "device_id": "NODE_13",
  "soil_moisture": 65.5,
  "soil_ph": 6.3,
  "air_temp": 28.5,
  "humidity": 72,
  "battery": 92,
  "solar_voltage": 5.9
}
```

If `solar_voltage` is not available, it defaults to `0`.

---

### Sensor API Endpoint

The backend polls the following endpoint every collection cycle:

```
GET ${SENSOR_API_URL}/api/sensors/data/{device_id}
```

This can be modified in `server.js` if your sensor API uses a different structure.

---

## API Reference

### Authentication

| Method | Endpoint             | Description                       |
| ------ | -------------------- | --------------------------------- |
| POST   | `/api/auth/register` | Register a new user               |
| POST   | `/api/auth/login`    | Authenticate user and receive JWT |

---

### System Management

| Method | Endpoint                         | Description                | Authentication |
| ------ | -------------------------------- | -------------------------- | -------------- |
| GET    | `/api/systems`                   | Get all systems for user   | Required       |
| GET    | `/api/systems/:id`               | Get system by ID           | Required       |
| POST   | `/api/systems`                   | Create new system          | Required       |
| DELETE | `/api/systems/:id`               | Delete system              | Required       |
| GET    | `/api/systems/:id/data?hours=24` | Get historical sensor data | Required       |

---

### Sensor Data

| Method | Endpoint           | Description           | Authentication |
| ------ | ------------------ | --------------------- | -------------- |
| POST   | `/api/sensor-data` | Record sensor reading | Not required   |

---

## Dashboard Views

### Overview Dashboard

* Total systems summary
* Average environmental metrics
* System grid with real-time status
* Quick actions for system management

### System Detail View

* Critical alerts panel
* Soil moisture visualization
* Battery, pH, and solar diagnostics
* Crop health index chart
* Environmental conditions
* Historical trends and data tables

---

## Threshold Classification

| Metric        | Critical         | Warning            | Optimal |
| ------------- | ---------------- | ------------------ | ------- |
| Soil Moisture | < 30%            | 30–45%             | 45–80%  |
| Soil pH       | < 5.5 or > 7.5   | 5.5–6.0 or 7.0–7.5 | 6.0–7.0 |
| Temperature   | < 10°C or > 40°C | 10–15°C or 35–40°C | 15–35°C |
| Battery       | < 20%            | 20–40%             | > 40%   |
| Humidity      | < 40% or > 85%   | —                  | 40–85%  |

---

## Database Schema

```sql
users
├── id (INT, PRIMARY KEY)
├── name (VARCHAR)
├── email (VARCHAR, UNIQUE)
├── password (VARCHAR)
└── created_at (TIMESTAMP)

systems
├── id (INT, PRIMARY KEY)
├── user_id (INT, FOREIGN KEY)
├── name (VARCHAR)
├── device_id (VARCHAR, UNIQUE)
└── created_at (TIMESTAMP)

sensor_data
├── id (INT, PRIMARY KEY)
├── system_id (INT, FOREIGN KEY)
├── soil_moisture (DECIMAL)
├── soil_ph (DECIMAL)
├── air_temp (DECIMAL)
├── humidity (INT)
├── battery (INT)
├── solar_voltage (DECIMAL)
└── created_at (TIMESTAMP)
```

---

## Production Deployment

### Frontend Build

```bash
npm run build
```

Deploy static files using Nginx, Netlify, or any CDN-based hosting.

---

### Backend Deployment

```bash
npm start
pm2 start server.js --name agritech-api
```

---

### Production Checklist

* Use a strong JWT secret
* Secure MySQL credentials
* Enable HTTPS
* Configure database backups
* Use reverse proxy (Nginx/Apache)
* Enable monitoring and logging

---

## Use Cases

* Precision agriculture deployments
* Smart greenhouse management
* Agricultural research and experimentation
* University and educational projects
* Environmental monitoring systems

---

