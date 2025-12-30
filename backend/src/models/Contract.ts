import mongoose, { Schema, Types } from "mongoose"

/* ================= TYPES ================= */

const PartySchema = new Schema(
  {
    fullName: String,
    idNo: String,
    address: String,
    phone: String,
    email: String,
  },
  { _id: false }
)

const InventorySchema = new Schema(
  {
    name: String,
    quantity: Number,
    condition: {
      type: String,
      enum: ["new", "good", "used", "damaged"],
    },
    photos: [String], // S3 URLs
  },
  { _id: false }
)

const FinanceSchema = new Schema(
  {
    rentAmount: Number,
    depositAmount: Number,
    dueDay: Number,

    lateFee: {
      type: {
        type: String,
        enum: ["fixed", "percentPerDay"],
      },
      value: Number,
    },

    utilities: {
      electricityRate: String,
      waterRate: String,
      commonFeePayer: {
        type: String,
        enum: ["landlord", "tenant"],
      },
    },

    payment: {
      bankName: String,
      accountName: String,
      accountNo: String,
      promptPay: String,
    },
  },
  { _id: false }
)

const RulesSchema = new Schema(
  {
    petsAllowed: Boolean,
    smokingAllowed: Boolean,
    maxOccupants: Number,
    subleaseAllowed: Boolean,
    maintenanceText: String,
    noticeBeforeEntryHours: Number,
  },
  { _id: false }
)

const TerminationSchema = new Schema(
  {
    noticeDays: Number,
    earlyTerminationPenalty: String,
    depositReturnDays: Number,
  },
  { _id: false }
)

/* ================= CONTRACT ================= */

const ContractSchema = new Schema(
  {
    contractNo: {
      type: String,
      required: true,
      unique: true,
    },

    type: {
      type: String,
      enum: ["house", "condo", "dorm", "commercial"],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "pending_signature",
        "signed",
        "active",
        "terminated",
        "completed",
      ],
      default: "draft",
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    parties: {
      landlord: PartySchema,
      tenant: PartySchema,
      guarantor: PartySchema,
    },

    property: {
      address: String,
      projectName: String,
      building: String,
      unitNo: String,
      floor: String,
      areaSqm: Number,
      parkingSlots: Number,
    },

    term: {
      startDate: Date,
      endDate: Date,
    },

    finance: FinanceSchema,

    inventory: [InventorySchema],

    rules: RulesSchema,

    termination: TerminationSchema,
  },
  {
    timestamps: true,
  }
)

export const Contract = mongoose.model("Contract", ContractSchema)
