import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import systemsRoutes from "./routes/systems";
import sensorsRoutes from "./routes/sensors";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/systems", systemsRoutes);
app.use("/api/sensors", sensorsRoutes);

app.use(errorHandler);

export default app;
