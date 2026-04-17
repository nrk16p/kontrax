import { Router } from "express"
import { requireAuth, requireRole } from "../middleware/auth"
import {
  getMe,
  updateMe,
  recordPdpaConsent,
  setRole,
} from "../controllers/auth.controller"

const router = Router()

// All auth routes require a valid Firebase ID token
router.use(requireAuth)

// GET  /api/auth/me            → fetch or bootstrap Firestore user profile
// PATCH /api/auth/me           → update first/last name
router.get("/me",   getMe)
router.patch("/me", updateMe)

// POST /api/auth/pdpa-consent  → record PDPA consent with audit trail
router.post("/pdpa-consent", recordPdpaConsent)

// POST /api/auth/set-role      → admin only: promote user to lawyer/admin
router.post("/set-role", requireRole("admin"), setRole)

export default router
