import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { User } from "../models/User"

/* ======================================================
   REGISTER
====================================================== */
export async function register(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName } = req.body

    // 1️⃣ Validate input (basic)
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message: "Missing required fields",
      })
    }

    // 2️⃣ Check existing user
    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(400).json({
        message: "Email already registered",
      })
    }

    // 3️⃣ Hash password
    const hashed = await bcrypt.hash(password, 10)

    // 4️⃣ Create user
    const user = await User.create({
      email,
      password: hashed,
      firstName,
      lastName,
    })

    // 5️⃣ Sign JWT (IMPORTANT: payload must be consistent)
    const token = jwt.sign(
      {
        userId: user._id,
        firstName: user.firstName,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    )

    return res.status(201).json({ token })
  } catch (err) {
    console.error("REGISTER ERROR:", err)
    return res.status(500).json({
      message: "Failed to register",
    })
  }
}

/* ======================================================
   LOGIN
====================================================== */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      })
    }

    // 2️⃣ Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      })
    }

    // 3️⃣ Compare password
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return res.status(401).json({
        message: "Invalid credentials",
      })
    }

    // 4️⃣ Sign JWT (MUST MATCH REGISTER PAYLOAD)
    const token = jwt.sign(
      {
        userId: user._id,
        firstName: user.firstName, // ✅ CONSISTENT
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    )

    return res.json({ token })
  } catch (err) {
    console.error("LOGIN ERROR:", err)
    return res.status(500).json({
      message: "Failed to login",
    })
  }
}
