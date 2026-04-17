import { Router } from "express"
import { requireAuth } from "../middleware/auth"
import {
  createContract,
  listContracts,
  getContractById,
  updateContract,
  deleteContract,
} from "../controllers/contract.controller"

const router = Router()

router.use(requireAuth)

router.post("/",    createContract)
router.get("/",     listContracts)
router.get("/:id",  getContractById)
router.patch("/:id", updateContract)   // NEW — edit draft
router.delete("/:id", deleteContract)  // NEW — soft delete

export default router
