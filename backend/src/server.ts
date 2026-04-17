import dotenv from "dotenv"
dotenv.config()

// Firebase is initialised as a side-effect of importing the config
import "./config/firebase"

import app from "./app"

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`🚀 Kontrax API running on http://localhost:${PORT}`)
})
