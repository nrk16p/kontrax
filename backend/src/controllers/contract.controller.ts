import { Response } from "express"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { db, COLLECTIONS } from "../config/firebase"
import { AuthRequest } from "../middleware/auth"
import { ContractDocument, ContractStatus, ContractType } from "../models/types"
import dayjs from "dayjs"

// ─── Helper: generate contract number ────────────────────────────────────────

function generateContractNo(): string {
  return `KTX-${dayjs().format("YYYYMMDD")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

// ─── POST /api/contracts ──────────────────────────────────────────────────────

export async function createContract(req: AuthRequest, res: Response) {
  try {
    const uid = req.user!.uid
    const body = req.body as Partial<ContractDocument>

    if (!body.type || !["house", "condo", "dorm", "commercial"].includes(body.type)) {
      return res.status(400).json({ message: "Invalid or missing contract type" })
    }

    const now = Timestamp.now()

    const contract: ContractDocument = {
      contractNo: generateContractNo(),
      type:       body.type as ContractType,
      status:     "draft",
      createdBy:  uid,

      parties:     body.parties     ?? {},
      property:    body.property    ?? {},
      term:        body.term        ?? {},
      finance:     body.finance     ?? {},
      inventory:   body.inventory   ?? [],
      rules:       body.rules       ?? {},
      termination: body.termination ?? {},

      createdAt: now,
      updatedAt: now,
    }

    const docRef = await db.collection(COLLECTIONS.CONTRACTS).add(contract)

    return res.status(201).json({ id: docRef.id, contractNo: contract.contractNo })
  } catch (err) {
    console.error("[createContract]", err)
    return res.status(500).json({ message: "Failed to create contract" })
  }
}

// ─── GET /api/contracts ───────────────────────────────────────────────────────
// Returns only contracts belonging to the current user, newest first.

export async function listContracts(req: AuthRequest, res: Response) {
  try {
    const uid = req.user!.uid

    const snapshot = await db
      .collection(COLLECTIONS.CONTRACTS)
      .where("createdBy", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get()

    const contracts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...serializeContract(doc.data() as ContractDocument),
    }))

    return res.json(contracts)
  } catch (err) {
    console.error("[listContracts]", err)
    return res.status(500).json({ message: "Failed to list contracts" })
  }
}

// ─── GET /api/contracts/:id ───────────────────────────────────────────────────

export async function getContractById(req: AuthRequest, res: Response) {
  try {
    const uid = req.user!.uid
    const doc = await db.collection(COLLECTIONS.CONTRACTS).doc(req.params.id).get()

    if (!doc.exists) {
      return res.status(404).json({ message: "Contract not found" })
    }

    const data = doc.data() as ContractDocument

    // Users can only read their own contracts (lawyers/admins can read all)
    if (data.createdBy !== uid && req.user!.role === "user") {
      return res.status(403).json({ message: "Access denied" })
    }

    return res.json({ id: doc.id, ...serializeContract(data) })
  } catch (err) {
    console.error("[getContractById]", err)
    return res.status(500).json({ message: "Failed to fetch contract" })
  }
}

// ─── PATCH /api/contracts/:id ─────────────────────────────────────────────────

export async function updateContract(req: AuthRequest, res: Response) {
  try {
    const uid  = req.user!.uid
    const docRef = db.collection(COLLECTIONS.CONTRACTS).doc(req.params.id)
    const doc  = await docRef.get()

    if (!doc.exists) {
      return res.status(404).json({ message: "Contract not found" })
    }

    const existing = doc.data() as ContractDocument

    if (existing.createdBy !== uid && req.user!.role === "user") {
      return res.status(403).json({ message: "Access denied" })
    }

    // Prevent editing a fully signed contract
    if (existing.status === "signed" || existing.status === "active") {
      return res.status(400).json({ message: "Cannot edit a signed contract" })
    }

    // Only allow updating mutable fields (not contractNo, createdBy, createdAt)
    const allowed: Array<keyof ContractDocument> = [
      "type", "status", "parties", "property", "term",
      "finance", "inventory", "rules", "termination",
    ]

    const updates: Record<string, unknown> = { updatedAt: Timestamp.now() }
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }

    await docRef.update(updates)
    return res.json({ message: "Contract updated" })
  } catch (err) {
    console.error("[updateContract]", err)
    return res.status(500).json({ message: "Failed to update contract" })
  }
}

// ─── DELETE /api/contracts/:id  (soft delete → status: terminated) ────────────

export async function deleteContract(req: AuthRequest, res: Response) {
  try {
    const uid    = req.user!.uid
    const docRef = db.collection(COLLECTIONS.CONTRACTS).doc(req.params.id)
    const doc    = await docRef.get()

    if (!doc.exists) return res.status(404).json({ message: "Contract not found" })

    const data = doc.data() as ContractDocument
    if (data.createdBy !== uid && req.user!.role === "user") {
      return res.status(403).json({ message: "Access denied" })
    }

    await docRef.update({
      status:    "terminated" satisfies ContractStatus,
      updatedAt: Timestamp.now(),
    })

    return res.json({ message: "Contract terminated" })
  } catch (err) {
    console.error("[deleteContract]", err)
    return res.status(500).json({ message: "Failed to delete contract" })
  }
}

// ─── Serializer: convert Timestamps to ISO strings for JSON responses ─────────

function serializeContract(data: ContractDocument) {
  return {
    ...data,
    createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
    signedAt:  data.signedAt ? (data.signedAt as Timestamp).toDate().toISOString() : null,
    term: data.term
      ? {
          startDate: data.term.startDate ? (data.term.startDate as Timestamp).toDate().toISOString() : null,
          endDate:   data.term.endDate   ? (data.term.endDate   as Timestamp).toDate().toISOString() : null,
        }
      : {},
  }
}
