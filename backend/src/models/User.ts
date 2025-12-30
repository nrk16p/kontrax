import { Schema, model } from "mongoose"

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: String,
    lastName: String,
  },
  { timestamps: true }
)

export const User = model("User", UserSchema)
