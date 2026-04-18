import { Timestamp } from "firebase-admin/firestore"

// ─── Sub-types (mirror the Mongoose sub-schemas) ──────────────────────────────

export interface Party {
  fullName?: string
  idNo?:     string   // Masked on read — full value encrypted in signed PDF
  address?:  string
  phone?:    string
  email?:    string
}

export interface InventoryItem {
  name?:      string
  quantity?:  number
  condition?: "new" | "good" | "used" | "damaged"
  photos?:    string[]   // Storage URLs
}

export interface Finance {
  rentAmount?:    number
  depositAmount?: number
  dueDay?:        number

  lateFee?: {
    type?:  "fixed" | "percentPerDay"
    value?: number
  }

  utilities?: {
    electricityRate?:  string
    waterRate?:        string
    commonFeePayer?:   "landlord" | "tenant"
  }

  payment?: {
    bankName?:    string
    accountName?: string
    accountNo?:   string
    promptPay?:   string
  }
}

export interface Rules {
  petsAllowed?:              boolean
  smokingAllowed?:           boolean
  maxOccupants?:             number
  subleaseAllowed?:          boolean
  maintenanceText?:          string
  noticeBeforeEntryHours?:   number
}

export interface Termination {
  noticeDays?:               number
  earlyTerminationPenalty?:  string
  depositReturnDays?:        number
}

// ─── Contract Status & Type ───────────────────────────────────────────────────

export type ContractType   = "house" | "condo" | "dorm" | "commercial" | "employment"

export type ContractStatus =
  | "draft"
  | "pending_signature"
  | "signed"
  | "active"
  | "terminated"
  | "completed"

// ─── Firestore Document ───────────────────────────────────────────────────────
// Collection: /contracts/{contractId}

export interface ContractDocument {
  contractNo:  string
  type:        ContractType
  status:      ContractStatus
  createdBy:   string           // Firebase UID

  parties?: {
    landlord?:  Party
    tenant?:    Party
    guarantor?: Party
  }

  property?: {
    address?:      string
    projectName?:  string
    building?:     string
    unitNo?:       string
    floor?:        string
    areaSqm?:      number
    parkingSlots?: number
  }

  term?: {
    startDate?: Timestamp
    endDate?:   Timestamp
  }

  finance?:     Finance
  inventory?:   InventoryItem[]
  rules?:       Rules
  termination?: Termination

  specialConditions?: string
  position?:          string
  workHours?:         string
  probationDays?:     string

  signatures?: {
    landlord?:  string
    tenant?:    string
    employer?:  string
    employee?:  string
  }

  signedAt?:     Timestamp
  signedPdfUrl?: string         // Firebase Storage URL after signing

  createdAt: Timestamp
  updatedAt: Timestamp
}

// ─── User Profile Document ────────────────────────────────────────────────────
// Collection: /users/{uid}
// Created after first Firebase Auth login

export interface UserDocument {
  uid:        string
  email:      string
  firstName:  string
  lastName:   string
  role:       "user" | "lawyer" | "admin"
  pdpaConsent: boolean
  pdpaConsentAt?: Timestamp
  createdAt:  Timestamp
  updatedAt:  Timestamp
}
