import { Response } from "express"
import dayjs from "dayjs"
import { AuthedRequest } from "../middleware/auth"
import { Contract } from "../models/Contract"
import { generatePdfBuffer } from "../pdf/generate"

export async function downloadContractPdf(
  req: AuthedRequest,
  res: Response
) {
  const id = req.params.id

  // ✅ only owner can download
  const contract = await Contract.findOne({
    _id: id,
    createdBy: req.userId,
  })

  if (!contract) {
    return res.status(404).json({ message: "Contract not found" })
  }

  /* ================= MAP DATA (SYNC WITH SCHEMA) ================= */

  const data = {
    today: dayjs().format("DD/MM/YYYY"),

    contract: {
      contractNo: contract.contractNo,
      type: contract.type,
      status: contract.status,
    },

    owner: {
      name:
        contract.parties?.landlord?.fullName ||
        "________________",
      idNo:
        contract.parties?.landlord?.idNo ||
        "________________",
      address:
        contract.parties?.landlord?.address ||
        "________________",
      phone: contract.parties?.landlord?.phone || "",
      email: contract.parties?.landlord?.email || "",
    },

    tenant: {
      name: contract.parties?.tenant?.fullName || "",
      idNo: contract.parties?.tenant?.idNo || "",
      address: contract.parties?.tenant?.address || "",
      phone: contract.parties?.tenant?.phone || "",
      email: contract.parties?.tenant?.email || "",
    },

    property: {
      address: contract.property?.address || "",
      projectName: contract.property?.projectName || "",
      building: contract.property?.building || "",
      unitNo: contract.property?.unitNo || "",
      floor: contract.property?.floor || "",
      areaSqm: contract.property?.areaSqm || "",
      parkingSlots: contract.property?.parkingSlots || "",
    },

    term: {
      startDate: contract.term?.startDate
        ? dayjs(contract.term.startDate).format("DD/MM/YYYY")
        : "",
      endDate: contract.term?.endDate
        ? dayjs(contract.term.endDate).format("DD/MM/YYYY")
        : "",
    },

    payment: {
      rentAmount: contract.finance?.rentAmount || 0,
      depositAmount: contract.finance?.depositAmount || 0,
      dueDay: contract.finance?.dueDay || "",

      lateFee: contract.finance?.lateFee || null,

      utilities: contract.finance?.utilities || null,

      bank: contract.finance?.payment?.bankName || "",
      accountName:
        contract.finance?.payment?.accountName || "",
      accountNo:
        contract.finance?.payment?.accountNo || "",
      promptPay:
        contract.finance?.payment?.promptPay || "",
    },

    rules: contract.rules || null,

    termination: contract.termination || null,

    inventory: contract.inventory || [],

    meta: {
      createdAt: dayjs(contract.createdAt).format(
        "DD/MM/YYYY HH:mm"
      ),
    },
  }

  /* ================= GENERATE PDF ================= */

  const pdfBuffer = await generatePdfBuffer(
    "lease_th_en.hbs",
    data
  )

  res.setHeader("Content-Type", "application/pdf")
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${contract.contractNo}.pdf"`
  )

  return res.send(pdfBuffer)
}
