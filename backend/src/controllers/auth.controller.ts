import { Response } from "express"
import { db, auth, COLLECTIONS } from "../config/firebase"
import { Timestamp } from "firebase-admin/firestore"
import { AuthRequest } from "../middleware/auth"
import { UserDocument } from "../models/types"

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Returns the Firestore profile for the currently authenticated user.
// Creates it on first call (post-registration).

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const uid = req.user!.uid
    const docRef = db.collection(COLLECTIONS.USERS).doc(uid)
    const doc = await docRef.get()

    if (!doc.exists) {
      // First login — bootstrap profile from Firebase Auth record
      const firebaseUser = await auth.getUser(uid)
      const now = Timestamp.now()

      const profile: UserDocument = {
        uid,
        email:       firebaseUser.email ?? "",
        firstName:   firebaseUser.displayName?.split(" ")[0] ?? "",
        lastName:    firebaseUser.displayName?.split(" ").slice(1).join(" ") ?? "",
        role:        "user",
        pdpaConsent: false,
        createdAt:   now,
        updatedAt:   now,
      }

      await docRef.set(profile)
      return res.status(201).json(profile)
    }

    return res.json(doc.data())
  } catch (err) {
    console.error("[getMe]", err)
    return res.status(500).json({ message: "Failed to fetch profile" })
  }
}

// ─── PATCH /api/auth/me ───────────────────────────────────────────────────────
// Update displayable profile fields (not email — that's done via Firebase Auth)

export async function updateMe(req: AuthRequest, res: Response) {
  try {
    const uid = req.user!.uid
    const { firstName, lastName } = req.body

    const updates: Partial<UserDocument> = {
      updatedAt: Timestamp.now(),
    }
    if (firstName) updates.firstName = firstName
    if (lastName)  updates.lastName  = lastName

    await db.collection(COLLECTIONS.USERS).doc(uid).update(updates)

    // Keep Firebase Auth displayName in sync
    if (firstName || lastName) {
      const current = (await db.collection(COLLECTIONS.USERS).doc(uid).get()).data() as UserDocument
      await auth.updateUser(uid, {
        displayName: `${updates.firstName ?? current.firstName} ${updates.lastName ?? current.lastName}`.trim(),
      })
    }

    return res.json({ message: "Profile updated" })
  } catch (err) {
    console.error("[updateMe]", err)
    return res.status(500).json({ message: "Failed to update profile" })
  }
}

// ─── POST /api/auth/pdpa-consent ──────────────────────────────────────────────
// Records PDPA consent with timestamp and IP for audit trail.

export async function recordPdpaConsent(req: AuthRequest, res: Response) {
  try {
    const uid = req.user!.uid
    const now = Timestamp.now()

    await db.collection(COLLECTIONS.USERS).doc(uid).update({
      pdpaConsent:   true,
      pdpaConsentAt: now,
      updatedAt:     now,
    })

    // Write to audit log (server-side only, no client read access)
    await db.collection(COLLECTIONS.AUDIT).add({
      event:     "pdpa_consent",
      uid,
      ip:        req.ip ?? "unknown",
      userAgent: req.headers["user-agent"] ?? "unknown",
      timestamp: now,
    })

    return res.json({ message: "Consent recorded" })
  } catch (err) {
    console.error("[recordPdpaConsent]", err)
    return res.status(500).json({ message: "Failed to record consent" })
  }
}

// ─── POST /api/auth/set-role  (Admin only) ────────────────────────────────────
// Assigns a Firebase custom claim role (e.g. promote a user to 'lawyer').
// The user must sign out and back in for the new token to carry the claim.

export async function setRole(req: AuthRequest, res: Response) {
  try {
    const { targetUid, role } = req.body as { targetUid: string; role: string }

    if (!["user", "lawyer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" })
    }

    // Set custom claim on Firebase Auth token
    await auth.setCustomUserClaims(targetUid, { role })

    // Mirror in Firestore profile
    await db.collection(COLLECTIONS.USERS).doc(targetUid).update({
      role,
      updatedAt: Timestamp.now(),
    })

    return res.json({ message: `Role '${role}' assigned to ${targetUid}` })
  } catch (err) {
    console.error("[setRole]", err)
    return res.status(500).json({ message: "Failed to set role" })
  }
}
