import { Request, Response, NextFunction } from "express"
import { auth } from "../config/firebase"

// ─── Augment Express Request ──────────────────────────────────────────────────

export interface AuthRequest extends Request {
  user?: {
    uid:   string
    email: string | undefined
    role:  "user" | "lawyer" | "admin"
  }
}

// ─── requireAuth ─────────────────────────────────────────────────────────────
// Drop-in replacement for the old JWT requireAuth middleware.
// Clients must send:  Authorization: Bearer <firebase_id_token>

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" })
  }

  const idToken = header.split("Bearer ")[1]

  try {
    const decoded = await auth.verifyIdToken(idToken)

    req.user = {
      uid:   decoded.uid,
      email: decoded.email,
      // Custom claim set via auth.setCustomUserClaims() when lawyer/admin is assigned
      role:  (decoded.role as "user" | "lawyer" | "admin") ?? "user",
    }

    next()
  } catch (err) {
    console.error("[requireAuth] Token verification failed:", err)
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}

// ─── requireRole ─────────────────────────────────────────────────────────────
// Usage: router.post("/templates", requireAuth, requireRole("lawyer"), handler)

export function requireRole(...roles: Array<"user" | "lawyer" | "admin">) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthenticated" })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Requires role: ${roles.join(" or ")}`,
      })
    }
    next()
  }
}
