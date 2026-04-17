import { Router } from "express"
import { requireAuth } from "../middleware/auth"
import { downloadContractPdf, saveSignature } from "../controllers/pdf.controller"

const router = Router()

router.use(requireAuth)

// GET  /api/contracts/:id/pdf   → generate + stream PDF
// POST /api/contracts/:id/sign  → save base64 signature, update status → signed
router.get( "/contracts/:id/pdf",  downloadContractPdf)
router.post("/contracts/:id/sign", saveSignature)

export default router
