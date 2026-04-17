import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"

// Routes — each file exports a Router (not middleware functions)
import authRoutes     from "./routes/auth"
import contractRoutes from "./routes/contracts"
import pdfRoutes      from "./routes/pdf"

const app = express()

// ─── Security ────────────────────────────────────────────────────────────────

app.use(helmet())

app.use(cors({
  origin:      process.env.FRONTEND_URL ?? "http://localhost:5173",
  credentials: true,
}))

app.use(rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            100,
  standardHeaders: true,
  legacyHeaders:  false,
  message:        { message: "Too many requests, please try again later" },
}))

app.use(express.json({ limit: "2mb" }))

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => res.json({ status: "ok" }))

app.use("/api/auth",      authRoutes)      // GET /api/auth/me, POST /api/auth/pdpa-consent
app.use("/api/contracts", contractRoutes)  // CRUD on contracts
app.use("/api",           pdfRoutes)       // GET /api/contracts/:id/pdf, POST /api/contracts/:id/sign

// ─── Global error handler ────────────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Unhandled error]", err.message)
  res.status(500).json({ message: "Internal server error" })
})

export default app
