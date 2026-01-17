require("dotenv").config();
const express = require("express");
const cors = require("cors");

const sensorRoutes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/sensors", sensorRoutes);

app.get("/", (req, res) => {
  res.send("Sensor API is running 🚜");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Sensor API running on http://localhost:${PORT}`);
});
