import { Router } from "express"
import { requireAuth } from "../middleware/auth"
import {
  createContract,
  listContracts,
  getContractById,
} from "../controllers/contract.controller"

const router = Router()

router.use(requireAuth)

router.post("/", createContract)
router.get("/", listContracts)
router.get("/:id", getContractById)

export default router
