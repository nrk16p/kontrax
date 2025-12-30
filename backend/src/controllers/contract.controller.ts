import { Response } from "express"
import { Contract } from "../models/Contract"
import { AuthedRequest } from "../middleware/auth"
import { generateContractNo } from "../utils/contractNo"

/* ============ CREATE CONTRACT ============ */
export async function createContract(
  req: AuthedRequest,
  res: Response
) {
  try {
    const payload = {
      ...req.body,
      contractNo: generateContractNo(),
      status: "draft", // BE controls
      createdBy: req.userId,
    }

    const created = await Contract.create(payload)
    return res.status(201).json(created)
  } catch (err) {
    console.error("CREATE CONTRACT ERROR:", err)
    return res.status(400).json({
      message: "Contract validation failed",
    })
  }
}

/* ============ LIST CONTRACTS (OWNER) ============ */
export async function listContracts(
  req: AuthedRequest,
  res: Response
) {
  try {
    const data = await Contract.find({
      createdBy: req.userId,
    }).sort({ createdAt: -1 })

    return res.json(data)
  } catch (err) {
    return res.status(500).json({
      message: "Failed to load contracts",
    })
  }
}

/* ============ GET BY ID ============ */
export async function getContractById(
  req: AuthedRequest,
  res: Response
) {
  try {
    const item = await Contract.findOne({
      _id: req.params.id,
      createdBy: req.userId,
    })

    if (!item) {
      return res.status(404).json({
        message: "Contract not found",
      })
    }

    return res.json(item)
  } catch (err) {
    return res.status(400).json({
      message: "Invalid contract id",
    })
  }
}
