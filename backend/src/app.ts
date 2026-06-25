import express from "express";
import cors from "cors";
import { env } from "./config.js";
import { authenticate } from "./middlewares/auth.js";
import { errorHandler } from "./middlewares/error.js";
import { authRouter } from "./routes/auth.js";
import { patientsRouter } from "./routes/patients.js";
import { appointmentsRouter } from "./routes/appointments.js";
import { dashboardRouter } from "./routes/dashboard.js";

export const app = express();

app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api/dashboard", authenticate, dashboardRouter);
app.use("/api/patients", authenticate, patientsRouter);
app.use("/api/appointments", authenticate, appointmentsRouter);

app.use((_req, res) => res.status(404).json({ message: "Rota não encontrada." }));
app.use(errorHandler);

