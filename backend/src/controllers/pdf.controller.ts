import path from "path"
import fs from "fs"
import { Response } from "express"
import Handlebars from "handlebars"
import puppeteer from "puppeteer-core"
import { Timestamp } from "firebase-admin/firestore"
import { db, COLLECTIONS } from "../config/firebase"
import { AuthRequest } from "../middleware/auth"
import { ContractDocument } from "../models/types"
import dayjs from "dayjs"
import "dayjs/locale/th"
dayjs.locale("th")

// ─── Template registry ────────────────────────────────────────────────────────
// Add new contract types here as you create more .hbs files

const TEMPLATE_MAP: Record<string, string> = {
  house:       "rental",
  condo:       "rental",
  dorm:        "rental",
  commercial:  "rental",
  employment:  "employment",
}

// ─── Compile and cache Handlebars templates ───────────────────────────────────

const templateCache = new Map<string, HandlebarsTemplateDelegate>()

function loadTemplate(name: string): HandlebarsTemplateDelegate {
  if (templateCache.has(name)) return templateCache.get(name)!

  const filePath = path.join(__dirname, `../templates/contracts/${name}.hbs`)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Template not found: ${name}.hbs`)
  }

  const source = fs.readFileSync(filePath, "utf-8")
  const compiled = Handlebars.compile(source)
  templateCache.set(name, compiled)
  return compiled
}

// ─── Field mapper: ContractDocument → Handlebars data object ─────────────────

function buildTemplateData(contract: ContractDocument, signedAt: string): Record<string, unknown> {
  const fmt = (d: Timestamp | undefined) =>
    d ? dayjs(d.toDate()).format("D MMMM BBBB") : "-"  // Thai Buddhist year

  const base = {
    contractNo:        contract.contractNo,
    startDate:         fmt(contract.term?.startDate as Timestamp | undefined),
    endDate:           fmt(contract.term?.endDate   as Timestamp | undefined),
    consentTimestamp:  signedAt,
  }

  switch (contract.type) {
    case "house":
    case "condo":
    case "dorm":
    case "commercial": {
      const l = contract.parties?.landlord ?? {}
      const t = contract.parties?.tenant   ?? {}
      const f = contract.finance ?? {}
      const p = contract.property ?? {}
      return {
        ...base,
        landlordName:       l.fullName   ?? "",
        landlordId:         maskId(l.idNo),
        landlordAddress:    l.address    ?? "",
        landlordPhone:      l.phone      ?? "",
        tenantName:         t.fullName   ?? "",
        tenantId:           maskId(t.idNo),
        tenantAddress:      t.address    ?? "",
        tenantPhone:        t.phone      ?? "",
        propertyAddress:    p.address    ?? "",
        propertyType:       contract.type === "condo" ? "คอนโดมิเนียม" :
                            contract.type === "dorm"  ? "หอพัก" :
                            contract.type === "commercial" ? "อาคารพาณิชย์" : "บ้านพักอาศัย",
        projectName:        p.projectName,
        unitNo:             p.unitNo,
        areaSqm:            p.areaSqm,
        rentAmount:         f.rentAmount?.toLocaleString("th-TH")   ?? "0",
        depositAmount:      f.depositAmount?.toLocaleString("th-TH") ?? "0",
        paymentDueDay:      f.dueDay ?? "สิ้นเดือน",
        specialConditions:  (contract as any).specialConditions ?? "",
        landlordSignature:  (contract as any).signatures?.landlord ?? null,
        tenantSignature:    (contract as any).signatures?.tenant   ?? null,
        landlordSignedAt:   (contract as any).signedAt ? fmt((contract as any).signedAt) : "-",
        tenantSignedAt:     (contract as any).signedAt ? fmt((contract as any).signedAt) : "-",
      }
    }

    case "employment" as any: {
      const er = contract.parties?.landlord ?? {}  // employer stored as "landlord"
      const ee = contract.parties?.tenant   ?? {}  // employee stored as "tenant"
      const f  = contract.finance ?? {}
      return {
        ...base,
        employerName:      er.fullName  ?? "",
        employerAddress:   er.address   ?? "",
        employeeName:      ee.fullName  ?? "",
        employeeId:        maskId(ee.idNo),
        position:          (contract as any).position ?? "",
        salary:            f.rentAmount?.toLocaleString("th-TH") ?? "0",
        workHours:         (contract as any).workHours ?? "40 ชั่วโมง",
        probationDays:     (contract as any).probationDays ?? "90",
        employerSignature: (contract as any).signatures?.landlord ?? null,
        employeeSignature: (contract as any).signatures?.tenant   ?? null,
        employerSignedAt:  (contract as any).signedAt ? fmt((contract as any).signedAt) : "-",
        employeeSignedAt:  (contract as any).signedAt ? fmt((contract as any).signedAt) : "-",
      }
    }

    default:
      return base
  }
}

// ─── GET /api/contracts/:id/pdf ───────────────────────────────────────────────

export async function downloadContractPdf(req: AuthRequest, res: Response) {
  const { id } = req.params

  try {
    // 1. Fetch contract from Firestore
    const doc = await db.collection(COLLECTIONS.CONTRACTS).doc(id).get()
    if (!doc.exists) {
      return res.status(404).json({ message: "Contract not found" })
    }

    const contract = doc.data() as ContractDocument

    // 2. Access control — owner or lawyer/admin only
    if (contract.createdBy !== req.user!.uid && req.user!.role === "user") {
      return res.status(403).json({ message: "Access denied" })
    }

    // 3. Resolve template name
    const templateName = TEMPLATE_MAP[contract.type]
    if (!templateName) {
      return res.status(400).json({ message: `No template for type: ${contract.type}` })
    }

    // 4. Build template data
    const signedAt = dayjs().format("D MMMM BBBB HH:mm น.")
    const data = buildTemplateData(contract, signedAt)

    // 5. Render HTML via Handlebars
    const renderTemplate = loadTemplate(templateName)
    const html = renderTemplate(data)

    // 6. Launch Puppeteer and generate PDF
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH
      ?? "/usr/bin/google-chrome-stable"

    const browser = await puppeteer.launch({
      executablePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      headless: true,
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })

    const pdf = await page.pdf({
      format:            "A4",
      printBackground:   true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    })

    await browser.close()

    // 7. Log PDF generation event in audit trail (no client read access)
    await db.collection(COLLECTIONS.AUDIT).add({
      event:      "pdf_generated",
      contractId: id,
      uid:        req.user!.uid,
      ip:         req.ip ?? "unknown",
      timestamp:  Timestamp.now(),
    })

    // 8. Stream PDF to client
    const filename = `Kontrax_${contract.contractNo}_${dayjs().format("YYYYMMDD")}.pdf`
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.setHeader("Content-Length", pdf.length)
    res.send(pdf)

  } catch (err) {
    console.error("[downloadContractPdf]", err)
    res.status(500).json({ message: "Failed to generate PDF" })
  }
}

// ─── POST /api/contracts/:id/sign ─────────────────────────────────────────────
// Saves a base64 signature image to the contract document.

export async function saveSignature(req: AuthRequest, res: Response) {
  const { id } = req.params
  const { signatureDataUrl, role } = req.body as {
    signatureDataUrl: string
    role: "landlord" | "tenant" | "employer" | "employee"
  }

  if (!signatureDataUrl || !role) {
    return res.status(400).json({ message: "signatureDataUrl and role are required" })
  }

  // Validate it's a real base64 PNG/JPEG (security: don't store arbitrary strings)
  if (!signatureDataUrl.startsWith("data:image/")) {
    return res.status(400).json({ message: "Invalid signature format" })
  }

  try {
    const docRef = db.collection(COLLECTIONS.CONTRACTS).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) return res.status(404).json({ message: "Contract not found" })

    const contract = doc.data() as ContractDocument
    if (contract.createdBy !== req.user!.uid && req.user!.role === "user") {
      return res.status(403).json({ message: "Access denied" })
    }

    const now = Timestamp.now()

    await docRef.update({
      [`signatures.${role}`]: signatureDataUrl,
      signedAt:  now,
      status:    "signed",
      updatedAt: now,
    })

    // Audit trail
    await db.collection(COLLECTIONS.AUDIT).add({
      event:      "contract_signed",
      contractId: id,
      uid:        req.user!.uid,
      role,
      ip:         req.ip ?? "unknown",
      userAgent:  req.headers["user-agent"] ?? "unknown",
      timestamp:  now,
    })

    return res.json({ message: "Signature saved", contractId: id })
  } catch (err) {
    console.error("[saveSignature]", err)
    return res.status(500).json({ message: "Failed to save signature" })
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function maskId(id: string | undefined): string {
  if (!id) return "-"
  // Show first 1 and last 4 digits: "1-XXXX-XXXXX-XX-3456"
  return id.slice(0, 1) + "-XXXX-XXXXX-XX-" + id.slice(-4)
}
