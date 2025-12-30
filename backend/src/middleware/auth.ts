import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export interface AuthedRequest extends Request {
  userId?: string
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" })
  }

  const token = header.slice("Bearer ".length)

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any
    req.userId = payload.userId
    next()
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}
