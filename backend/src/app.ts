import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"

import authRoutes     from "./routes/auth"
import contractRoutes from "./routes/contracts"
import pdfRoutes      from "./routes/pdf"

const app = express()

// ─── Security middleware ──────────────────────────────────────────────────────

app.use(helmet())   // Sets secure HTTP headers (XSS, clickjacking, etc.)

app.use(cors({
  origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
  credentials: true,
}))

// Rate limiting — prevents brute-force and DoS attacks
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
}))

app.use(express.json({ limit: "2mb" }))  // Cap payload size

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => res.json({ status: "ok" }))

app.use("/api/auth",      authRoutes)
app.use("/api/contracts", contractRoutes)
app.use("/api",           pdfRoutes)

// ─── Global error handler ────────────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Unhandled error]", err)
  res.status(500).json({ message: "Internal server error" })
})

export default app
