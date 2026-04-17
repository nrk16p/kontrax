import * as admin from "firebase-admin"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

// Guard against re-initialisation (hot-reload safe)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Render/Railway/Vercel store the key as a single-line string with \n literals
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

export const db   = getFirestore()
export const auth = getAuth()

// ─── Collection name constants (avoids typo bugs) ────────────────────────────
export const COLLECTIONS = {
  USERS:     "users",
  CONTRACTS: "contracts",
  TEMPLATES: "templates",
  AUDIT:     "auditLogs",
} as const
