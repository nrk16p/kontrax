import { Router } from "express"
import { requireAuth } from "../middleware/auth"
import { downloadContractPdf } from "../controllers/pdf.controller"

const router = Router()
router.use(requireAuth)
router.get("/contracts/:id", downloadContractPdf)

export default router
