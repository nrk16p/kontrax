import express from "express"
import cors from "cors"

import authRoutes from "./routes/auth"
import contractRoutes from "./routes/contracts"
import pdfRoutes from "./routes/pdf"
import { Request, Response } from "express"


const app = express()

app.use(cors())
app.use(express.json())

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.use("/api/auth", authRoutes)
app.use("/api/contracts", contractRoutes)
app.use("/api", pdfRoutes)

export default app
