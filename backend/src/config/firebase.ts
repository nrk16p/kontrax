import * as admin from "firebase-admin"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

// ─── Fix #12: Validate required env vars on startup ──────────────────────────
// Fail loudly with a clear message rather than a cryptic crash later.

const REQUIRED_VARS = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
] as const

const missing = REQUIRED_VARS.filter((v) => !process.env[v])
if (missing.length > 0) {
  throw new Error(
    `[firebase] Missing required environment variables: ${missing.join(", ")}\n` +
    `Copy .env.example to .env and fill in your Firebase service account credentials.`
  )
}

// ─── Init (guard against re-initialisation during hot reload) ─────────────────

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      // Hosting platforms store the key as a single line with literal \n
      privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  })
}

export const db   = getFirestore()
export const auth = getAuth()

// ─── Collection name constants (prevents typo bugs) ───────────────────────────

export const COLLECTIONS = {
  USERS:     "users",
  CONTRACTS: "contracts",
  TEMPLATES: "templates",
  AUDIT:     "auditLogs",
} as const
