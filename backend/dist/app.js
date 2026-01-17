"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const systems_1 = __importDefault(require("./routes/systems"));
const sensors_1 = __importDefault(require("./routes/sensors"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (_, res) => {
    res.json({ status: "OK" });
});
app.use("/api/auth", auth_1.default);
app.use("/api/systems", systems_1.default);
app.use("/api/sensors", sensors_1.default);
app.use(errorHandler_1.errorHandler);
exports.default = app;
