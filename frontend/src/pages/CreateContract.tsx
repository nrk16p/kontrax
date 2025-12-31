import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { createContract } from "../services/contract.service"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Label } from "../components/ui/Label"
import { Textarea } from "../components/ui/Textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/Select"
import { Alert, AlertDescription } from "../components/ui/Alert"
import { Checkbox } from "../components/ui/Checkbox"

import { 
  ChevronLeft, 
  Save, 
  Send, 
  AlertCircle, 
  CheckCircle2,
  Info
} from "lucide-react"

/* ================= TYPES ================= */

interface Party {
  fullName: string
  idNo: string
  address: string
  phone: string
  email: string
}

interface Property {
  address: string
  projectName: string
  unitNo: string
  floor: string
  areaSqm: string
  parkingSlots: string
}

interface Term {
  startDate: string
  endDate: string
}

interface Payment {
  bankName: string
  accountName: string
  accountNo: string
  promptPay: string
}

interface Finance {
  rentAmount: string
  depositAmount: string
  dueDay: string
  payment: Payment
}

interface Rules {
  petsAllowed: boolean
  smokingAllowed: boolean
  subleaseAllowed: boolean
}

interface Termination {
  noticeDays: string
  depositReturnDays: string
}

interface ContractForm {
  type: "house" | "condo" | "dorm" | "commercial"
  parties: {
    landlord: Party
    tenant: Party
  }
  property: Property
  term: Term
  finance: Finance
  rules: Rules
  termination: Termination
  notes: string
}

interface ValidationErrors {
  [key: string]: string
}

/* ================= HELPERS ================= */

const HelpText = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{children}</p>
)

const Req = ({ children }: { children: string }) => (
  <Label className="flex items-center gap-1">
    {children}
    <span className="text-red-500">*</span>
  </Label>
)

const ErrorText = ({ children }: { children?: string }) => {
  if (!children) return null
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      {children}
    </p>
  )
}

const InfoBox = ({ children }: { children: React.ReactNode }) => (
  <Alert className="bg-blue-50 border-blue-200">
    <Info className="h-4 w-4 text-blue-600" />
    <AlertDescription className="text-blue-800 text-sm">
      {children}
    </AlertDescription>
  </Alert>
)

/* ================= PROGRESS STEPPER ================= */

const ProgressStepper = ({ 
  currentStep, 
  totalSteps 
}: { 
  currentStep: number
  totalSteps: number 
}) => {
  const steps = [
    { num: 1, label: "Parties" },
    { num: 2, label: "Property" },
    { num: 3, label: "Terms" },
    { num: 4, label: "Payment" },
    { num: 5, label: "Review" },
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <React.Fragment key={step.num}>
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  font-semibold transition-all
                  ${
                    step.num < currentStep
                      ? "bg-green-500 text-white"
                      : step.num === currentStep
                      ? "bg-blue-500 text-white ring-4 ring-blue-100"
                      : "bg-slate-200 text-slate-500"
                  }
                `}
              >
                {step.num < currentStep ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`
                  text-xs mt-2 font-medium
                  ${step.num === currentStep ? "text-blue-600" : "text-slate-500"}
                `}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-1 mx-2 rounded transition-all
                  ${step.num < currentStep ? "bg-green-500" : "bg-slate-200"}
                `}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

/* ================= VALIDATION ================= */
function diffYearsMonths(start: string, end: string) {
  const startDate = new Date(start)
  const endDate = new Date(end)

  let totalMonths =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth())

  // ถ้าวันสิ้นสุด < วันเริ่ม → ยังไม่ครบเดือน
  if (endDate.getDate() < startDate.getDate()) {
    totalMonths -= 1
  }

  totalMonths = Math.max(totalMonths, 0)

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  return { years, months, totalMonths }
}

function formatDurationEN(years: number, months: number) {
  const parts: string[] = []

  if (years > 0) {
    parts.push(`${years} ${years === 1 ? "year" : "years"}`)
  }

  if (months > 0) {
    parts.push(`${months} ${months === 1 ? "month" : "months"}`)
  }

  return parts.length ? parts.join(" ") : "0 months"
}


const validateStep = (step: number, form: ContractForm): ValidationErrors => {
  const errors: ValidationErrors = {}

  // Email validation helper
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  
  // Phone validation helper (Thai format)
  const isValidPhone = (phone: string) => /^[0-9]{9,10}$/.test(phone.replace(/[-\s]/g, ""))
  // Thai National ID (13 digits)
  const isValidThaiId = (id: string) =>
    /^[0-9]{13}$/.test(id.replace(/[-\s]/g, ""))

  if (step === 1) {
    // Landlord validation
    if (!form.parties.landlord.fullName.trim()) {
      errors.landlordName = "Landlord name is required"
    }
    if (!form.parties.landlord.idNo.trim()) {
      errors.landlordIdNo = "Landlord ID number is required"
    } else if (!isValidThaiId(form.parties.landlord.idNo)) {
      errors.landlordIdNo = "ID number must be 13 digits"
    }

    if (!form.parties.landlord.address.trim()) {
      errors.landlordAddress = "Landlord address is required"
    }
    if (!form.parties.landlord.phone.trim()) {
      errors.landlordPhone = "Landlord phone is required"
    } else if (!isValidPhone(form.parties.landlord.phone)) {
      errors.landlordPhone = "Invalid phone number format"
    }
    
    // Tenant validation
    if (!form.parties.tenant.fullName.trim()) {
      errors.tenantName = "Tenant name is required"
    }
    if (!form.parties.tenant.idNo.trim()) {
      errors.tenantIdNo = "Tenant ID number is required"
    } else if (!isValidThaiId(form.parties.tenant.idNo)) {
      errors.tenantIdNo = "ID number must be 13 digits"
    }

    if (!form.parties.tenant.address.trim()) {
      errors.tenantAddress = "Tenant address is required"
    }
    if (!form.parties.tenant.phone.trim()) {
      errors.tenantPhone = "Tenant phone is required"
    } else if (!isValidPhone(form.parties.tenant.phone)) {
      errors.tenantPhone = "Invalid phone number format"
    }
    if (form.parties.tenant.email && !isValidEmail(form.parties.tenant.email)) {
      errors.tenantEmail = "Invalid email format"
    }
  }

  if (step === 2) {
    if (!form.type) {
      errors.propertyType = "Property type is required"
    }
    if (!form.property.address.trim()) {
      errors.propertyAddress = "Property address is required"
    }
    if (form.property.areaSqm && isNaN(Number(form.property.areaSqm))) {
      errors.areaSqm = "Area must be a number"
    }
  }

  if (step === 3) {
    if (!form.term.startDate) {
      errors.startDate = "Start date is required"
    }
    if (!form.term.endDate) {
      errors.endDate = "End date is required"
    }
    if (form.term.startDate && form.term.endDate) {
      if (new Date(form.term.endDate) <= new Date(form.term.startDate)) {
        errors.endDate = "End date must be after start date"
      }
    }
    if (!form.finance.rentAmount.trim()) {
      errors.rentAmount = "Rent amount is required"
    } else if (isNaN(Number(form.finance.rentAmount)) || Number(form.finance.rentAmount) <= 0) {
      errors.rentAmount = "Rent amount must be a positive number"
    }
    if (!form.finance.depositAmount.trim()) {
      errors.depositAmount = "Deposit amount is required"
    } else if (isNaN(Number(form.finance.depositAmount)) || Number(form.finance.depositAmount) < 0) {
      errors.depositAmount = "Deposit amount must be a non-negative number"
    }
    if (!form.finance.dueDay.trim()) {
      errors.dueDay = "Due day is required"
    } else {
      const day = Number(form.finance.dueDay)
      if (isNaN(day) || day < 1 || day > 31) {
        errors.dueDay = "Due day must be between 1 and 31"
      }
    }
  }

  if (step === 4) {
    if (!form.finance.payment.bankName.trim() && !form.finance.payment.promptPay.trim()) {
      errors.payment = "Please provide either bank details or PromptPay"
    }
    if (form.finance.payment.bankName.trim() && !form.finance.payment.accountNo.trim()) {
      errors.accountNo = "Account number is required when bank name is provided"
    }
  }

  if (step === 5) {
    if (form.termination.noticeDays) {
      const days = Number(form.termination.noticeDays)
      if (isNaN(days) || days < 0) {
        errors.noticeDays = "Notice days must be a non-negative number"
      }
    }
    if (form.termination.depositReturnDays) {
      const days = Number(form.termination.depositReturnDays)
      if (isNaN(days) || days < 0) {
        errors.depositReturnDays = "Deposit return days must be a non-negative number"
      }
    }
  }

  return errors
}

/* ================= COMPONENT ================= */

export function CreateContract() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitType, setSubmitType] = useState<"draft" | "active">("active")

  /* ================= FORM STATE ================= */

  const [form, setForm] = useState<ContractForm>({
    type: "house",

    parties: {
      landlord: {
        fullName: "",
        idNo: "",
        address: "",
        phone: "",
        email: "",
      },
      tenant: {
        fullName: "",
        idNo: "",
        address: "",
        phone: "",
        email: "",
      },
    },

    property: {
      address: "",
      projectName: "",
      unitNo: "",
      floor: "",
      areaSqm: "",
      parkingSlots: "",
    },

    term: {
      startDate: "",
      endDate: "",
    },

    finance: {
      rentAmount: "",
      depositAmount: "",
      dueDay: "1",
      payment: {
        bankName: "",
        accountName: "",
        accountNo: "",
        promptPay: "",
      },
    },

    rules: {
      petsAllowed: false,
      smokingAllowed: false,
      subleaseAllowed: false,
    },

    termination: {
      noticeDays: "30",
      depositReturnDays: "30",
    },

    notes: "",
  })

  /* ================= DERIVED VALUES ================= */

  const duration =
    form.term.startDate && form.term.endDate
      ? diffYearsMonths(form.term.startDate, form.term.endDate)
      : null

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("contractDraft", JSON.stringify(form))
    }, 1000)
    return () => clearTimeout(timer)
  }, [form])

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("contractDraft")
    if (draft) {
      try {
        setForm(JSON.parse(draft))
      } catch (e) {
        console.error("Failed to load draft")
      }
    }
  }, [])

  const update = (path: string, value: any) => {
    setForm((prev) => {
      const obj = structuredClone(prev)
      const keys = path.split(".")
      let cur: any = obj
      keys.slice(0, -1).forEach((k) => (cur = cur[k]))
      cur[keys.at(-1)!] = value
      return obj
    })
    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[path.split(".").at(-1)!]
      return newErrors
    })
  }

  /* ================= NAVIGATION ================= */

  const goNext = () => {
    const stepErrors = validateStep(step, form)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    setStep((s) => Math.min(s + 1, 5))
  }

  const goBack = () => {
    setErrors({})
    setStep((s) => Math.max(s - 1, 1))
  }

  /* ================= SUBMIT ================= */

  const handleSubmit = (type: "draft" | "active") => {
    if (type === "active") {
      // Validate all steps before final submission
      const allErrors: ValidationErrors = {}
      for (let i = 1; i <= 5; i++) {
        Object.assign(allErrors, validateStep(i, form))
      }
      if (Object.keys(allErrors).length > 0) {
        setErrors(allErrors)
        alert("Please fix validation errors before submitting")
        return
      }
    }
    setSubmitType(type)
    setShowConfirm(true)
  }

  const confirmSubmit = async () => {
    try {
      setLoading(true)
      setShowConfirm(false)
      await createContract({ ...form, status: submitType })
      localStorage.removeItem("contractDraft")
      navigate("/dashboard")
    } catch (err: any) {
      alert(err.message || "Create contract failed")
    } finally {
      setLoading(false)
    }
  }

  /* ================= RENDER ================= */

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <Button variant="ghost" onClick={() => navigate("/dashboard")}>
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <div>
        <h1 className="text-3xl font-bold">Create Rental Contract</h1>
        <p className="text-slate-500 mt-1">
          Fill in the details to generate a legally compliant rental agreement
        </p>
      </div>

      <ProgressStepper currentStep={step} totalSteps={5} />

      <Card>
        {/* ================= STEP 1: PARTIES ================= */}
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Landlord & Tenant Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <InfoBox>
                Enter accurate party information as it will appear in the legal contract.
                All required fields must be completed to proceed.
              </InfoBox>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Landlord */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">
                    Landlord (ผู้ให้เช่า)
                  </h3>

                  <div>
                    <Req>Full Name</Req>
                    <Input
                      value={form.parties.landlord.fullName}
                      onChange={(e) => update("parties.landlord.fullName", e.target.value)}
                      placeholder="John Smith"
                      className={errors.landlordName ? "border-red-500" : ""}
                    />
                    <ErrorText>{errors.landlordName}</ErrorText>
                    <HelpText>ชื่อ-นามสกุลเจ้าของห้องตามบัตรประชาชน</HelpText>
                  </div>

                  <div>
                    <Req>ID Number</Req>
                    <Input
                      value={form.parties.landlord.idNo}
                      onChange={(e) => update("parties.landlord.idNo", e.target.value)}
                      placeholder="1234567890123"
                      maxLength={13}
                      className={errors.landlordIdNo ? "border-red-500" : ""}
                    />
                    <ErrorText>{errors.landlordIdNo}</ErrorText>
                    <HelpText>เลขบัตรประชาชน 13 หลัก (ไม่ต้องใส่ขีด)</HelpText>
                  </div>

                  <div>
                    <Req>Address</Req>
                    <Textarea
                      value={form.parties.landlord.address}
                      onChange={(e) => update("parties.landlord.address", e.target.value)}
                      placeholder="123 Main Street, Bangkok"
                      rows={2}
                      className={errors.landlordAddress ? "border-red-500" : ""}
                    />
                    <ErrorText>{errors.landlordAddress}</ErrorText>
                    <HelpText>ที่อยู่ตามบัตรประชาชน</HelpText>
                  </div>

                  <div>
                    <Req>Phone Number</Req>
                    <Input
                      value={form.parties.landlord.phone}
                      onChange={(e) => update("parties.landlord.phone", e.target.value)}
                      placeholder="0812345678"
                      className={errors.landlordPhone ? "border-red-500" : ""}
                    />
                    <ErrorText>{errors.landlordPhone}</ErrorText>
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.parties.landlord.email}
                      onChange={(e) => update("parties.landlord.email", e.target.value)}
                      placeholder="landlord@example.com"
                    />
                  </div>
                </div>

                {/* Tenant */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">
                    Tenant (ผู้เช่า)
                  </h3>

                  <div>
                    <Req>Full Name</Req>
                    <Input
                      value={form.parties.tenant.fullName}
                      onChange={(e) => update("parties.tenant.fullName", e.target.value)}
                      placeholder="Jane Doe"
                      className={errors.tenantName ? "border-red-500" : ""}
                    />
                    <ErrorText>{errors.tenantName}</ErrorText>
                    <HelpText>ชื่อ-นามสกุลผู้เช่าตามบัตรประชาชน</HelpText>
                  </div>

                  <div>
                    <Req>ID Number</Req>
                    <Input
                      value={form.parties.tenant.idNo}
                      onChange={(e) => update("parties.tenant.idNo", e.target.value)}
                      placeholder="1234567890123"
                      maxLength={13}
                      className={errors.tenantIdNo ? "border-red-500" : ""}
                    />
                    <ErrorText>{errors.tenantIdNo}</ErrorText>
                    <HelpText>เลขบัตรประชาชน 13 หลัก (ไม่ต้องใส่ขีด)</HelpText>
                  </div>

                  <div>
                    <Req>Address</Req>
                    <Textarea
                      value={form.parties.tenant.address}
                      onChange={(e) => update("parties.tenant.address", e.target.value)}
                      placeholder="456 Second Street, Bangkok"
                      rows={2}
                      className={errors.tenantAddress ? "border-red-500" : ""}
                    />
                    <ErrorText>{errors.tenantAddress}</ErrorText>
                    <HelpText>ที่อยู่ตามบัตรประชาชน</HelpText>
                  </div>

                  <div>
                    <Req>Phone Number</Req>
                    <Input
                      value={form.parties.tenant.phone}
                      onChange={(e) => update("parties.tenant.phone", e.target.value)}
                      placeholder="0898765432"
                      className={errors.tenantPhone ? "border-red-500" : ""}
                    />
                    <ErrorText>{errors.tenantPhone}</ErrorText>
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.parties.tenant.email}
                      onChange={(e) => update("parties.tenant.email", e.target.value)}
                      placeholder="tenant@example.com"
                      className={errors.tenantEmail ? "border-red-500" : ""}
                    />
                    <ErrorText>{errors.tenantEmail}</ErrorText>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="justify-end">
              <Button onClick={goNext}>Next: Property Details</Button>
            </CardFooter>
          </>
        )}

        {/* ================= STEP 2: PROPERTY ================= */}
        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <InfoBox>
                Provide detailed property information as it will be used in the contract.
              </InfoBox>

              <div>
                <Req>Property Type</Req>
                <Select
                  value={form.type}
                  onValueChange={(v: any) => update("type", v)}
                >
                  <SelectTrigger className={errors.propertyType ? "border-red-500" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">🏠 House (บ้าน)</SelectItem>
                    <SelectItem value="condo">🏢 Condominium (คอนโด)</SelectItem>
                    <SelectItem value="dorm">🏘️ Dormitory (หอพัก)</SelectItem>
                    <SelectItem value="commercial">🏪 Commercial (พาณิชย์)</SelectItem>
                  </SelectContent>
                </Select>
                <ErrorText>{errors.propertyType}</ErrorText>
              </div>

              <div>
                <Req>Property Address</Req>
                <Textarea
                  value={form.property.address}
                  onChange={(e) => update("property.address", e.target.value)}
                  placeholder="123 Sukhumvit Road, Watthana, Bangkok 10110"
                  rows={3}
                  className={errors.propertyAddress ? "border-red-500" : ""}
                />
                <ErrorText>{errors.propertyAddress}</ErrorText>
                <HelpText>ที่อยู่ตามโฉนด หรือเอกสารสิทธิ์</HelpText>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Project Name</Label>
                  <Input
                    value={form.property.projectName}
                    onChange={(e) => update("property.projectName", e.target.value)}
                    placeholder="The Urban Residence"
                  />
                  <HelpText>ชื่อโครงการ (ถ้ามี)</HelpText>
                </div>

                <div>
                  <Label>Unit Number</Label>
                  <Input
                    value={form.property.unitNo}
                    onChange={(e) => update("property.unitNo", e.target.value)}
                    placeholder="12/34 or A-101"
                  />
                  <HelpText>เลขห้อง / ยูนิต</HelpText>
                </div>

                <div>
                  <Label>Floor</Label>
                  <Input
                    value={form.property.floor}
                    onChange={(e) => update("property.floor", e.target.value)}
                    placeholder="5"
                  />
                </div>

                <div>
                  <Label>Area (sqm)</Label>
                  <Input
                    type="number"
                    value={form.property.areaSqm}
                    onChange={(e) => update("property.areaSqm", e.target.value)}
                    placeholder="45"
                    className={errors.areaSqm ? "border-red-500" : ""}
                  />
                  <ErrorText>{errors.areaSqm}</ErrorText>
                  <HelpText>พื้นที่ใช้สอย (ตารางเมตร)</HelpText>
                </div>

                <div>
                  <Label>Parking Slots</Label>
                  <Input
                    type="number"
                    value={form.property.parkingSlots}
                    onChange={(e) => update("property.parkingSlots", e.target.value)}
                    placeholder="1"
                  />
                  <HelpText>จำนวนที่จอดรถ</HelpText>
                </div>
              </div>
            </CardContent>

            <CardFooter className="justify-between">
              <Button variant="outline" onClick={goBack}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={goNext}>Next: Terms & Rent</Button>
            </CardFooter>
          </>
        )}

        {/* ================= STEP 3: TERMS & RENT ================= */}
        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Lease Terms & Financial Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <InfoBox>
                Set the rental period and financial terms. Standard deposits are 2 months rent.
              </InfoBox>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Req>Start Date</Req>
                  <Input
                    type="date"
                    value={form.term.startDate}
                    onChange={(e) => update("term.startDate", e.target.value)}
                    className={errors.startDate ? "border-red-500" : ""}
                  />
                  <ErrorText>{errors.startDate}</ErrorText>
                  <HelpText>วันที่เริ่มสัญญา</HelpText>
                </div>

                <div>
                  <Req>End Date</Req>
                  <Input
                    type="date"
                    value={form.term.endDate}
                    onChange={(e) => update("term.endDate", e.target.value)}
                    className={errors.endDate ? "border-red-500" : ""}
                  />
                  <ErrorText>{errors.endDate}</ErrorText>
                  <HelpText>วันที่สิ้นสุดสัญญา</HelpText>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Req>Monthly Rent (THB)</Req>
                  <Input
                    type="number"
                    value={form.finance.rentAmount}
                    onChange={(e) => update("finance.rentAmount", e.target.value)}
                    placeholder="15000"
                    className={errors.rentAmount ? "border-red-500" : ""}
                  />
                  <ErrorText>{errors.rentAmount}</ErrorText>
                  <HelpText>ค่าเช่ารายเดือน (บาท)</HelpText>
                </div>

                <div>
                  <Req>Security Deposit (THB)</Req>
                  <Input
                    type="number"
                    value={form.finance.depositAmount}
                    onChange={(e) => update("finance.depositAmount", e.target.value)}
                    placeholder="30000"
                    className={errors.depositAmount ? "border-red-500" : ""}
                  />
                  <ErrorText>{errors.depositAmount}</ErrorText>
                  <HelpText>เงินประกัน (แนะนำ 2 เดือน)</HelpText>
                </div>

                <div>
                  <Req>Payment Due Day</Req>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={form.finance.dueDay}
                    onChange={(e) => update("finance.dueDay", e.target.value)}
                    placeholder="1"
                    className={errors.dueDay ? "border-red-500" : ""}
                  />
                  <ErrorText>{errors.dueDay}</ErrorText>
                  <HelpText>วันครบกำหนดชำระ (1-31)</HelpText>
                </div>
              </div>

              {form.finance.rentAmount && form.term.startDate && form.term.endDate && (
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">Contract Summary</h4>
                  <div className="text-sm space-y-1 text-slate-700">
                    <p>
                      <strong>Duration:</strong>{" "}
                      {duration
                        ? formatDurationEN(duration.years, duration.months)
                        : "-"}
                    </p>
                    <p>
                      <strong>Total Rent:</strong> ฿
                      {(
                        Number(form.finance.rentAmount) *
                        Math.ceil(
                          (new Date(form.term.endDate).getTime() -
                            new Date(form.term.startDate).getTime()) /
                            (1000 * 60 * 60 * 24 * 30)
                        )
                      ).toLocaleString()}
                    </p>
                    <p>
                      <strong>Initial Payment:</strong> ฿
                      {(
                        Number(form.finance.rentAmount) +
                        Number(form.finance.depositAmount)
                      ).toLocaleString()}{" "}
                      (Rent + Deposit)
                    </p>
                  </div>
                </div>
              )}

              {/* ===== Property Rules & Restrictions ===== */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">
                  Property Rules & Restrictions
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox
                      id="pets"
                      checked={form.rules.petsAllowed}
                      onCheckedChange={(checked) =>
                        update("rules.petsAllowed", checked)
                      }
                    />
                    <Label htmlFor="pets" className="cursor-pointer flex-1">
                      <div className="font-medium">Pets Allowed</div>
                      <div className="text-xs text-slate-500">
                        อนุญาตให้เลี้ยงสัตว์เลี้ยง
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox
                      id="smoking"
                      checked={form.rules.smokingAllowed}
                      onCheckedChange={(checked) =>
                        update("rules.smokingAllowed", checked)
                      }
                    />
                    <Label htmlFor="smoking" className="cursor-pointer flex-1">
                      <div className="font-medium">Smoking Allowed</div>
                      <div className="text-xs text-slate-500">
                        อนุญาตให้สูบบุหรี่
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox
                      id="sublease"
                      checked={form.rules.subleaseAllowed}
                      onCheckedChange={(checked) =>
                        update("rules.subleaseAllowed", checked)
                      }
                    />
                    <Label htmlFor="sublease" className="cursor-pointer flex-1">
                      <div className="font-medium">Sublease Allowed</div>
                      <div className="text-xs text-slate-500">
                        อนุญาตให้ให้เช่าช่วง
                      </div>
                    </Label>
                  </div>
                </div>
              </div>

            </CardContent>

            <CardFooter className="justify-between">
              <Button variant="outline" onClick={goBack}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={goNext}>Next: Payment Details</Button>
            </CardFooter>
          </>
        )}

        {/* ================= STEP 4: PAYMENT & RULES ================= */}
        {step === 4 && (
          <>
            <CardHeader>
              <CardTitle>Payment Method & Property Rules</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <InfoBox>
                  Provide bank details or PromptPay for rent collection.
                </InfoBox>
                {errors.payment && <ErrorText>{errors.payment}</ErrorText>}

                <div className="mt-4 space-y-3">
                  <div>
                    <Label>Bank Name</Label>
                    <Input
                      value={form.finance.payment.bankName}
                      onChange={(e) => update("finance.payment.bankName", e.target.value)}
                      placeholder="Bangkok Bank"
                    />
                  </div>

                  <div>
                    <Label>Account Name</Label>
                    <Input
                      value={form.finance.payment.accountName}
                      onChange={(e) => update("finance.payment.accountName", e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <Label>Account Number</Label>
                    <Input
                      value={form.finance.payment.accountNo}
                      onChange={(e) => update("finance.payment.accountNo", e.target.value)}
                      placeholder="123-4-56789-0"
                      className={errors.accountNo ? "border-red-500" : ""}
                    />
                    <ErrorText>{errors.accountNo}</ErrorText>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500">Or</span>
                    </div>
                  </div>

                  <div>
                    <Label>PromptPay ID</Label>
                    <Input
                      value={form.finance.payment.promptPay}
                      onChange={(e) => update("finance.payment.promptPay", e.target.value)}
                      placeholder="0812345678"
                    />
                    <HelpText>เบอร์โทร หรือ เลขบัตรประชาชน</HelpText>
                  </div>
                </div>
              </div>

          
            </CardContent>

            <CardFooter className="justify-between">
              <Button variant="outline" onClick={goBack}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={goNext}>Next: Review & Submit</Button>
            </CardFooter>
          </>
        )}

        {/* ================= STEP 5: REVIEW & SUBMIT ================= */}
        {step === 5 && (
          <>
            <CardHeader>
              <CardTitle>Termination Terms & Final Review</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Termination Conditions</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Notice Period (days)</Label>
                    <Input
                      type="number"
                      value={form.termination.noticeDays}
                      onChange={(e) => update("termination.noticeDays", e.target.value)}
                      placeholder="30"
                      className={errors.noticeDays ? "border-red-500" : ""}
                    />
                    <ErrorText>{errors.noticeDays}</ErrorText>
                    <HelpText>แจ้งล่วงหน้ากี่วันก่อนบอกเลิกสัญญา</HelpText>
                  </div>

                  <div>
                    <Label>Deposit Return (days)</Label>
                    <Input
                      type="number"
                      value={form.termination.depositReturnDays}
                      onChange={(e) =>
                        update("termination.depositReturnDays", e.target.value)
                      }
                      placeholder="30"
                      className={errors.depositReturnDays ? "border-red-500" : ""}
                    />
                    <ErrorText>{errors.depositReturnDays}</ErrorText>
                    <HelpText>คืนเงินประกันภายในกี่วัน</HelpText>
                  </div>
                </div>
              </div>

              <div>
                <Label>Additional Notes / Special Conditions</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Any additional terms, conditions, or special arrangements..."
                  rows={4}
                />
                <HelpText>
                  ข้อตกลงพิเศษ หรือเงื่อนไขเพิ่มเติม (ถ้ามี)
                </HelpText>
              </div>

              {/* Contract Summary */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  Contract Summary
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-slate-700">Parties</p>
                    <p>Landlord: {form.parties.landlord.fullName || "Not set"}</p>
                    <p>Tenant: {form.parties.tenant.fullName || "Not set"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Property</p>
                    <p>Type: {form.type}</p>
                    <p className="text-xs text-slate-600">
                      {form.property.address || "Address not set"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Financial</p>
                    <p>
                      Rent: ฿{Number(form.finance.rentAmount || 0).toLocaleString()}
                      /month
                    </p>
                    <p>
                      Deposit: ฿
                      {Number(form.finance.depositAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Duration</p>
                    <p className="text-xs">
                      {form.term.startDate || "Not set"} to{" "}
                      {form.term.endDate || "Not set"}
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please review all information carefully. Once submitted, this will
                  generate a legal rental contract.
                </AlertDescription>
              </Alert>
            </CardContent>

            <CardFooter className="justify-between">
              <Button variant="outline" onClick={goBack}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleSubmit("draft")}
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" /> Save as Draft
                </Button>
                <Button onClick={() => handleSubmit("active")} disabled={loading}>
                  <Send className="mr-2 h-4 w-4" /> Create Contract
                </Button>
              </div>
            </CardFooter>
          </>
        )}
      </Card>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>
                {submitType === "draft" ? "Save as Draft?" : "Create Contract?"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                {submitType === "draft"
                  ? "This will save your progress. You can continue editing later."
                  : "This will create an active rental contract. Make sure all information is correct."}
              </p>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={confirmSubmit} disabled={loading}>
                {loading ? "Processing..." : "Confirm"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}